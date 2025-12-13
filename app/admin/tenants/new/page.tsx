"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTenant } from "@/modules/tenants/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedPage } from "@/components/animated-page";

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    domain: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTenant({
        name: formData.name,
        slug: formData.slug,
        domain: formData.domain || null,
        is_active: formData.is_active,
      });
      router.push("/admin/tenants");
    } catch (err: any) {
      setError(err.message || "Failed to create tenant");
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Create New Tenant
          </h1>
          <p className="text-muted-foreground text-lg">Add a new client tenant to the system</p>
        </div>

        <AnimatedCard delay={0.1} className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Tenant Details</CardTitle>
            <CardDescription>Enter the information for the new tenant</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                required
                disabled={loading}
                placeholder="my-tenant"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain (Optional)</Label>
              <Input
                id="domain"
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                disabled={loading}
                placeholder="example.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={loading}
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Creating..." : "Create Tenant"}
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
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}

