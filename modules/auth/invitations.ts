"use server";

import nodemailer from "nodemailer";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireTenantAdmin } from "@/modules/auth/server";
import { ValidationError } from "@/lib/errors";

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

export interface InviteUserInput {
  email: string;
  role: "tenant_admin" | "tenant_user";
  tenantId: string;
}

export async function inviteUser(input: InviteUserInput): Promise<void> {
  // Allow tenant_admin or super_admin to invite users
  const session = await requireTenantAdmin();

  // Use session tenant_id if not provided (for tenant admins)
  const tenantId = input.tenantId || session.user.tenant_id;

  // If not super_admin, ensure they're inviting to their own tenant
  if (session.user.role !== "super_admin" && session.user.tenant_id !== tenantId) {
    throw new Error("You can only invite users to your own tenant");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new ValidationError("Invalid email address");
  }

  // Validate role
  if (input.role !== "tenant_admin" && input.role !== "tenant_user") {
    throw new ValidationError("Invalid role");
  }

  // Check if user already exists
  const supabase = createServiceRoleClient();
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", input.email)
    .single();

  if (existingUser) {
    throw new ValidationError("User with this email already exists");
  }

  // Create auth user (unconfirmed, will need to set password)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    email_confirm: false, // User will confirm via password reset
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Failed to create user: No user data returned");
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: input.email,
    role: input.role,
    tenant_id: tenantId,
  });

  if (profileError) {
    // Rollback: delete auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Generate password reset link for invitation
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.arwindpianist.com";
  const { data: linkData, error: resetError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: input.email,
    options: {
      redirectTo: `${portalUrl}/auth/set-password`,
    },
  });

  if (resetError || !linkData) {
    console.error("Failed to generate password reset link:", resetError);
    // Don't throw - user is created, they can request password reset manually
    return;
  }

  // Send custom invitation email via Zoho
  await sendInvitationEmail(input.email, input.role, linkData.properties.action_link);
}

async function sendInvitationEmail(
  email: string,
  role: string,
  setupLink: string
): Promise<void> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn("Zoho SMTP not configured. Invitation email skipped:", email);
    return;
  }

  const roleDisplay = role === "tenant_admin" ? "Tenant Admin" : "Tenant User";

  try {
    // All emails are sent FROM ticket@arwindpianist.com
    // This works if ticket@arwindpianist.com is an alias of your account
    // or if you have permission to send on behalf of that address
    const fromEmail = process.env.ZOHO_FROM_EMAIL || "ticket@arwindpianist.com";
    
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Invitation to Ticket OS",
      html: `
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
              <h1>You've been invited to Ticket OS</h1>
              <div class="content">
                <p>You have been invited to join Ticket OS as a <strong>${roleDisplay}</strong>.</p>
                <p>Click the button below to set up your account and create your password:</p>
                <a href="${setupLink}" class="button">Set Up Account</a>
                <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                  Or copy and paste this link into your browser:<br>
                  ${setupLink}
                </p>
              </div>
              <div class="footer">
                <p>This invitation link will expire in 24 hours.</p>
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", email);
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    // Don't throw - email failure shouldn't break user creation
  }
}

