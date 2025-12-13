"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTenantBranding } from "@/modules/branding/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TenantBranding } from "@/types/branding";

interface BrandingFormProps {
  initialData: {
    logo_url: string | null;
    primary_color: string;
    accent_color: string;
    dashboard_title: string;
    welcome_message: string | null;
  };
  tenantId: string;
}

export function BrandingForm({ initialData, tenantId }: BrandingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: initialData.logo_url || "",
    primary_color: initialData.primary_color || "#1e293b",
    accent_color: initialData.accent_color || "#1e293b",
    dashboard_title: initialData.dashboard_title || "Dashboard",
    welcome_message: initialData.welcome_message || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateTenantBranding(tenantId, {
        logo_url: formData.logo_url || null,
        primary_color: formData.primary_color,
        accent_color: formData.accent_color,
        dashboard_title: formData.dashboard_title,
        welcome_message: formData.welcome_message || null,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.reload(); // Reload to apply branding changes
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update branding");
      setLoading(false);
    }
  };

  return (
    <AnimatedCard delay={0.1} className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
      <AnimatedCardHeader>
        <CardTitle className="text-2xl font-serif font-bold">Branding Settings</CardTitle>
        <CardDescription>Configure logo, colors, and messaging for your tenant</CardDescription>
      </AnimatedCardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-primary/10 border-primary/20">
              <AlertDescription className="text-primary">
                Branding updated successfully! Page will reload shortly...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              disabled={loading}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">
              URL to your tenant's logo image. Should be publicly accessible.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                disabled={loading}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                disabled={loading}
                placeholder="#1e293b"
                className="flex-1 font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Primary brand color used for buttons and highlights. Use hex format (e.g., #1e293b).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent_color">Accent Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="accent_color"
                type="color"
                value={formData.accent_color}
                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                disabled={loading}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.accent_color}
                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                disabled={loading}
                placeholder="#1e293b"
                className="flex-1 font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Accent color for secondary elements. Use hex format (e.g., #1e293b).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard_title">Dashboard Title</Label>
            <Input
              id="dashboard_title"
              type="text"
              value={formData.dashboard_title}
              onChange={(e) => setFormData({ ...formData, dashboard_title: e.target.value })}
              required
              disabled={loading}
              placeholder="Dashboard"
            />
            <p className="text-xs text-muted-foreground">
              Title displayed on the workspace dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome_message">Welcome Message</Label>
            <Textarea
              id="welcome_message"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
              disabled={loading}
              placeholder="Welcome to your workspace..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional welcome message displayed to users. Leave empty to hide.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Saving..." : "Save Branding"}
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
  );
}

