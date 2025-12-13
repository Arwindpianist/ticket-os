"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/animated-page";

export default function Home() {
  return (
    <AnimatedPage>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border backdrop-blur-sm bg-card">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-primary/40 to-foreground/80 bg-clip-text text-transparent">
                  Ticket OS
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CardDescription className="text-lg text-muted-foreground">
                  Multi-tenant ticket management platform
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3"
              >
                <Link href="/auth/login">
                  <Button className="w-full h-11 text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </AnimatedPage>
  );
}

