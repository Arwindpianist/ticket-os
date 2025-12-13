"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedPage } from "@/components/animated-page";
import { PasswordStrength } from "@/components/password-strength";
import { validatePassword } from "@/lib/password-validation";
import { clearPasswordChangeFlag } from "@/modules/users/server";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mustChange, setMustChange] = useState(false);

  useEffect(() => {
    // Check if user must change password
    const checkPasswordStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check profile for must_change_password flag
      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", user.id)
        .single();

      if (profile?.must_change_password) {
        setMustChange(true);
      } else {
        // If not required, redirect to appropriate dashboard
        router.push("/workspace");
      }
    };

    checkPasswordStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(`Password requirements not met: ${passwordValidation.errors.join(", ")}`);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Get user ID
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      
      if (!updatedUser) {
        throw new Error("Failed to get user after password change");
      }

      // Update profile to clear must_change_password flag using server action
      try {
        await clearPasswordChangeFlag(updatedUser.id);
      } catch (profileError: any) {
        console.error("Failed to update profile:", profileError);
        // Show error to user but still allow redirect attempt
        setError(`Password changed, but failed to update profile: ${profileError.message}. Please contact support.`);
        setLoading(false);
        return;
      }

      // Get profile to determine redirect destination
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", updatedUser.id)
        .single();

      // Use window.location for a hard redirect to ensure middleware runs
      if (profile?.role === "super_admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/workspace";
      }
    } catch (err: any) {
      setError(err.message || "Failed to change password");
      setLoading(false);
    }
  };

  if (!mustChange) {
    return null; // Will redirect
  }

  return (
    <AnimatedPage>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-border/30 bg-card shadow-depth-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Change Password Required</CardTitle>
            <CardDescription>
              You must change your password before continuing. This is required for security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <PasswordStrength password={newPassword} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}

