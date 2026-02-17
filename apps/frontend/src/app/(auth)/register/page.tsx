import React, { Suspense } from "react";
import { RegisterClient } from "./RegisterClient";
import { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "Inscription | JOLANANAS",
  description:
    "Créer un compte JOLANANAS pour accéder à nos offres exclusives.",
};

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="container py-32 md:py-48 text-center">
          <div className="flex flex-col items-center justify-center py-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </PageContainer>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
