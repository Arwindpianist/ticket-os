import { getAuthContext } from "@/modules/auth/server";
import { isFeatureEnabled } from "@/modules/features/server";
import { getContractItemUsageStats } from "@/modules/contracts/analytics";
import { ContractItemUsageSummary } from "@/components/contracts/contract-item-usage-summary";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard } from "@/components/animated-card";
import { CardContent } from "@/components/ui/card";

export default async function ContractItemUsagePage() {
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

  const stats = await getContractItemUsageStats();

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Contract Item Usage
          </h1>
          <p className="text-muted-foreground text-lg">
            Track ticket usage against contract item limits
          </p>
        </div>

        <ContractItemUsageSummary stats={stats} />
      </div>
    </AnimatedPage>
  );
}

