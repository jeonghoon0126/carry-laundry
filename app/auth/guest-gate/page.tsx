"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function GuestGatePage() {
  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4 py-10 relative">
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
        {/* 상단 타이틀 이미지 */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image
            src="/assets/hero-title.png"
            alt="원하는 시간에 맡기고 원하는 시간에 받아요"
            width={360}
            height={120}
            priority
          />
        </div>

        {/* 서브 비주얼 이미지 */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/hero-sub-visual.png"
            alt="세탁 배달 서브 비주얼"
            width={320}
            height={160}
            priority
          />
        </div>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={() => signIn("kakao", { callbackUrl: "/order" })}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#FEE500] bg-[#FEE500] hover:brightness-95 transition h-12"
          aria-label="카카오로 시작하기"
        >
          <Image
            src="/assets/kakao.png"
            alt="카카오 로고"
            width={20}
            height={20}
          />
          <span className="font-semibold text-[#191600]">카카오로 시작하기</span>
        </button>
      </div>

      {/* 하단 고정 CTA 제거용 스타일 */}
      <style jsx global>{`
        .fixed-bottom-cta {
          display: none !important;
        }
      `}</style>
    </main>
  );
}