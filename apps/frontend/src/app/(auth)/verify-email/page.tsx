import React, { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="container py-32 md:py-48">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-60">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </PageContainer>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
