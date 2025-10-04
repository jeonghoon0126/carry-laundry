import { NextResponse } from 'next/server';
import crypto from 'crypto';

const mask = (s: string) =>
  s ? `${s.slice(0,12)}…${s.slice(-4)}` : 'none';

export async function GET() {
  const secret = process.env.TOSS_SECRET_KEY || '';
  const client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

  const secretHash = secret ? crypto.createHash('sha256').update(secret).digest('hex') : '';
  const clientHash = client ? crypto.createHash('sha256').update(client).digest('hex') : '';

  console.log('[Debug/Toss] env+', {
    hasSecret: !!secret, secretMasked: mask(secret), secretHash: secretHash.slice(0,12),
    hasClient: !!client, clientMasked: mask(client), clientHash: clientHash.slice(0,12),
  });

  return NextResponse.json({
    hasSecret: !!secret,
    secretMasked: mask(secret),     // 예: test_sk_Poxy…Wml
    secretHash: secretHash.slice(0,12), // 짧은 지문
    hasClient: !!client,
    clientMasked: mask(client),     // 예: test_ck_AQ92…Xvd
    clientHash: clientHash.slice(0,12),
  });
}
