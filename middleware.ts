import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const url = nextUrl.clone();
  const isOrder = url.pathname.startsWith("/order");

  // 세션 쿠키(예: next-auth)
  const hasSession =
    cookies.get("next-auth.session-token") ||
    cookies.get("__Secure-next-auth.session-token");

  if (isOrder && !hasSession) {
    // 기존 /signin?from=order 대신, 카카오 로그인 유도 게이트로 리디렉션
    url.pathname = "/auth/guest-gate";
    url.searchParams.set("from", "order");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/order/:path*"],
};
