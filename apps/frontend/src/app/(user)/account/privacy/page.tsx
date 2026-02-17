/**
 * 🍍 JOLANANAS - Page Confidentialité RGPD
 * ==========================================
 * Page pour gérer les données personnelles et la confidentialité
 */

import React, { Suspense } from "react";
import { PrivacyClient } from "./PrivacyClient";
import { PageContainer } from "@/components/layout/PageContainer";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
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
      <PrivacyClient />
    </Suspense>
  );
}
