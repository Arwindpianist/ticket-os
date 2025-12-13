export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "super_admin" | "tenant_admin" | "tenant_user";

export type TicketStatus = "open" | "in_progress" | "waiting" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          tenant_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: UserRole;
          tenant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          tenant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_branding: {
        Row: {
          id: string;
          tenant_id: string;
          logo_url: string | null;
          primary_color: string;
          accent_color: string;
          dashboard_title: string;
          welcome_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          logo_url?: string | null;
          primary_color: string;
          accent_color: string;
          dashboard_title: string;
          welcome_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          dashboard_title?: string;
          welcome_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_features: {
        Row: {
          id: string;
          tenant_id: string;
          tickets_enabled: boolean;
          contracts_enabled: boolean;
          file_uploads_enabled: boolean;
          activity_feed_enabled: boolean;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          tickets_enabled?: boolean;
          contracts_enabled?: boolean;
          file_uploads_enabled?: boolean;
          activity_feed_enabled?: boolean;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          tickets_enabled?: boolean;
          contracts_enabled?: boolean;
          file_uploads_enabled?: boolean;
          activity_feed_enabled?: boolean;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          tenant_id: string;
          created_by: string;
          title: string;
          status: TicketStatus;
          priority: TicketPriority;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          created_by: string;
          title: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          created_by?: string;
          title?: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          author_id: string;
          content: string;
          is_internal_note: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          author_id: string;
          content: string;
          is_internal_note?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          author_id?: string;
          content?: string;
          is_internal_note?: boolean;
          created_at?: string;
        };
      };
      ticket_attachments: {
        Row: {
          id: string;
          ticket_id: string;
          message_id: string | null;
          file_url: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          message_id?: string | null;
          file_url: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          message_id?: string | null;
          file_url?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          summary: Json;
          pdf_url: string | null;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          title: string;
          summary: Json;
          pdf_url?: string | null;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          summary?: Json;
          pdf_url?: string | null;
          start_date?: string;
          end_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          action_type: string;
          entity_type: string;
          entity_id: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          action_type: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          action_type?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}

