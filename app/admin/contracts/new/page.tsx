"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/modules/contracts/server";
import { getAllTenants } from "@/modules/tenants/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { AnimatedPage } from "@/components/animated-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContractBuilder, ContractItem } from "@/components/contract-builder";

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tenant_id: "",
    title: "",
    summary: "",
    pdf_url: "",
    start_date: "",
    end_date: "",
  });
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);

  // Load tenants on mount
  useEffect(() => {
    getAllTenants().then(setTenants).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (contractItems.length === 0) {
        throw new Error("Please add at least one contract item");
      }

      // Store contract items as structured JSON
      const summary = {
        items: contractItems,
        version: "1.0",
      };

      await createContract({
        tenant_id: formData.tenant_id,
        title: formData.title,
        summary,
        pdf_url: formData.pdf_url || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
      router.push("/admin/contracts");
    } catch (err: any) {
      setError(err.message || "Failed to create contract");
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Create New Contract
          </h1>
          <p className="text-muted-foreground text-lg">Add a new contract for a tenant</p>
        </div>

        <AnimatedCard delay={0.1} className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Contract Details</CardTitle>
            <CardDescription>Enter the information for the new contract</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant</Label>
              <Select
                value={formData.tenant_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, tenant_id: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <ContractBuilder
                value={contractItems}
                onChange={setContractItems}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_url">PDF URL (Optional)</Label>
              <Input
                id="pdf_url"
                type="url"
                value={formData.pdf_url}
                onChange={(e) =>
                  setFormData({ ...formData, pdf_url: e.target.value })
                }
                disabled={loading}
                placeholder="https://..."
              />
            </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || contractItems.length === 0}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Creating..." : "Create Contract"}
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

