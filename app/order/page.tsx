"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddressSection from "@/components/order/AddressSection";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import type { AddressCore } from "@/lib/addresses";

// Fix: ensure this page is rendered dynamically, not prerendered.
export const dynamic = "force-dynamic";

function OrderPageContent() {
  // This page must NOT reference isSubmitting. That state lives inside SimpleCheckoutSheet.
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<AddressCore | null>(null);
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleBackClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    router.back();
  };

  const handleCancelCancel = () => {
    setShowCancelModal(false);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold">세탁 주문</h1>
        </div>

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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#13C2C2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                앗, 주문을 취소하시겠어요?
              </h3>
              
              <div className="text-sm text-gray-600 mb-6 space-y-1">
                <p>신청한 내용이 모두 사라집니다.</p>
                <p>정말 취소하고 나가시겠어요?</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelCancel}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  아니요
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#13C2C2] rounded-lg hover:bg-[#0FA8A8] transition-colors"
                >
                  주문 취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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