"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startImpersonation } from "@/modules/auth/impersonation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye } from "lucide-react";

interface ImpersonateButtonProps {
  tenantId: string;
  tenantName: string;
}

export function ImpersonateButton({ tenantId, tenantName }: ImpersonateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImpersonate = async () => {
    setLoading(true);
    setError(null);

    try {
      await startImpersonation(tenantId);
      // Redirect to workspace
      router.push("/workspace");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to start impersonation");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleImpersonate}
        disabled={loading}
        variant="outline"
        className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Eye className="h-4 w-4 mr-2" />
        {loading ? "Starting..." : "View as Tenant"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        View this tenant's workspace in read-only mode
      </p>
    </div>
  );
}

