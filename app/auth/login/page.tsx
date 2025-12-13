"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { motion } from "framer-motion";
import { EmailGreeting } from "@/components/email-greeting";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setRegistered(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRegistered(false);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Failed to sign in. Please try again.");
      setLoading(false);
      return;
    }

    // Wait a moment for the session to be fully established
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Fetch user role from server-side API route (bypasses RLS timing issues)
    // Retry up to 3 times with delays
    let role = null;
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch("/auth/get-user-role");
        
        if (response.ok) {
          const data = await response.json();
          role = data.role;
          break;
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.error || `HTTP ${response.status}`;
        }
      } catch (err: any) {
        lastError = err.message || "Network error";
      }
      
      // Wait before retrying (except on last attempt)
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }

    if (role) {
      // Check if user must change password
      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", authData.user.id)
        .single();

      if (profile?.must_change_password) {
        // Redirect to password change page
        window.location.href = "/auth/change-password";
        return;
      }

      // Redirect based on role
      if (role === "super_admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/workspace";
      }
    } else {
      // If we still can't get the role, show a helpful error
      setError(
        `Unable to load your profile. This might be a temporary issue. ` +
        `Please try refreshing the page, or contact support if the problem persists. ` +
        `Error: ${lastError || "Unknown error"}`
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border backdrop-blur-sm bg-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-serif font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access Ticket OS</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {registered && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <AlertDescription>
                      Admin account created successfully! Please sign in with your credentials.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                />
                <EmailGreeting email={email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

