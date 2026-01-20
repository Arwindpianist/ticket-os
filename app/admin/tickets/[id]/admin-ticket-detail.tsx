"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTicketMessageAdmin, updateTicketAdmin, uploadTicketFileAdmin } from "@/modules/tickets/server-admin";
import { TicketWithDetails } from "@/types/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, File, Download } from "lucide-react";
import { motion } from "framer-motion";
import { getAllTenants } from "@/modules/tenants/server";
import { formatDate, formatDateTime } from "@/lib/utils";

export function AdminTicketDetail({ ticket: initialTicket }: { ticket: TicketWithDetails }) {
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [message, setMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllTenants().then(setTenants).catch(console.error);
  }, []);

  const tenantName = tenants.find(t => t.id === ticket.tenant_id)?.name || "Unknown Tenant";

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await addTicketMessageAdmin(ticket.id, { 
        content: message,
        is_internal_note: isInternalNote 
      });
      setMessage("");
      setIsInternalNote(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add message");
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      await updateTicketAdmin(ticket.id, { status: newStatus as any });
      setTicket({ ...ticket, status: newStatus as any });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setLoading(true);
    setError(null);

    try {
      await updateTicketAdmin(ticket.id, { priority: newPriority as any });
      setTicket({ ...ticket, priority: newPriority as any });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update priority");
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadTicketFileAdmin(ticket.id, formData);
      router.refresh();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "waiting":
        return "outline";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card className="border border-border/30 bg-card shadow-depth-md">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusBadgeVariant(ticket.status)}>
                  {ticket.status.replace("_", " ")}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline">{tenantName}</Badge>
                {ticket.author && (
                  <span className="text-sm text-muted-foreground">
                    Created by: {ticket.author.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
                disabled={loading}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={ticket.priority}
                onValueChange={handlePriorityChange}
                disabled={loading}
              >
                <SelectTrigger className="w-40">
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
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Messages */}
      <Card className="border border-border/30 bg-card shadow-depth-md">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.length === 0 ? (
            <p className="text-muted-foreground">No messages yet.</p>
          ) : (
            ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg border p-4 shadow-inner-subtle ${
                  msg.is_internal_note ? "bg-muted" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {new Date(msg.created_at).toLocaleString()}
                    {msg.is_internal_note && (
                      <Badge variant="secondary" className="ml-2">
                        Internal Note
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))
          )}

          <form onSubmit={handleAddMessage} className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="internal-note"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="internal-note" className="text-sm cursor-pointer">
                Internal note (not visible to tenant)
              </Label>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message..."
              rows={4}
              disabled={loading}
              className="shadow-inner-subtle focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
            />
            <Button type="submit" disabled={loading || !message.trim()}>
              Add Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card className="border border-border/30 bg-card shadow-depth-md">
        <CardHeader>
          <CardTitle className="text-xl">Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="space-y-2">
              {ticket.attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border border-border/30 p-3 bg-card/50 shadow-inner-subtle hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file_size)} • {formatDate(attachment.created_at)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-2 hover:bg-accent/20 rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attachments yet.</p>
          )}

          <div className="pt-2 border-t border-border/30">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
