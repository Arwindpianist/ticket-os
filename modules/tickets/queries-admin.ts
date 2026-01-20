import { createServiceRoleClient } from "@/lib/supabase/server";
import { Ticket, TicketWithDetails } from "./types";
import { TicketStatus, TicketPriority } from "@/types/database";

/**
 * Get all tickets across all tenants (admin only)
 */
export async function getAllTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  tenant_id?: string;
}): Promise<Ticket[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.tenant_id) {
    query = query.eq("tenant_id", filters.tenant_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`);
  }

  return data || [];
}

/**
 * Get ticket by ID without tenant restriction (admin only)
 */
export async function getTicketByIdAdmin(
  ticketId: string
): Promise<TicketWithDetails | null> {
  const supabase = createServiceRoleClient();
  
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError) {
    if (ticketError.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch ticket: ${ticketError.message}`);
  }

  if (!ticket) {
    return null;
  }

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(`Failed to fetch messages: ${messagesError.message}`);
  }

  // Fetch attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .from("ticket_attachments")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (attachmentsError) {
    throw new Error(`Failed to fetch attachments: ${attachmentsError.message}`);
  }

  // Fetch author info
  const { data: author } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("id", ticket.created_by)
    .single();

  return {
    ...ticket,
    messages: messages || [],
    attachments: attachments || [],
    author: author || undefined,
  };
}
