import { NextResponse } from 'next/server';

export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return NextResponse.json({
    accessTokenConfigured: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    accessTokenStart: accessToken?.substring(0, 20) || 'N/A',
    publicKeyConfigured: !!publicKey,
    publicKeyLength: publicKey?.length || 0,
    publicKeyStart: publicKey?.substring(0, 20) || 'N/A',
    appUrlConfigured: !!appUrl,
    appUrl: appUrl || 'N/A'
  });
} 