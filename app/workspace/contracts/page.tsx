import { requireAuth, getAuthContext } from "@/modules/auth/server";
import { getContracts } from "@/modules/contracts/server";
import { isFeatureEnabled } from "@/modules/features/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard, AnimatedCardHeader } from "@/components/animated-card";
import { formatDate } from "@/lib/utils";
import { generateMetadataForPath } from "@/lib/metadata";

export function generateMetadata() {
  return generateMetadataForPath("/workspace/contracts");
}

export default async function ContractsPage() {
  const authContext = await getAuthContext();
  
  if (!authContext?.tenantId) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <AnimatedCard delay={0.1}>
            <CardContent className="py-8 text-center text-muted-foreground">
              You are not associated with a tenant. Please contact your administrator.
            </CardContent>
          </AnimatedCard>
        </div>
      </AnimatedPage>
    );
  }

  const contractsEnabled = await isFeatureEnabled("contracts_enabled", authContext.tenantId);

  if (!contractsEnabled) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <AnimatedCard delay={0.1}>
            <CardContent className="py-8 text-center text-muted-foreground">
              Contracts feature is not enabled for your tenant.
            </CardContent>
          </AnimatedCard>
        </div>
      </AnimatedPage>
    );
  }

  const contracts = await getContracts();

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
              Contracts
            </h1>
            <p className="text-muted-foreground text-lg">View your maintenance contracts</p>
          </div>
          <Link href="/workspace/contracts/usage">
            <Button variant="outline" className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              View Usage
            </Button>
          </Link>
        </div>

        <AnimatedCard delay={0.1} className="border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-xl">All Contracts</CardTitle>
            <CardDescription>List of all contracts for your tenant</CardDescription>
          </AnimatedCardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No contracts found.
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => {
                const startDate = new Date(contract.start_date);
                const endDate = new Date(contract.end_date);
                const today = new Date();
                const isActive = today >= startDate && today <= endDate;
                const isExpired = today > endDate;

                return (
                  <Link
                    key={contract.id}
                    href={`/workspace/contracts/${contract.id}`}
                    className="block rounded-lg border p-4 hover:bg-accent transition-all duration-300 shadow-inner-subtle hover:shadow-depth-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contract.title}</h3>
                          {isActive && <Badge variant="default">Active</Badge>}
                          {isExpired && <Badge variant="secondary">Expired</Badge>}
                          {today < startDate && <Badge variant="outline">Upcoming</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(startDate)} - {formatDate(endDate)}
                        </p>
                      </div>
                    </div>
                  </Link>
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

