"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AddressSection from "@/components/order/AddressSection";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import type { AddressCore } from "@/lib/addresses";

// Fix: ensure this page is rendered dynamically, not prerendered.
export const dynamic = "force-dynamic";

function OrderPageContent() {
  // This page must NOT reference isSubmitting. That state lives inside SimpleCheckoutSheet.
  const [shippingAddress, setShippingAddress] = useState<AddressCore | null>(null);
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // 결제 실패 에러 체크
    const error = searchParams.get('error');
    if (error === 'payment_failed') {
      setShowError(true);
      // URL에서 에러 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        <h1 className="text-2xl font-semibold mb-4">세탁 주문</h1>

        {/* 결제 실패 에러 메시지 */}
        {showError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">결제에 실패했습니다</p>
                <p className="text-red-600 text-sm">다시 시도해주세요</p>
              </div>
              <button
                onClick={() => setShowError(false)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 배송지 정보 섹션 */}
        <AddressSection
          value={shippingAddress}
          onChange={(addr) => setShippingAddress(addr)}
          className="mb-4"
        />

        {/* 결제 섹션 (isSubmitting은 내부에서 관리) */}
        <SimpleCheckoutSheet shippingAddress={shippingAddress} />
      </div>
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] w-full bg-gray-50 px-4 py-6 flex items-center justify-center">로딩 중...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}