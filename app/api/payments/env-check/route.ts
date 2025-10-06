import { NextResponse } from "next/server";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  const secret = process.env.TOSS_SECRET_KEY;
  const supaPubUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaPubKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supaSrvUrl = process.env.SUPABASE_URL;
  const supaSrvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const result = {
    hasClient: !!client,
    clientPrefix: client?.slice(0, 8),
    clientLength: client?.length || 0,
    hasSecret: !!secret,
    secretPrefix: secret?.slice(0, 8),
    secretLength: secret?.length || 0,
    supabase: {
      hasPublicUrl: !!supaPubUrl,
      hasPublicKey: !!supaPubKey,
      hasServerUrl: !!supaSrvUrl,
      hasServerKey: !!supaSrvKey,
      publicUrlPrefix: supaPubUrl?.slice(0, 20),
      serverUrlPrefix: supaSrvUrl?.slice(0, 20),
    },
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV
  };

  // 환경 변수 누락 체크
  const missingVars = [];
  if (!client) missingVars.push('NEXT_PUBLIC_TOSS_CLIENT_KEY');
  if (!secret) missingVars.push('TOSS_SECRET_KEY');
  if (!supaPubUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supaPubKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!supaSrvUrl) missingVars.push('SUPABASE_URL');
  if (!supaSrvKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

  return NextResponse.json({
    ...result,
    missingVars,
    isConfigured: missingVars.length === 0
  });
}
