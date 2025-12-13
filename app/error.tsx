"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error for debugging
    console.error("Application error:", error);
  }, [error]);

  // Check if it's an authentication error
  const isAuthError = 
    error.message.includes("Authentication required") ||
    error.message.includes("AUTH_REQUIRED") ||
    error.name === "AuthError";

  // Auto-redirect auth errors to login
  useEffect(() => {
    if (isAuthError) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthError, router]);

  if (isAuthError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="border backdrop-blur-sm bg-card w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-serif font-bold">Authentication Required</CardTitle>
            <CardDescription>You need to sign in to access this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Redirecting you to the login page...
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="border backdrop-blur-sm bg-card w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-serif font-bold">Something went wrong</CardTitle>
          <CardDescription>An unexpected error occurred</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" className="flex-1">
              Try Again
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

