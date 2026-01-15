// app/not-found.tsx
"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link href="/">
        <Button variant="default" className="cursor-pointer">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
