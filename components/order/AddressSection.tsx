// components/order/AddressSection.tsx
"use client";
import { useEffect, useState } from "react";
import AddressSearch from "./AddressSearch";
import { AddressCore, loadDefaultAddress, persistDefaultAddress } from "@/lib/addresses";
import { cn } from "@/lib/utils";

type Props = {
  value?: AddressCore | null;
  onChange?: (addr: AddressCore | null) => void;
  className?: string;
};

export default function AddressSection({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [addr, setAddr] = useState<AddressCore | null>(value ?? null);
  const [loading, setLoading] = useState(true);

  // 최초 진입 시 기본 배송지 복원
  useEffect(() => {
    let mounted = true;
    (async () => {
      const a = await loadDefaultAddress();
      if (!mounted) return;
      setAddr(a);
      onChange?.(a ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [onChange]);

  const handleSelect = (base: { zipcode?: string; address1: string; si?: string; gu?: string; dong?: string }) => {
    const next: AddressCore = { ...addr, ...base, isDefault: true };
    setAddr(next);
    onChange?.(next);
    void persistDefaultAddress(next);
  };

  if (loading) {
    return (
      <section className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm p-5", className)}>
        <div className="h-5 w-28 bg-gray-100 rounded mb-3" />
        <div className="h-12 w-full bg-gray-100 rounded" />
      </section>
    );
  }

  // 빈 상태
  if (!addr?.address1) {
    return (
      <section className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm p-5", className)}>
        <p className="text-lg font-semibold mb-3">배송지 정보</p>
        <button
          onClick={() => setOpen(true)}
          className="h-12 w-full rounded-xl border border-gray-300 hover:bg-gray-50 transition text-left px-4"
        >
          <span className="text-gray-400">배송지를 입력해 주세요</span>
        </button>
        <AddressSearch open={open} onClose={() => setOpen(false)} onSelect={handleSelect} />
      </section>
    );
  }

  // 주소가 있는 상태
  return (
    <section className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-semibold">배송지 정보</p>
        <button
          onClick={() => setOpen(true)}
          className="px-3 h-8 rounded-lg bg-teal-100 text-teal-800 text-sm font-medium"
        >
          변경
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xl font-bold">{addr.label ?? "우리집"}</p>
        {addr.isDefault && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">기본 배송지</span>
        )}
      </div>
      <p className="text-gray-700">{addr.name ?? ""}{addr.phone ? ` • ${addr.phone}` : ""}</p>
      <p className="text-gray-600 mt-1">
        {addr.address1} {addr.address2 ? ` ${addr.address2}` : ""}{addr.zipcode ? ` (${addr.zipcode})` : ""}
      </p>
      <AddressSearch open={open} onClose={() => setOpen(false)} onSelect={handleSelect} />
    </section>
  );
}
