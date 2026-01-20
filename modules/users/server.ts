"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/modules/auth/server";
import { ValidationError } from "@/lib/errors";
import { randomBytes } from "crypto";

export interface CreateUserInput {
  email: string;
  role: "super_admin" | "tenant_admin" | "tenant_user";
  tenantId?: string | null;
}

export interface CreateUserResult {
  userId: string;
  email: string;
  password: string;
  role: string;
  tenantId: string | null;
}

export interface User {
  id: string;
  email: string;
  role: string;
  tenant_id: string | null;
  must_change_password: boolean;
  created_at: string;
}

/**
 * Generate a secure random password
 */
function generatePassword(): string {
  // Generate a 16-character password with mixed case, numbers, and special chars
  const length = 16;
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(length);
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  
  // Ensure at least one of each required type
  if (!/[A-Z]/.test(password)) {
    password = password.slice(0, -1) + "A";
  }
  if (!/[a-z]/.test(password)) {
    password = password.slice(0, -1) + "a";
  }
  if (!/[0-9]/.test(password)) {
    password = password.slice(0, -1) + "2";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    password = password.slice(0, -1) + "!";
  }
  
  return password;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  await requireSuperAdmin();

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new ValidationError("Invalid email address");
  }

  // Validate role
  if (!["super_admin", "tenant_admin", "tenant_user"].includes(input.role)) {
    throw new ValidationError("Invalid role");
  }

  // Tenant users must have tenant_id (super admins can optionally have tenant_id)
  if (input.role !== "super_admin" && !input.tenantId) {
    throw new ValidationError("Tenant admin and tenant user must be assigned to a tenant");
  }

  const supabase = createServiceRoleClient();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", input.email)
    .single();

  if (existingUser) {
    throw new ValidationError("User with this email already exists");
  }

  // Generate password
  const password = generatePassword();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: password,
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Failed to create user: No user data returned");
  }

  // Create profile with must_change_password flag
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: input.email,
    role: input.role,
    tenant_id: input.tenantId || null,
    must_change_password: true, // Force password change on first login
  });

  if (profileError) {
    // Rollback: delete auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  return {
    userId: authData.user.id,
    email: input.email,
    password: password,
    role: input.role,
    tenantId: input.tenantId || null,
  };
}

export async function getAllUsers(): Promise<User[]> {
  await requireSuperAdmin();
  
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, tenant_id, must_change_password, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data || [];
}

export async function updateUserTenant(userId: string, tenantId: string | null): Promise<void> {
  await requireSuperAdmin();
  
  const supabase = createServiceRoleClient();
  
  // Get user to check role
  const { data: user } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!user) {
    throw new ValidationError("User not found");
  }

  // Tenant users must have tenant_id (super admins can optionally have tenant_id)
  if (user.role !== "super_admin" && !tenantId) {
    throw new ValidationError("Tenant admin and tenant user must be assigned to a tenant");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ tenant_id: tenantId })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user tenant: ${error.message}`);
  }
}

export async function clearPasswordChangeFlag(userId: string): Promise<void> {
  // Allow any authenticated user to clear their own password change flag
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new ValidationError("You can only clear your own password change flag");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      must_change_password: false,
      password_changed_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await requireSuperAdmin();
  
  const supabase = createServiceRoleClient();
  
  // Get user to check if they exist
  const { data: user } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (!user) {
    throw new ValidationError("User not found");
  }

  // Prevent deleting yourself
  const session = await requireSuperAdmin();
  if (user.id === session.user.id) {
    throw new ValidationError("You cannot delete your own account");
  }

  // Delete profile first (cascade should handle related data)
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    throw new Error(`Failed to delete user profile: ${profileError.message}`);
  }

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    // Log error but don't throw - profile is already deleted
    console.error(`Failed to delete auth user: ${authError.message}`);
  }
}

