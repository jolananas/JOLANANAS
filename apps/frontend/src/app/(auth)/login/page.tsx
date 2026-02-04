import React, { Suspense } from "react";
import { LoginClient } from "./LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | JOLANANAS",
  description: "Connectez-vous à votre compte JOLANANAS",
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex h-screen items-center justify-center">
          Chargement...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
