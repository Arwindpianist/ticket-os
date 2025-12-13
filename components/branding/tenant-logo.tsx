"use client";

import { useState } from "react";
import Image from "next/image";

interface TenantLogoProps {
  logoUrl: string;
  alt: string;
  className?: string;
}

export function TenantLogo({ logoUrl, alt, className }: TenantLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <div className={`flex-shrink-0 ${className || ""}`}>
      <img
        src={logoUrl}
        alt={alt}
        className="h-16 w-auto max-w-[200px] object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

