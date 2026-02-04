/**
 * 🍍 JOLANANAS - Page Confidentialité RGPD
 * ==========================================
 * Page pour gérer les données personnelles et la confidentialité
 */

import React, { Suspense } from "react";
import { PrivacyClient } from "./PrivacyClient";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-40 text-center">Chargement...</div>
      }
    >
      <PrivacyClient />
    </Suspense>
  );
}
