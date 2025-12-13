"use client";

import { useState, useEffect } from "react";
import { stopImpersonation } from "@/modules/auth/impersonation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export function ImpersonationBanner() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    // Check if impersonating by looking for the cookie
    const checkImpersonation = async () => {
      try {
        const response = await fetch("/api/impersonation/status");
        if (response.ok) {
          const data = await response.json();
          setIsImpersonating(data.isImpersonating || false);
          setTenantName(data.tenantName || null);
        }
      } catch (error) {
        // Ignore errors
      }
    };
    checkImpersonation();
  }, []);

  const handleStopImpersonation = async () => {
    try {
      // Call API route to stop impersonation (clears cookies server-side)
      const response = await fetch("/api/impersonation/stop", {
        method: "POST",
      });
      
      if (response.ok) {
        // Use window.location to ensure a full page reload and proper cookie clearing
        window.location.href = "/admin";
      } else {
        console.error("Failed to stop impersonation");
      }
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <Alert className="border-primary/30 bg-primary/10 rounded-none border-x-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary font-medium">
            Viewing as tenant: <strong>{tenantName || "Unknown"}</strong>
            <span className="text-xs ml-2 opacity-80">(Read-only mode)</span>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStopImpersonation}
          className="text-primary hover:text-primary hover:bg-primary/20"
        >
          <X className="h-4 w-4 mr-1" />
          Stop Impersonating
        </Button>
      </div>
    </Alert>
  );
}

