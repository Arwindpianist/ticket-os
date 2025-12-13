import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Ticket, TicketWithDetails, TicketStatus, TicketPriority } from "./types";

export async function getTickets(
  tenantId: string,
  filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    created_by?: string;
  }
): Promise<Ticket[]> {
  const supabase = createClient();
  let query = supabase
    .from("tickets")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.created_by) {
    query = query.eq("created_by", filters.created_by);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`);
  }

  return data || [];
}

export async function getTicketById(
  ticketId: string,
  tenantId: string
): Promise<TicketWithDetails | null> {
  const supabase = createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .eq("tenant_id", tenantId)
    .single();

  if (ticketError) {
    if (ticketError.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch ticket: ${ticketError.message}`);
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

