import { NextResponse } from "next/server";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  const secret = process.env.TOSS_SECRET_KEY;
  const supaPubUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaPubKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supaSrvUrl = process.env.SUPABASE_URL;
  const supaSrvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    hasClient: !!client,
    clientPrefix: client?.slice(0, 8),
    hasSecret: !!secret,
    secretPrefix: secret?.slice(0, 8),
    supabase: {
      hasPublicUrl: !!supaPubUrl,
      hasPublicKey: !!supaPubKey,
      hasServerUrl: !!supaSrvUrl,
      hasServerKey: !!supaSrvKey,
    }
  });
}
