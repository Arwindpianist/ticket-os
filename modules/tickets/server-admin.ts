"use server";

import { requireSuperAdmin } from "@/modules/auth/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";
import {
  UpdateTicketInput,
  CreateTicketMessageInput,
  Ticket,
  TicketWithDetails,
} from "./types";
import * as queries from "./queries-admin";
import {
  validateStatusTransition,
  validateMessageContent,
} from "./validation";
import { logActivity } from "@/modules/activity/server";
import { uploadTicketAttachment } from "@/lib/file-uploads";

/**
 * Get all tickets across all tenants (admin only)
 * Note: Auth check removed - client-side AuthGuard handles authentication
 */
export async function getAllTicketsAdmin(filters?: {
  status?: string;
  priority?: string;
  tenant_id?: string;
}): Promise<Ticket[]> {
  // Auth check removed - client-side AuthGuard handles authentication
  return queries.getAllTickets(filters as any);
}

/**
 * Get ticket by ID without tenant restriction (admin only)
 * Note: Auth check removed - client-side AuthGuard handles authentication
 */
export async function getTicketByIdAdmin(
  ticketId: string
): Promise<TicketWithDetails | null> {
  // Auth check removed - client-side AuthGuard handles authentication
  return queries.getTicketByIdAdmin(ticketId);
}

/**
 * Update ticket (admin can update any ticket)
 */
export async function updateTicketAdmin(
  ticketId: string,
  input: UpdateTicketInput
): Promise<Ticket> {
  await requireSuperAdmin();
  const session = await requireSuperAdmin();

  const existing = await queries.getTicketByIdAdmin(ticketId);
  if (!existing) {
    throw new NotFoundError("Ticket not found");
  }

  // Validate status transition if status is being changed
  if (input.status && input.status !== existing.status) {
    validateStatusTransition(existing.status, input.status);
  }

  const supabase = createServiceRoleClient();
  const updateData: any = {};
  
  if (input.title) updateData.title = input.title;
  if (input.status) updateData.status = input.status;
  if (input.priority) updateData.priority = input.priority;

  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", ticketId)
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
    tenantId: existing.tenant_id,
    userId: session.user.id,
    actionType: "ticket_updated",
    entityType: "ticket",
    entityId: ticketId,
    metadata,
  });

  return data;
}

/**
 * Add message to ticket (admin can add messages to any ticket)
 */
export async function addTicketMessageAdmin(
  ticketId: string,
  input: CreateTicketMessageInput
): Promise<void> {
  await requireSuperAdmin();
  const session = await requireSuperAdmin();

  validateMessageContent(input.content);

  const ticket = await queries.getTicketByIdAdmin(ticketId);
  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  const supabase = createServiceRoleClient();
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
    tenantId: ticket.tenant_id,
    userId: session.user.id,
    actionType: "ticket_message_added",
    entityType: "ticket",
    entityId: ticketId,
  });
}

/**
 * Upload file to ticket (admin can upload to any ticket)
 */
export async function uploadTicketFileAdmin(
  ticketId: string,
  formData: FormData
): Promise<{ id: string; file_url: string; file_name: string }> {
  await requireSuperAdmin();
  const session = await requireSuperAdmin();
  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("No file provided");
  }

  // Verify ticket exists
  const ticket = await queries.getTicketByIdAdmin(ticketId);
  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  // Upload file to storage
  const fileUrl = await uploadTicketAttachment(file, ticketId, ticket.tenant_id);

  // Save attachment record to database
  const supabase = createServiceRoleClient();
  const { data: attachment, error } = await supabase
    .from("ticket_attachments")
    .insert({
      ticket_id: ticketId,
      message_id: null,
      file_url: fileUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: session.user.id,
    })
    .select("id, file_url, file_name")
    .single();

  if (error || !attachment) {
    throw new Error(`Failed to create attachment: ${error?.message || "Unknown error"}`);
  }

  // Log activity
  await logActivity({
    tenantId: ticket.tenant_id,
    userId: session.user.id,
    actionType: "ticket_attachment_added",
    entityType: "ticket",
    entityId: ticketId,
    metadata: { file_name: file.name, file_size: file.size },
  });

  return attachment;
}
