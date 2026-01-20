import { Metadata } from "next";
import { generateMetadataForPath } from "@/lib/metadata";
import LoginPageClient from "./login-client";

export function generateMetadata(): Metadata {
  return generateMetadataForPath("/auth/login");
}

export default function LoginPage() {
  return <LoginPageClient />;
}
