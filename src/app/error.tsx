// app/error.tsx
"use client";

import { ServerCrash } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <ServerCrash className="h-16 w-16 text-red-600 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6">
        An unexpected server error occurred.
      </p>
      <Button variant="default" className="cursor-pointer" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
