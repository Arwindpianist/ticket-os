"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/modules/users/server";
import { getAllTenants } from "@/modules/tenants/server";
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
import { AnimatedPage } from "@/components/animated-page";
import { UserCreatedDialog } from "@/components/admin/user-created-dialog";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [createdUser, setCreatedUser] = useState<{
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "tenant_user" as "super_admin" | "tenant_admin" | "tenant_user",
    tenantId: "",
  });

  // Load tenants on mount
  React.useEffect(() => {
    getAllTenants().then(setTenants).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createUser({
        email: formData.email,
        role: formData.role,
        tenantId: formData.role === "super_admin" ? undefined : formData.tenantId || undefined,
      });
      
      setCreatedUser({
        email: result.email,
        password: result.password,
        role: result.role,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setCreatedUser(null);
    router.push("/admin/users");
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Create New User</CardTitle>
            <CardDescription>Create a new user account with auto-generated password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "super_admin" | "tenant_admin" | "tenant_user") =>
                    setFormData({ ...formData, role: value, tenantId: "" })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                    <SelectItem value="tenant_user">Tenant User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.role === "super_admin" 
                    ? "Super Admin has access to all tenants and system settings."
                    : formData.role === "tenant_admin"
                    ? "Tenant Admin can manage users and configure settings for their tenant."
                    : "Tenant User can create tickets and view contracts."}
                </p>
              </div>

              {formData.role !== "super_admin" && (
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant</Label>
                  <Select
                    value={formData.tenantId}
                    onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                    disabled={loading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading || !formData.email}>
                  {loading ? "Creating..." : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {createdUser && (
          <UserCreatedDialog
            email={createdUser.email}
            password={createdUser.password}
            role={createdUser.role}
            onClose={handleDialogClose}
          />
        )}
      </div>
    </AnimatedPage>
  );
}

