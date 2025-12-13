"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tenant } from "@/modules/tenants/types";

interface TenantListItemProps {
  tenant: Tenant;
  index: number;
}

export function TenantListItem({ tenant, index }: TenantListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="flex items-center justify-between rounded-lg border border-border/30 p-4 bg-card/50 shadow-inner-subtle hover:shadow-depth-sm transition-all duration-300"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">{tenant.name}</h3>
          {tenant.is_active ? (
            <Badge variant="default" className="transition-all duration-200">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="transition-all duration-200">
              Suspended
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Slug: <span className="font-mono">{tenant.slug}</span>
          {tenant.domain && (
            <>
              {" • "}
              Domain: <span className="font-mono">{tenant.domain}</span>
            </>
          )}
        </p>
      </div>
      <Link href={`/admin/tenants/${tenant.id}`}>
        <Button 
          variant="outline" 
          className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          View
        </Button>
      </Link>
    </motion.div>
  );
}

