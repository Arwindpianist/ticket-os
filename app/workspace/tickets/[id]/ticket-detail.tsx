"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addTicketMessage, updateTicket } from "@/modules/tickets/server";
import { uploadTicketFile } from "@/modules/tickets/attachments";
import { TicketWithDetails } from "@/types/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, File, Download } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TicketDetail({ ticket: initialTicket }: { ticket: TicketWithDetails }) {
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await addTicketMessage(ticket.id, { content: message });
      setMessage("");
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
      await updateTicket(ticket.id, { status: newStatus as any });
      setTicket({ ...ticket, status: newStatus as any });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
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
      const attachment = await uploadTicketFile(ticket.id, formData);
      // Refresh to get updated ticket with new attachment
      router.refresh();
      // Reset file input
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
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
          </div>
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

          <form onSubmit={handleAddMessage} className="space-y-2">
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

      {/* Attachments Section */}
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
                        {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
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

