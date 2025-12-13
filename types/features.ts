export interface TenantFeatures {
  id: string;
  tenant_id: string;
  tickets_enabled: boolean;
  contracts_enabled: boolean;
  file_uploads_enabled: boolean;
  activity_feed_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateFeaturesInput {
  tickets_enabled?: boolean;
  contracts_enabled?: boolean;
  file_uploads_enabled?: boolean;
  activity_feed_enabled?: boolean;
  notifications_enabled?: boolean;
}

