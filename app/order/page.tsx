"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddressSection from "@/components/order/AddressSection";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import type { AddressCore } from "@/lib/addresses";

export default function OrderPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<AddressCore | null>(null);
  
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

        {/* 배송지 정보 카드 */}
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