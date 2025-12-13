"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check } from "lucide-react";

interface UserCreatedDialogProps {
  email: string;
  password: string;
  role: string;
  onClose: () => void;
}

export function UserCreatedDialog({ email, password, role, onClose }: UserCreatedDialogProps) {
  const [copied, setCopied] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Created Successfully</DialogTitle>
          <DialogDescription>
            The user has been created. Please save the credentials below. The user will be required to change their password on first login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> This password will only be shown once. Make sure to copy it now.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Input value={email} readOnly className="font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(email);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex items-center gap-2">
              <Input
                type={passwordVisible ? "text" : "password"}
                value={password}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? "Hide" : "Show"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyPassword}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={role} readOnly />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

