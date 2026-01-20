import { Metadata } from "next";

function getPortalUrl(): string {
  return process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.arwindpianist.com";
}

function getOgImageUrl(path: string = ""): string {
  const portalUrl = getPortalUrl();
  // Use og.png from public folder
  const ogImagePath = "/og.png";
  return `${portalUrl}${ogImagePath}`;
}

export function generateMetadataForPath(
  path: string,
  title?: string,
  description?: string,
  image?: string
): Metadata {
  const portalUrl = getPortalUrl();
  const fullUrl = `${portalUrl}${path}`;
  const ogImage = image || getOgImageUrl(path);

  // Generate title based on path if not provided
  let pageTitle = title || "Ticket OS";
  if (!title) {
    if (path.startsWith("/admin")) {
      if (path.includes("/tickets")) {
        pageTitle = "Admin Tickets - Ticket OS";
      } else if (path.includes("/contracts")) {
        pageTitle = "Admin Contracts - Ticket OS";
      } else if (path.includes("/users")) {
        pageTitle = "Admin Users - Ticket OS";
      } else if (path.includes("/tenants")) {
        pageTitle = "Admin Tenants - Ticket OS";
      } else {
        pageTitle = "Admin Dashboard - Ticket OS";
      }
    } else if (path.startsWith("/workspace")) {
      if (path.includes("/tickets")) {
        pageTitle = "Tickets - Ticket OS";
      } else if (path.includes("/contracts")) {
        pageTitle = "Contracts - Ticket OS";
      } else if (path.includes("/users")) {
        pageTitle = "Users - Ticket OS";
      } else {
        pageTitle = "Workspace - Ticket OS";
      }
    } else if (path.startsWith("/auth/login")) {
      pageTitle = "Sign In - Ticket OS";
    }
  }

  // Generate description based on path if not provided
  let pageDescription = description || "Multi-tenant ticket management platform";
  if (!description) {
    if (path.startsWith("/admin")) {
      pageDescription = "Manage tickets, contracts, users, and tenants across all organizations";
    } else if (path.startsWith("/workspace")) {
      pageDescription = "View and manage your tickets and contracts";
    } else if (path.startsWith("/auth/login")) {
      pageDescription = "Sign in to your Ticket OS account";
    }
  }

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: fullUrl,
      siteName: "Ticket OS",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
    icons: {
      icon: "/portal.svg",
      apple: "/portal.svg",
    },
  };
}

export function generateMetadataForTicket(
  ticketId: string,
  ticketTitle: string,
  tenantName?: string
): Metadata {
  const portalUrl = getPortalUrl();
  const path = `/admin/tickets/${ticketId}`;
  const fullUrl = `${portalUrl}${path}`;
  const ogImage = getOgImageUrl(path);
  
  const title = `${ticketTitle} - Ticket OS`;
  const description = tenantName 
    ? `Ticket from ${tenantName}: ${ticketTitle}`
    : `Ticket: ${ticketTitle}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "Ticket OS",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function generateMetadataForContract(
  contractId: string,
  contractTitle: string,
  tenantName?: string
): Metadata {
  const portalUrl = getPortalUrl();
  const path = `/admin/contracts/${contractId}`;
  const fullUrl = `${portalUrl}${path}`;
  const ogImage = getOgImageUrl(path);
  
  const title = `${contractTitle} - Ticket OS`;
  const description = tenantName 
    ? `Contract for ${tenantName}: ${contractTitle}`
    : `Contract: ${contractTitle}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "Ticket OS",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
