"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculatePasswordStrength } from "@/lib/password-validation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password) {
    return null;
  }

  const getScoreColor = () => {
    switch (strength.level) {
      case "weak":
        return "bg-destructive";
      case "fair":
        return "bg-orange-500";
      case "good":
        return "bg-yellow-500";
      case "strong":
        return "bg-primary";
      case "very-strong":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getScoreLabel = () => {
    switch (strength.level) {
      case "weak":
        return "Weak";
      case "fair":
        return "Fair";
      case "good":
        return "Good";
      case "strong":
        return "Strong";
      case "very-strong":
        return "Very Strong";
      default:
        return "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Score Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password Strength</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium",
              strength.level === "weak" && "text-destructive",
              strength.level === "fair" && "text-orange-500",
              strength.level === "good" && "text-yellow-500",
              strength.level === "strong" && "text-primary",
              strength.level === "very-strong" && "text-green-500",
            )}>
              {getScoreLabel()}
            </span>
            <span className="text-muted-foreground">({strength.score}/100)</span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden shadow-inner-subtle">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength.score}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("h-full rounded-full transition-colors duration-300", getScoreColor())}
          />
        </div>
      </div>

      {/* Requirements List */}
      <AnimatePresence>
        <div className="space-y-1.5">
          {strength.requirements.map((req, index) => (
            <motion.div
              key={req.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 text-xs"
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  "transition-colors duration-200",
                  req.met ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

