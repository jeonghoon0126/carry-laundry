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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 결제 실패 에러 체크
    const error = searchParams.get('error');
    const reason = searchParams.get('reason');
    const status = searchParams.get('status');
    
    // 디버깅을 위한 상세 로그
    console.log('OrderPage - URL params check:', {
      error,
      reason,
      status,
      allParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    });
    
    if (error === 'payment_failed') {
      setShowError(true);
      
      // reason이 null이거나 비어있을 때 기본 메시지 사용
      const errorReason = reason && reason.trim() ? reason : '알 수 없는 오류가 발생했습니다.';
      const errorDetails = status ? ` (상태코드: ${status})` : '';
      const fullErrorMessage = `${errorReason}${errorDetails}`;
      
      setErrorMessage(fullErrorMessage);
      
      console.error('Payment failed:', { 
        error, 
        reason: errorReason, 
        status,
        originalReason: reason,
        fullMessage: fullErrorMessage,
        timestamp: new Date().toISOString(),
        location: 'OrderPageContent useEffect',
        url: window.location.href,
        searchParamsString: searchParams.toString()
      });
      
      // URL에서 에러 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('reason');
      url.searchParams.delete('status');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        <h1 className="text-2xl font-semibold mb-4">세탁 주문</h1>

        {/* 결제 실패 에러 메시지 */}
        {showError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-medium mb-1">결제에 실패했습니다</p>
                <p className="text-red-600 text-sm mb-2 leading-relaxed">{errorMessage}</p>
                <div className="flex items-center gap-2">
                  <p className="text-red-500 text-xs">다시 시도해주세요</p>
                  <button
                    onClick={() => setShowError(false)}
                    className="text-red-400 hover:text-red-600 text-xs underline ml-auto"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 배송지 정보 섹션 */}
        <AddressSection
          value={shippingAddress || undefined}
          onChange={(addr) => setShippingAddress(addr)}
          className="mb-4"
        />

        {/* 결제 섹션 (isSubmitting은 내부에서 관리) */}
        <SimpleCheckoutSheet shippingAddress={shippingAddress || undefined} />
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