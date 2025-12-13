import { TicketStatus, TicketPriority } from "./database";

export interface Ticket {
  id: string;
  tenant_id: string;
  created_by: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_internal_note: boolean;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  message_id: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface TicketWithDetails extends Ticket {
  messages: TicketMessage[];
  attachments: TicketAttachment[];
  author?: {
    id: string;
    email: string;
  };
}

export interface CreateTicketInput {
  title: string;
  priority?: TicketPriority;
  initial_message?: string;
  contract_item_id?: string | null;
}

export interface UpdateTicketInput {
  title?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface CreateTicketMessageInput {
  content: string;
  is_internal_note?: boolean;
}

