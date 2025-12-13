"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteUser } from "@/modules/auth/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/animated-page";
import Link from "next/link";

export default function InviteUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "tenant_user" as "tenant_admin" | "tenant_user",
    tenantId: "", // Will be resolved server-side
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await inviteUser({
        email: formData.email,
        role: formData.role,
        tenantId: "", // Will be resolved server-side from session
      });
      setSuccess(true);
      setFormData({ email: "", role: "tenant_user", tenantId: "" });
      setTimeout(() => {
        router.push("/workspace/users");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Invite User
          </h1>
          <p className="text-muted-foreground text-lg">Invite a new user to your tenant</p>
        </div>

        <Card className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Invite New User</CardTitle>
            <CardDescription>
              Send an invitation email to a new user. They will receive a password setup link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-primary/50 bg-primary/10 text-primary-foreground">
                    <AlertDescription>
                      User invited successfully! They will receive an email with instructions to set up their account.
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "tenant_admin" | "tenant_user") =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant_user">Tenant User</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tenant Admin can manage users and configure settings. Tenant User can create tickets and view contracts.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.email}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Sending Invitation..." : "Send Invitation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}

