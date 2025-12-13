import { getTenantBranding } from "@/modules/branding/queries";
import { NotificationTemplate } from "./types";

function getPortalUrl(): string {
  return process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.arwindpianist.com";
}

function getEmailTemplate(header: string, content: string, actionUrl?: string, actionText?: string): string {
  const portalUrl = getPortalUrl();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #1e293b;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content {
            color: #475569;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0f172a;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${header}</h1>
          <div class="content">
            ${content}
          </div>
          ${actionUrl && actionText ? `
            <a href="${actionUrl}" class="button">${actionText}</a>
          ` : ''}
          <div class="footer">
            <p>This is an automated notification from Ticket OS.</p>
            <p>If you have any questions, please contact your administrator.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function getTicketCreatedTemplate(
  tenantId: string,
  ticketTitle: string,
  ticketId: string
): Promise<NotificationTemplate> {
  const branding = await getTenantBranding(tenantId);
  const dashboardTitle = branding?.dashboard_title || "Ticket OS";
  const portalUrl = getPortalUrl();
  const ticketUrl = `${portalUrl}/workspace/tickets/${ticketId}`;

  return {
    subject: `New Ticket Created: ${ticketTitle}`,
    body: getEmailTemplate(
      "New Ticket Created",
      `
        <p>A new ticket has been created in <strong>${dashboardTitle}</strong>.</p>
        <p><strong>Ticket:</strong> ${ticketTitle}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p>You can view and respond to this ticket in your dashboard.</p>
      `,
      ticketUrl,
      "View Ticket"
    ),
  };
}

export async function getTicketUpdatedTemplate(
  tenantId: string,
  ticketTitle: string,
  ticketId: string,
  status: string
): Promise<NotificationTemplate> {
  const branding = await getTenantBranding(tenantId);
  const dashboardTitle = branding?.dashboard_title || "Ticket OS";
  const portalUrl = getPortalUrl();
  const ticketUrl = `${portalUrl}/workspace/tickets/${ticketId}`;

  return {
    subject: `Ticket Updated: ${ticketTitle}`,
    body: getEmailTemplate(
      "Ticket Updated",
      `
        <p>A ticket has been updated in <strong>${dashboardTitle}</strong>.</p>
        <p><strong>Ticket:</strong> ${ticketTitle}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p>You can view the updated ticket in your dashboard.</p>
      `,
      ticketUrl,
      "View Ticket"
    ),
  };
}

export async function getMessageAddedTemplate(
  tenantId: string,
  ticketTitle: string,
  ticketId: string,
  authorEmail: string
): Promise<NotificationTemplate> {
  const branding = await getTenantBranding(tenantId);
  const dashboardTitle = branding?.dashboard_title || "Ticket OS";
  const portalUrl = getPortalUrl();
  const ticketUrl = `${portalUrl}/workspace/tickets/${ticketId}`;

  return {
    subject: `New Message on Ticket: ${ticketTitle}`,
    body: getEmailTemplate(
      "New Message",
      `
        <p>A new message has been added to a ticket in <strong>${dashboardTitle}</strong>.</p>
        <p><strong>Ticket:</strong> ${ticketTitle}</p>
        <p><strong>From:</strong> ${authorEmail}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p>You can view and respond to this message in your dashboard.</p>
      `,
      ticketUrl,
      "View Ticket"
    ),
  };
}

