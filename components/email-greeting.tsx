"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateEmailGreeting } from "@/lib/email-greeting";

interface EmailGreetingProps {
  email: string;
  className?: string;
}

export function EmailGreeting({ email, className }: EmailGreetingProps) {
  const greeting = useMemo(() => generateEmailGreeting(email), [email]);

  if (!email || !email.includes("@")) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {greeting.greeting && (
        <motion.div
          key={greeting.greeting}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          <p className="text-sm text-muted-foreground font-medium">
            {greeting.greeting}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

