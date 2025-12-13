"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suspendTenant, activateTenant } from "@/modules/tenants/server";
import { Button } from "@/components/ui/button";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tenant } from "@/types/tenant";

export function TenantActions({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuspend = async () => {
    if (!confirm("Are you sure you want to suspend this tenant?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await suspendTenant(tenant.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to suspend tenant");
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    setError(null);

    try {
      await activateTenant(tenant.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to activate tenant");
      setLoading(false);
    }
  };

  return (
    <AnimatedCard delay={0.2}>
      <AnimatedCardHeader>
        <CardTitle className="text-xl">Actions</CardTitle>
        <CardDescription>Manage tenant status</CardDescription>
      </AnimatedCardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {tenant.is_active ? (
          <Button
            variant="destructive"
            onClick={handleSuspend}
            disabled={loading}
            className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Suspend Tenant
          </Button>
        ) : (
          <Button 
            onClick={handleActivate} 
            disabled={loading}
            className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Activate Tenant
          </Button>
        )}
      </CardContent>
    </AnimatedCard>
  );
}

