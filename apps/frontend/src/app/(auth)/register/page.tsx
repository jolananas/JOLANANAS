import React, { Suspense } from "react";
import { RegisterClient } from "./RegisterClient";
import { Metadata } from "next";

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
        <div className="container py-40 text-center">Chargement...</div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
