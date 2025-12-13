"use server";

import nodemailer from "nodemailer";
import { isFeatureEnabled } from "@/modules/features/server";
import { SendNotificationInput } from "./types";
import {
  getTicketCreatedTemplate,
  getTicketUpdatedTemplate,
  getMessageAddedTemplate,
} from "./templates";

// Get the portal URL from environment or use default
function getPortalUrl(): string {
  return process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.arwindpianist.com";
}

// Create Zoho SMTP transporter
// Note: You authenticate with your own Zoho account, but can send FROM ticket@arwindpianist.com
// if it's an alias or you have permission to send on behalf of that address
function createTransporter() {
  const smtpHost = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com";
  const smtpPort = parseInt(process.env.ZOHO_SMTP_PORT || "587");
  // This should be YOUR Zoho email (the one you authenticate with)
  const smtpUser = process.env.ZOHO_SMTP_USER;
  const smtpPassword = process.env.ZOHO_SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

async function sendEmail(input: SendNotificationInput): Promise<void> {
  const transporter = createTransporter();
  
  // If SMTP is not configured, log and return (graceful degradation)
  if (!transporter) {
    console.warn("Zoho SMTP not configured. Email notification skipped:", {
      to: input.to,
      subject: input.subject,
    });
    return;
  }

  try {
    // All emails are sent FROM ticket@arwindpianist.com
    // This works if ticket@arwindpianist.com is an alias of your account
    // or if you have permission to send on behalf of that address
    const fromEmail = process.env.ZOHO_FROM_EMAIL || "ticket@arwindpianist.com";
    
    await transporter.sendMail({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.body,
    });

    console.log("Email notification sent successfully:", {
      to: input.to,
      subject: input.subject,
    });
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break the main operation
    console.error("Failed to send email notification:", error);
  }
}

export async function sendTicketNotification(
  tenantId: string,
  type: "created" | "updated",
  ticketId: string,
  ticketTitle: string,
  recipientEmail: string,
  status?: string
): Promise<void> {
  // Check if notifications are enabled
  const notificationsEnabled = await isFeatureEnabled("notifications_enabled", tenantId);
  if (!notificationsEnabled) {
    return;
  }

  let template;
  if (type === "created") {
    template = await getTicketCreatedTemplate(tenantId, ticketTitle, ticketId);
  } else {
    template = await getTicketUpdatedTemplate(tenantId, ticketTitle, ticketId, status || "");
  }

  await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    body: template.body,
    tenantId,
  });
}

export async function sendCommentNotification(
  tenantId: string,
  ticketId: string,
  ticketTitle: string,
  authorEmail: string,
  recipientEmail: string
): Promise<void> {
  // Check if notifications are enabled
  const notificationsEnabled = await isFeatureEnabled("notifications_enabled", tenantId);
  if (!notificationsEnabled) {
    return;
  }

  const template = await getMessageAddedTemplate(tenantId, ticketTitle, ticketId, authorEmail);

  await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    body: template.body,
    tenantId,
  });
}

