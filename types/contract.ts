import { Json } from "./database";

export interface Contract {
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
}

export interface CreateContractInput {
  tenant_id: string;
  title: string;
  summary: Json;
  pdf_url?: string | null;
  start_date: string;
  end_date: string;
}

export interface UpdateContractInput {
  title?: string;
  summary?: Json;
  pdf_url?: string | null;
  start_date?: string;
  end_date?: string;
}

