"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireTenantContext } from "@/modules/auth/server";
import { requireNotImpersonating } from "@/modules/auth/readonly";
import { isFeatureEnabled } from "@/modules/features/server";
import { NotFoundError } from "@/lib/errors";
import { uploadTicketAttachment } from "@/lib/file-uploads";
import { logActivity } from "@/modules/activity/server";

export async function uploadTicketFile(
  ticketId: string,
  formData: FormData
): Promise<{ id: string; file_url: string; file_name: string }> {
  await requireNotImpersonating(); // Read-only during impersonation
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }
  const session = await requireAuth();
  const tenantId = await requireTenantContext();

  // Check if file uploads are enabled
  const fileUploadsEnabled = await isFeatureEnabled("file_uploads_enabled", tenantId);
  if (!fileUploadsEnabled) {
    throw new Error("File uploads are not enabled for your tenant");
  }

  // Verify ticket exists and belongs to tenant
  const supabase = createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, title")
    .eq("id", ticketId)
    .eq("tenant_id", tenantId)
    .single();

  if (ticketError || !ticket) {
    throw new NotFoundError("Ticket not found");
  }

  // Upload file to storage
  const fileUrl = await uploadTicketAttachment(file, ticketId, tenantId);

  // Save attachment record to database
  const { data: attachment, error: attachmentError } = await supabase
    .from("ticket_attachments")
    .insert({
      ticket_id: ticketId,
      message_id: null, // Can be linked to a message later if needed
      file_url: fileUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: session.user.id,
    })
    .select()
    .single();

  if (attachmentError) {
    throw new Error(`Failed to save attachment: ${attachmentError.message}`);
  }

  // Log activity
  await logActivity({
    tenantId,
    userId: session.user.id,
    actionType: "file_uploaded",
    entityType: "ticket",
    entityId: ticketId,
    metadata: { file_name: file.name, file_size: file.size },
  });

  return {
    id: attachment.id,
    file_url: attachment.file_url,
    file_name: attachment.file_name,
  };
}

export async function deleteTicketAttachment(attachmentId: string): Promise<void> {
  await requireNotImpersonating(); // Read-only during impersonation
  const session = await requireAuth();
  const tenantId = await requireTenantContext();

  // Verify attachment exists and belongs to tenant
  const supabase = createClient();
  const { data: attachment, error: fetchError } = await supabase
    .from("ticket_attachments")
    .select("ticket_id, tickets!inner(tenant_id)")
    .eq("id", attachmentId)
    .single();

  if (fetchError || !attachment) {
    throw new NotFoundError("Attachment not found");
  }

      // Verify tenant access
      const ticket = attachment.tickets as unknown as { tenant_id: string };
      if (ticket.tenant_id !== tenantId) {
        throw new Error("Access denied");
      }

  // Delete attachment (Note: This doesn't delete from storage - consider adding cleanup)
  const { error: deleteError } = await supabase
    .from("ticket_attachments")
    .delete()
    .eq("id", attachmentId);

  if (deleteError) {
    throw new Error(`Failed to delete attachment: ${deleteError.message}`);
  }

  // Log activity
  await logActivity({
    tenantId,
    userId: session.user.id,
    actionType: "file_deleted",
    entityType: "ticket",
    entityId: attachment.ticket_id,
    metadata: { attachment_id: attachmentId },
  });
}

