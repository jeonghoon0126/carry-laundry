"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, Suspense } from "react";

function GuestGateContent() {
  const sp = useSearchParams();
  const from = sp.get("from") || "order";
  const callbackUrl = useMemo(() => {
    if (from === "order") return "/order";
    return "/";
  }, [from]);

  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
        {/* 타이틀 이미지 */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/assets/hero-title.png"
            alt="Carry Hero Title"
            width={320}
            height={160}
            priority
          />
        </div>

        <div className="space-y-3 text-center mb-8">
          <h1 className="text-xl font-semibold">더 빠르게 주문하려면</h1>
          <p className="text-gray-500 text-sm">
            카카오로 간편 로그인 후 주문을 완료하세요.
          </p>
        </div>

        {/* 카카오로 시작하기 CTA */}
        <button
          onClick={() => signIn("kakao", { callbackUrl })}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#FEE500] bg-[#FEE500] hover:brightness-95 transition h-12"
          aria-label="카카오로 시작하기"
        >
          <Image
            src="/assets/kakao.png"
            alt="kakao"
            width={20}
            height={20}
            className="shrink-0"
          />
          <span className="font-semibold text-[#191600]">카카오로 시작하기</span>
        </button>
      </div>
    </main>
  );
}

export default function GuestGatePage() {
  return (
    <Suspense fallback={
      <main className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded mb-8"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    }>
      <GuestGateContent />
    </Suspense>
  );
}
