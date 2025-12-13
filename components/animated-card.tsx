"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  children: React.ReactNode;
}

export function AnimatedCard({ delay = 0, className, children, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={cn("transition-all duration-300", className)}
    >
      <Card className="h-full transition-all duration-300 hover:border-primary/20 hover:shadow-elevated" {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

interface AnimatedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AnimatedCardHeader({ className, children, ...props }: AnimatedCardHeaderProps) {
  return (
    <CardHeader className={cn("transition-colors duration-300", className)} {...props}>
      {children}
    </CardHeader>
  );
}

export { CardContent, CardDescription, CardTitle };

