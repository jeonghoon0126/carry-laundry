import { NextResponse } from "next/server";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  const secret = process.env.TOSS_SECRET_KEY;
  return NextResponse.json({
    hasClient: !!client,
    clientPrefix: client?.slice(0, 8),
    hasSecret: !!secret,
    secretPrefix: secret?.slice(0, 8),
  });
}
