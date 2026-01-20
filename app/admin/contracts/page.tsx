import { requireSuperAdmin } from "@/modules/auth/server";
import { getAllContracts } from "@/modules/contracts/server";
import { getAllTenants } from "@/modules/tenants/queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { ContractListItem } from "./contract-list-item";
import { generateMetadataForPath } from "@/lib/metadata";

export function generateMetadata() {
  return generateMetadataForPath("/admin/contracts");
}

export default async function AdminContractsPage() {
  await requireSuperAdmin();
  const contracts = await getAllContracts();
  const tenants = await getAllTenants();
  
  // Create a map for quick tenant lookup
  const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
              Contracts
            </h1>
            <p className="text-muted-foreground text-lg">Manage contracts for all tenants</p>
          </div>
          <Link href="/admin/contracts/new">
            <Button className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Create Contract
            </Button>
          </Link>
        </div>

        <AnimatedCard delay={0.1} className="border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-xl">All Contracts</CardTitle>
            <CardDescription>List of all contracts across all tenants</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-2">No contracts found.</p>
                <p className="text-sm">Create your first contract to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract, index) => {
                  const tenantName = tenantMap.get(contract.tenant_id) || "Unknown Tenant";
                  return (
                    <ContractListItem
                      key={contract.id}
                      contract={contract}
                      tenantName={tenantName}
                      index={index}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}

