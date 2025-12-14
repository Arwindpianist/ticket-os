import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BrandingProvider } from "@/components/branding-provider";
import { Navigation } from "@/components/navigation";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { getAuthContext } from "@/modules/auth/server";
import { getTenantBranding } from "@/modules/branding/queries";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ticket OS",
  description: "Multi-tenant ticket management platform",
  icons: {
    icon: "/portal.svg",
    apple: "/portal.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch branding if user is authenticated
  let branding = null;
  try {
    const context = await getAuthContext();
    if (context?.tenantId) {
      branding = await getTenantBranding(context.tenantId);
    }
  } catch (error) {
    // Ignore errors - branding is optional
  }

  return (
    <html lang="en" className="dark">
      <body className={`${playfair.variable} ${inter.variable} font-sans`}>
        <BrandingProvider branding={branding}>
          <ImpersonationBanner />
          <Navigation />
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}

