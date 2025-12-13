"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/modules/tickets/server";
import { getContractItemOptions } from "@/modules/contracts/helpers";
import { checkContractItemLimit } from "@/modules/tickets/limit-checking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard, AnimatedCardHeader } from "@/components/animated-card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractItems, setContractItems] = useState<any[]>([]);
  const [limitCheck, setLimitCheck] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    initial_message: "",
    contract_item_id: "" as string | null,
  });

  // Load contract items on mount
  useEffect(() => {
    getContractItemOptions()
      .then(setContractItems)
      .catch((err) => {
        console.error("Failed to load contract items:", err);
        // Don't show error - just allow "others" option
      });
  }, []);

  // Check limit when contract item is selected
  useEffect(() => {
    if (formData.contract_item_id && formData.contract_item_id !== "others") {
      checkContractItemLimit(formData.contract_item_id)
        .then(setLimitCheck)
        .catch((err) => {
          console.error("Failed to check limit:", err);
          setLimitCheck(null);
        });
    } else {
      setLimitCheck(null);
    }
  }, [formData.contract_item_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check limit if a contract item is selected
    if (formData.contract_item_id && formData.contract_item_id !== "others") {
      try {
        const limitResult = await checkContractItemLimit(formData.contract_item_id);
        if (!limitResult.allowed) {
          setError(limitResult.message || "Limit reached for this contract item");
          setLoading(false);
          return;
        }
      } catch (err: any) {
        setError(err.message || "Failed to check limit");
        setLoading(false);
        return;
      }
    }

    try {
      await createTicket({
        title: formData.title,
        priority: formData.priority,
        initial_message: formData.initial_message || undefined,
        contract_item_id: formData.contract_item_id === "others" ? null : formData.contract_item_id || null,
      });
      router.push("/workspace/tickets");
    } catch (err: any) {
      setError(err.message || "Failed to create ticket");
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Create New Ticket
          </h1>
          <p className="text-muted-foreground text-lg">Submit a new support ticket</p>
        </div>

        <AnimatedCard delay={0.1} className="max-w-2xl mx-auto border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Ticket Details</CardTitle>
            <CardDescription>Provide information about your support request</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {limitCheck && (
                <Alert variant={limitCheck.allowed ? "default" : "destructive"}>
                  {limitCheck.allowed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {limitCheck.allowed ? (
                      <span>
                        {limitCheck.currentCount}/{limitCheck.limit} tickets used this {limitCheck.period}
                      </span>
                    ) : (
                      <span>{limitCheck.message}</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="contract_item_id">Ticket Type</Label>
                <Select
                  value={formData.contract_item_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contract_item_id: value === "others" ? "others" : value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30">
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <span>{item.text}</span>
                          {item.hasLimit && (
                            <Badge variant="outline" className="text-xs">
                              Limit: {item.limitValue}/{item.limitPeriod}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="others">Others (Not in contract)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the contract item this ticket relates to, or &quot;Others&quot; if it doesn&apos;t match any item.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Brief description of the issue"
                  className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priority: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial_message">Initial Message (Optional)</Label>
                <Textarea
                  id="initial_message"
                  value={formData.initial_message}
                  onChange={(e) =>
                    setFormData({ ...formData, initial_message: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Provide details about the issue..."
                  rows={6}
                  className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || (limitCheck && !limitCheck.allowed)}
                  className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Creating..." : "Create Ticket"}
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

