"use client";
import { useState } from "react";
import AddressSection from "@/components/order/AddressSection";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import type { AddressCore } from "@/lib/addresses";

export default function OrderPage() {
  const [shippingAddress, setShippingAddress] = useState<AddressCore | null>(null);
  return (
    <main className="min-h-[100dvh] bg-gray-50">
      <div className="mx-auto w-full max-w-[680px] px-4 py-6 space-y-6">
        {/* 타이틀을 먼저 노출 */}
        <h1 className="text-2xl font-bold text-gray-900">세탁 주문</h1>

        {/* 타이틀 아래에 배송지 정보 카드 배치 (디자인 통일) */}
        <AddressSection
          value={shippingAddress}
          onChange={setShippingAddress}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5"
        />

        {/* 체크아웃 시트에서는 내부 배송지 입력을 숨김 -> 중복 제거 */}
        <SimpleCheckoutSheet
          shippingAddress={shippingAddress}
          hideAddressInput
        />
      </div>
    </main>
  );
}