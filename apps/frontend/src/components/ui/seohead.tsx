"use client";
import React from "react";
import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export function SEOHead({
  title = "JOLANANAS - Créations Manuelles Hautes Gammes",
  description = "Découvrez les créations artisanales exclusives de JOLANANAS. Bijoux personnalisés et accessoires haut de gamme.",
  keywords = "bijoux, créations manuelles, artisanat, luxe, personnalisé",
  image = "/assets/images/preview/Jolananas-preview.png",
}: SEOHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </Head>
  );
}
