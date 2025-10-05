"use client";
import SimpleCheckoutSheet from "@/components/order/SimpleCheckoutSheet";
import AddressSection from "@/components/order/AddressSection";
import { useState } from "react";
import type { AddressCore } from "@/lib/addresses";

export default function OrderPage() {
  const [address, setAddress] = useState<AddressCore | null>(null);
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="mx-auto max-w-[640px] p-4 space-y-4">
        <AddressSection value={address ?? undefined} onChange={setAddress} />
        {/* 기존 결제/주문 영역 */}
        <SimpleCheckoutSheet shippingAddress={address ?? undefined} />
      </div>
    </div>
  );
}