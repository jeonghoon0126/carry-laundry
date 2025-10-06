"use client";
import React, { useEffect, useState } from "react";
import AddressSection from "@/components/order/AddressSection";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import type { AddressCore } from "@/lib/addresses";

// Prevent Next.js from trying to prerender this page at build time.
export const dynamic = "force-dynamic";

export default function OrderPage() {
  // This page must NOT reference isSubmitting. That state lives inside SimpleCheckoutSheet.
  const [shippingAddress, setShippingAddress] = useState<AddressCore | null>(null);

  useEffect(() => {
    // 페이지 진입 시 필요한 초기화가 있다면 여기서 처리
  }, []);

  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-4">세탁 주문</h1>

        {/* Address section directly under the title */}
        <AddressSection
          value={shippingAddress}
          onChange={(addr) => setShippingAddress(addr)}
          className="mb-4"
        />

        {/* Checkout Sheet (handles its own submitting state) */}
        <SimpleCheckoutSheet shippingAddress={shippingAddress} />
      </div>
    </main>
  );
}