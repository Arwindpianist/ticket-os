import { requireAuth } from "@/modules/auth/server";
import { getContract } from "@/modules/contracts/server";
import { NotFoundError } from "@/lib/errors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractDisplay } from "@/components/contract-display";
import { formatDate } from "@/lib/utils";
import { generateMetadataForContract } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<import("next").Metadata> {
  const { id } = await params;
  const contract = await getContract(id);
  if (!contract) {
    return {
      title: "Contract Not Found - Ticket OS",
    };
  }
  
  return generateMetadataForContract(id, contract.title);
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const contract = await getContract(id);

  if (!contract) {
    throw new NotFoundError("Contract not found");
  }

  const startDate = new Date(contract.start_date);
  const endDate = new Date(contract.end_date);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isExpired = today > endDate;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-serif font-bold">{contract.title}</h1>
          {isActive && <Badge variant="default">Active</Badge>}
          {isExpired && <Badge variant="secondary">Expired</Badge>}
          {today < startDate && <Badge variant="outline">Upcoming</Badge>}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>Contract information and summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Period</p>
              <p className="text-lg">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Summary</p>
              <ContractDisplay summary={contract.summary} />
            </div>
            {contract.pdf_url && (
              <div>
                <a
                  href={contract.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View PDF Document
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

