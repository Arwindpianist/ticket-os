"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireTenantContext } from "@/modules/auth/server";
import { requireNotImpersonating } from "@/modules/auth/readonly";
import { NotFoundError } from "@/lib/errors";
import {
  CreateTicketInput,
  UpdateTicketInput,
  CreateTicketMessageInput,
  Ticket,
  TicketWithDetails,
} from "./types";
import { TicketStatus, TicketPriority } from "@/types/database";
import * as queries from "./queries";
import {
  validateStatusTransition,
  validateTicketTitle,
  validateMessageContent,
} from "./validation";
import { logActivity } from "@/modules/activity/server";
import {
  sendTicketNotification,
  sendCommentNotification,
  sendAdminTicketNotification,
} from "@/modules/notifications/server";
import { getTenantUserEmails, getUserEmail } from "@/modules/notifications/helpers";
import { getTenantById } from "@/modules/tenants/queries";

export async function createTicket(
  input: CreateTicketInput
): Promise<Ticket> {
  await requireNotImpersonating(); // Read-only during impersonation
  const session = await requireAuth();
  const tenantId = await requireTenantContext();

  validateTicketTitle(input.title);

  const supabase = await createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      tenant_id: tenantId,
      created_by: session.user.id,
      title: input.title,
      status: "open",
      priority: input.priority || "medium",
      contract_item_id: input.contract_item_id || null,
    })
    .select()
    .single();

  if (ticketError) {
    throw new Error(`Failed to create ticket: ${ticketError.message}`);
  }

  // Create initial message if provided
  if (input.initial_message) {
    validateMessageContent(input.initial_message);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      author_id: session.user.id,
      content: input.initial_message,
      is_internal_note: false,
    });
  }

  // Log activity
  await logActivity({
    tenantId,
    userId: session.user.id,
    actionType: "ticket_created",
    entityType: "ticket",
    entityId: ticket.id,
    metadata: { title: ticket.title, priority: ticket.priority },
  });

  // Send notifications to all tenant users (except creator)
  try {
    const recipientEmails = await getTenantUserEmails(tenantId, session.user.id);
    await Promise.all(
      recipientEmails.map((email) =>
        sendTicketNotification(
          tenantId,
          "created",
          ticket.id,
          ticket.title,
          email
        )
      )
    );
  } catch (error) {
    // Don't fail ticket creation if notifications fail
    console.error("Failed to send ticket creation notifications:", error);
  }

  // Send admin notification to hello@arwindpianist.com with full ticket details
  try {
    const tenant = await getTenantById(tenantId);
    const tenantName = tenant?.name || "Unknown Tenant";
    const creatorEmail = await getUserEmail(session.user.id) || "Unknown";
    
    await sendAdminTicketNotification(
      tenantId,
      tenantName,
      ticket.id,
      ticket.title,
      ticket.priority,
      ticket.status,
      creatorEmail,
      input.initial_message
    );
  } catch (error) {
    // Don't fail ticket creation if admin notification fails
    console.error("Failed to send admin ticket notification:", error);
  }

  return ticket;
}

export async function getTicket(
  ticketId: string
): Promise<TicketWithDetails | null> {
  const tenantId = await requireTenantContext();
  return queries.getTicketById(ticketId, tenantId);
}

export async function getTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
}): Promise<Ticket[]> {
  const tenantId = await requireTenantContext();
  return queries.getTickets(tenantId, filters);
}

export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput
): Promise<Ticket> {
  await requireNotImpersonating(); // Read-only during impersonation
  const session = await requireAuth();
  const tenantId = await requireTenantContext();

  const existing = await queries.getTicketById(ticketId, tenantId);
  if (!existing) {
    throw new NotFoundError("Ticket not found");
  }

  // Validate status transition if status is being changed
  if (input.status && input.status !== existing.status) {
    validateStatusTransition(existing.status, input.status);
  }

  // Validate title if provided
  if (input.title) {
    validateTicketTitle(input.title);
  }

  const supabase = createClient();
  const updateData: any = {};
  if (input.title) updateData.title = input.title;
  if (input.status) updateData.status = input.status;
  if (input.priority) updateData.priority = input.priority;

  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", ticketId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`);
  }

  // Log activity
  const metadata: any = {};
  if (input.status && input.status !== existing.status) {
    metadata.status_change = { from: existing.status, to: input.status };
  }
  if (input.priority && input.priority !== existing.priority) {
    metadata.priority_change = { from: existing.priority, to: input.priority };
  }

  await logActivity({
    tenantId,
    userId: session.user.id,
    actionType: "ticket_updated",
    entityType: "ticket",
    entityId: ticketId,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });

  // Send notifications if status changed
  if (input.status && input.status !== existing.status) {
    try {
      const recipientEmails = await getTenantUserEmails(tenantId, session.user.id);
      await Promise.all(
        recipientEmails.map((email) =>
          sendTicketNotification(
            tenantId,
            "updated",
            ticketId,
            data.title,
            email,
            input.status
          )
        )
      );
    } catch (error) {
      // Don't fail ticket update if notifications fail
      console.error("Failed to send ticket update notifications:", error);
    }
  }

  return data;
}

export async function addTicketMessage(
  ticketId: string,
  input: CreateTicketMessageInput
): Promise<void> {
  await requireNotImpersonating(); // Read-only during impersonation
  const session = await requireAuth();
  const tenantId = await requireTenantContext();

  const ticket = await queries.getTicketById(ticketId, tenantId);
  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  validateMessageContent(input.content);

  // Only admins can create internal notes
  if (input.is_internal_note && session.user.role === "tenant_user") {
    throw new Error("Only admins can create internal notes");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_id: session.user.id,
    content: input.content,
    is_internal_note: input.is_internal_note || false,
  });

  if (error) {
    throw new Error(`Failed to add message: ${error.message}`);
  }

  // Log activity
  await logActivity({
    tenantId,
    userId: session.user.id,
    actionType: "message_added",
    entityType: "ticket",
    entityId: ticketId,
    metadata: { is_internal_note: input.is_internal_note || false },
  });

  // Send notifications for non-internal messages
  if (!input.is_internal_note) {
    try {
      const authorEmail = await getUserEmail(session.user.id);
      if (authorEmail) {
        // Get all tenant users except the message author
        const recipientEmails = await getTenantUserEmails(tenantId, session.user.id);
        await Promise.all(
          recipientEmails.map((email) =>
            sendCommentNotification(
              tenantId,
              ticketId,
              ticket.title,
              authorEmail,
              email
            )
          )
        );
      }
    } catch (error) {
      // Don't fail message creation if notifications fail
      console.error("Failed to send comment notifications:", error);
    }
  }
}

