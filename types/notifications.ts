export interface NotificationTemplate {
  subject: string;
  body: string;
}

export interface SendNotificationInput {
  to: string;
  subject: string;
  body: string;
  tenantId?: string;
}

