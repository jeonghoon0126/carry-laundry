"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddressSection from "@/components/order/AddressSection";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import type { AddressCore } from "@/lib/addresses";

export default function OrderPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<AddressCore | null>(null);
  
  // ✅ 이 페이지에서는 isSubmitting을 절대 사용하지 않습니다.
  //    SimpleCheckoutSheet 내부에서만 관리합니다.
  
  return (
    <main className="min-h-[100dvh] bg-gray-50">
      <div className="mx-auto w-full max-w-[680px] px-4 py-6 space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">세탁 주문</h1>
        </div>

        {/* 페이지 타이틀 */}
        <h1 className="text-2xl font-semibold mb-4">세탁 주문</h1>
        {/* 배송지 정보 섹션 (타이틀 바로 아래) */}
        <AddressSection
          value={shippingAddress}
          onChange={(addr) => setShippingAddress(addr)}
          className="mb-4"
        />
        {/* 체크아웃 시트 */}
        <SimpleCheckoutSheet shippingAddress={shippingAddress} />
      </div>
    </main>
  );
}

// ✅ 주의: page.tsx에서 isSubmitting / isDisabled를 계산하거나 프롭으로 넘기던 코드가 있었다면 전부 제거되었습니다.