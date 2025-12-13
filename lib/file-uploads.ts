import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface UploadFileInput {
  file: File;
  bucket: string;
  path: string;
  tenantId: string;
}

export async function uploadFile(input: UploadFileInput): Promise<string> {
  const supabase = createServiceRoleClient();

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(input.bucket)
    .upload(`${input.tenantId}/${input.path}`, input.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(input.bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function uploadTicketAttachment(
  file: File,
  ticketId: string,
  tenantId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const path = `tickets/${ticketId}/${fileName}`;

  return uploadFile({
    file,
    bucket: "attachments",
    path,
    tenantId,
  });
}

export async function uploadContractPDF(
  file: File,
  contractId: string,
  tenantId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const path = `contracts/${contractId}/${fileName}`;

  return uploadFile({
    file,
    bucket: "contracts",
    path,
    tenantId,
  });
}

