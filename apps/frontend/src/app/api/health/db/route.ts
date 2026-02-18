import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'deprecated', 
      message: 'La base de données locale n\'est plus utilisée. L\'application utilise uniquement Shopify APIs.',
      architecture: 'database-less',
      dataSource: 'Shopify APIs (Cart, Orders, Customer Accounts, Metafields)',
      cache: 'Next.js ISR',
      logs: 'Vercel Analytics / Server Logs',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
