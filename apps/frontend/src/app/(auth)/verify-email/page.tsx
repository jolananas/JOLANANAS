import React, { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-40 md:py-60">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-60">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </main>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
