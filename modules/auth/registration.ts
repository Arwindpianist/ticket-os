"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { ValidationError } from "@/lib/errors";

export interface RegisterAdminInput {
  email: string;
  password: string;
  confirmPassword: string;
}

export async function checkAdminExists(): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "super_admin")
    .limit(1);

  if (error) {
    console.error("Error checking admin existence:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function registerSuperAdmin(input: RegisterAdminInput): Promise<void> {
  // Validate input
  if (!input.email || !input.password) {
    throw new ValidationError("Email and password are required");
  }

  // Complex password validation
  const passwordErrors: string[] = [];

  if (input.password.length < 12) {
    passwordErrors.push("Password must be at least 12 characters");
  }

  if (!/[A-Z]/.test(input.password)) {
    passwordErrors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(input.password)) {
    passwordErrors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(input.password)) {
    passwordErrors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(input.password)) {
    passwordErrors.push("Password must contain at least one special character");
  }

  // Check for common patterns
  const commonPatterns = [
    /123/,
    /abc/,
    /qwerty/,
    /password/i,
    /admin/i,
    /letmein/i,
  ];
  if (commonPatterns.some((pattern) => pattern.test(input.password))) {
    passwordErrors.push("Password cannot contain common patterns");
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(input.password)) {
    passwordErrors.push("Password cannot contain repeated characters (e.g., aaa, 111)");
  }

  if (passwordErrors.length > 0) {
    throw new ValidationError(passwordErrors.join(". "));
  }

  if (input.password !== input.confirmPassword) {
    throw new ValidationError("Passwords do not match");
  }

  // Check if admin already exists
  const adminExists = await checkAdminExists();
  if (adminExists) {
    throw new ValidationError(
      "A super admin already exists. Please contact the existing admin for access."
    );
  }

  const supabase = createServiceRoleClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true, // Auto-confirm email for admin
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Failed to create user: No user data returned");
  }

  // Create profile with super_admin role
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: input.email,
    role: "super_admin",
    tenant_id: null, // Super admin has no tenant
  });

  if (profileError) {
    // Rollback: delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Verify profile was created successfully
  const { data: verifyProfile, error: verifyError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .single();

  if (verifyError || !verifyProfile) {
    // Rollback: delete the auth user if profile verification fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to verify profile creation: ${verifyError?.message || "Profile not found"}`);
  }

  if (verifyProfile.role !== "super_admin") {
    // Rollback: delete the auth user if role is incorrect
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error("Profile was created with incorrect role");
  }
}

