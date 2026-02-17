import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // ICI : Connecter à Shopify, Klaviyo, Mailchimp ou Database
    // Exemple Simulation (Log)
    console.log("🔥 NEW LEAD CAPTURED:", email);

    // TODO: Décommenter pour Shopify (Customer Subscribe)
    /*
    if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN) {
        try {
            const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION || '2024-01'}/customers.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN
                },
                body: JSON.stringify({ 
                    customer: { 
                        email, 
                        accepts_marketing: true,
                        tags: "newsletter, gatekeeper_lead"
                    } 
                })
            });
            
            if (!response.ok) {
                 console.error("Shopify Customer Error", await response.text());
            }
        } catch (shopifyError) {
             console.error("Shopify Connection Error", shopifyError);
        }
    }
    */

    return NextResponse.json({ success: true, message: "Inscription validée" });
  } catch (error) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
