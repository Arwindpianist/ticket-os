"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ToggleLeft, ToggleRight, Hash, Infinity, MapPin, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ContractItem {
  id: string;
  text: string;
  type: "text" | "toggle" | "limit" | "unlimited" | "location";
  enabled?: boolean;
  value?: number | string;
  location?: "remote" | "on-site" | "both";
  limit_period?: "monthly" | "quarterly" | "half_yearly" | "yearly" | null;
}

interface ContractBuilderProps {
  value: ContractItem[];
  onChange: (items: ContractItem[]) => void;
}

export function ContractBuilder({ value, onChange }: ContractBuilderProps) {
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const parsePastedText = useCallback((text: string): ContractItem[] => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((line, index) => {
      const id = `item-${Date.now()}-${index}`;
      
      // Detect patterns
      if (line.toLowerCase().includes("unlimited")) {
        return {
          id,
          text: line.replace(/unlimited/gi, "").trim(),
          type: "unlimited" as const,
        };
      }
      
      if (line.match(/\d+\s*(tickets|hours|days|months|users|items)/i)) {
        const match = line.match(/(\d+)\s*(\w+)/i);
        return {
          id,
          text: line.replace(/\d+\s*\w+/i, "").trim(),
          type: "limit" as const,
          value: match ? parseInt(match[1]) : 0,
        };
      }
      
      if (line.toLowerCase().includes("remote") || line.toLowerCase().includes("on-site")) {
        let location: "remote" | "on-site" | "both" = "both";
        if (line.toLowerCase().includes("remote") && !line.toLowerCase().includes("on-site")) {
          location = "remote";
        } else if (line.toLowerCase().includes("on-site") && !line.toLowerCase().includes("remote")) {
          location = "on-site";
        }
        return {
          id,
          text: line.replace(/(remote|on-site)/gi, "").trim(),
          type: "location" as const,
          location,
        };
      }
      
      // Default to text
      return {
        id,
        text: line,
        type: "text" as const,
      };
    });
  }, []);

  const handlePaste = () => {
    if (!pasteText.trim()) return;
    const newItems = parsePastedText(pasteText);
    onChange([...value, ...newItems]);
    setPasteText("");
    setPasteMode(false);
  };

  const updateItem = (id: string, updates: Partial<ContractItem>) => {
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([
      ...value,
      {
        id: `item-${Date.now()}`,
        text: "",
        type: "text",
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Contract Items</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPasteMode(!pasteMode)}
          >
            {pasteMode ? "Cancel" : "Paste Text"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {pasteMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <Textarea
            placeholder="Paste your contract content here... Each line will become a separate item."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <Button type="button" onClick={handlePaste} className="w-full">
            Parse & Add Items
          </Button>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {value.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border/30 bg-card shadow-inner-subtle">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Input
                          value={item.text}
                          onChange={(e) =>
                            updateItem(item.id, { text: e.target.value })
                          }
                          placeholder="Item description..."
                          className="flex-1 min-w-[200px]"
                        />
                        <Select
                          value={item.type}
                          onValueChange={(type: ContractItem["type"]) =>
                            updateItem(item.id, { type })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">
                              <span className="flex items-center gap-2">
                                Text
                              </span>
                            </SelectItem>
                            <SelectItem value="toggle">
                              <span className="flex items-center gap-2">
                                <ToggleRight className="h-4 w-4" />
                                Toggle
                              </span>
                            </SelectItem>
                            <SelectItem value="limit">
                              <span className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Limit
                              </span>
                            </SelectItem>
                            <SelectItem value="unlimited">
                              <span className="flex items-center gap-2">
                                <Infinity className="h-4 w-4" />
                                Unlimited
                              </span>
                            </SelectItem>
                            <SelectItem value="location">
                              <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Type-specific controls */}
                      {item.type === "toggle" && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Enabled:</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateItem(item.id, {
                                enabled: !item.enabled,
                              })
                            }
                            className={cn(
                              "h-8 px-3",
                              item.enabled
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.enabled ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </Button>
                          <Badge variant={item.enabled ? "default" : "secondary"}>
                            {item.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      )}

                      {item.type === "limit" && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Label className="text-xs text-muted-foreground">Limit:</Label>
                          <Input
                            type="number"
                            value={item.value || 0}
                            onChange={(e) =>
                              updateItem(item.id, {
                                value: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-24"
                            min={0}
                          />
                          <Label className="text-xs text-muted-foreground">Period:</Label>
                          <Select
                            value={item.limit_period || "monthly"}
                            onValueChange={(period: "monthly" | "quarterly" | "half_yearly" | "yearly") =>
                              updateItem(item.id, { limit_period: period })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="half_yearly">Half-Yearly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {item.type === "location" && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Location:</Label>
                          <Select
                            value={item.location || "both"}
                            onValueChange={(location: "remote" | "on-site" | "both") =>
                              updateItem(item.id, { location })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remote">
                                <span className="flex items-center gap-2">
                                  <Home className="h-4 w-4" />
                                  Remote
                                </span>
                              </SelectItem>
                              <SelectItem value="on-site">
                                <span className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  On-Site
                                </span>
                              </SelectItem>
                              <SelectItem value="both">
                                <span className="flex items-center gap-2">
                                  Both
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {item.type === "unlimited" && (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Infinity className="h-3 w-3" />
                          Unlimited
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {value.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items yet. Click &quot;Paste Text&quot; or &quot;Add Item&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}


