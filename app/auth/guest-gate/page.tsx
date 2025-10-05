"use client";
import Image from "next/image";

export default function GuestGatePage() {
  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
        {/* 상단 타이틀 이미지 */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Image
            src="/assets/hero-title.png"
            alt="원하는 시간에 맡기고 원하는 시간에 받아요"
            width={360}
            height={120}
            priority
          />
        </div>
        {/* 서브 비주얼 이미지 */}
        <div className="flex justify-center">
          <Image
            src="/assets/hero-sub-visual.png"
            alt="세탁 배달 서브 비주얼"
            width={320}
            height={160}
            priority
          />
        </div>
      </div>
    </main>
  );
}