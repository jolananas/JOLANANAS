import { ShopifyAdminClient } from "../frontend/src/lib/ShopifyAdminClient";

async function main() {
  const client = new ShopifyAdminClient();
  
  console.log("🔍 Checking Shopify Metaobjects for 'avis'...");
  
  const query = `
    query {
      metaobjects(first: 10, type: "avis") {
        edges {
          node {
            id
            handle
            type
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;
  
  try {
    // Note: ShopifyAdminClient.request uses REST by default. 
    // We need to target the graphql endpoint manually or use the client's request with the right URL.
    // The client's baseUrl is .../admin/api/{version}
    const response = await (client as any).request("/graphql.json", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    
    const metaobjects = response.data?.metaobjects?.edges || [];
    
    if (metaobjects.length > 0) {
      console.log(`✅ Found ${metaobjects.length} metaobjects of type 'avis':`);
      metaobjects.forEach((edge: any) => {
        const node = edge.node;
        console.log(`\n📄 Metaobject: ${node.handle} (${node.id})`);
        node.fields.forEach((f: any) => {
          console.log(`   - ${f.key}: ${f.value}`);
        });
      });
    } else {
      console.log("ℹ️ No 'avis' metaobjects found.");
    }
  } catch (error) {
    console.error("❌ Error fetching metaobjects:", error);
  }
}

main();
