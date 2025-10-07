// components/order/AddressSection.tsx
"use client";
import { useEffect, useState } from "react";
import AddressSearch from "./AddressSearch";
import { AddressCore, loadDefaultAddress, persistDefaultAddress } from "@/lib/addresses";
import { cn } from "@/lib/utils";
import { SkeletonAddressCard } from "@/components/common/Skeleton";

type Props = {
  value?: AddressCore | null;
  onChange?: (addr: AddressCore | null) => void;
  className?: string;
};

export default function AddressSection({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [addr, setAddr] = useState<AddressCore | null>(value ?? null);
  const [loading, setLoading] = useState(true);

  // 최초 진입 시 기본 배송지 복원 (마이페이지 배송지 관리와 연동)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 먼저 마이페이지 배송지 관리에서 기본 배송지 가져오기
        const response = await fetch('/api/addresses');
        if (response.ok) {
          const data = await response.json();
          const defaultAddress = data.addresses?.find((addr: any) => addr.is_default);
          
          if (defaultAddress) {
            const addressCore: AddressCore = {
              label: defaultAddress.name,
              name: defaultAddress.name,
              address1: defaultAddress.address1,
              address2: defaultAddress.address2,
              addressDetail: defaultAddress.address_detail,
              entranceMethod: defaultAddress.entrance_method,
              entranceNote: defaultAddress.entrance_note,
              isDefault: defaultAddress.is_default
            };
            
            if (!mounted) return;
            setAddr(addressCore);
            onChange?.(addressCore);
            setLoading(false);
            return;
          }
        }
        
        // 마이페이지에 배송지가 없으면 기존 방식 사용
        const a = await loadDefaultAddress();
        if (!mounted) return;
        setAddr(a);
        onChange?.(a ?? null);
      } catch (error) {
        console.error('Error loading addresses:', error);
        // 에러 시 기존 방식 사용
        const a = await loadDefaultAddress();
        if (!mounted) return;
        setAddr(a);
        onChange?.(a ?? null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [onChange]);

  const handleSelect = async (base: { zipcode?: string; address1: string; si?: string; gu?: string; dong?: string }) => {
    const next: AddressCore = { 
      ...addr, 
      ...base, 
      label: addr?.label || '우리집',
      name: addr?.name || '',
      isDefault: true 
    };
    setAddr(next);
    onChange?.(next);
    
    try {
      // 마이페이지 배송지 관리 API에 저장
      const addressData = {
        name: next.label || '우리집',
        address1: next.address1,
        address2: next.address2 || '',
        address_detail: next.addressDetail || '',
        entrance_method: next.entranceMethod || '',
        entrance_note: next.entranceNote || '',
        is_default: true
      };
      
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });
      
      if (!response.ok) {
        console.error('Failed to save address to database');
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    
    // 기존 방식도 유지 (fallback)
    void persistDefaultAddress(next);
  };

  if (loading) {
    return <SkeletonAddressCard className={className} />;
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

      {/* 상세주소 입력 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          상세주소
        </label>
        <input
          type="text"
          value={addr.addressDetail || ""}
          onChange={async (e) => {
            const updated = { ...addr, addressDetail: e.target.value };
            setAddr(updated);
            onChange?.(updated);
            
            // 마이페이지 배송지 관리 API 업데이트
            try {
              const response = await fetch('/api/addresses');
              if (response.ok) {
                const data = await response.json();
                const defaultAddress = data.addresses?.find((addr: any) => addr.is_default);
                
                if (defaultAddress) {
                  await fetch(`/api/addresses/${defaultAddress.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...defaultAddress,
                      address_detail: e.target.value
                    })
                  });
                }
              }
            } catch (error) {
              console.error('Error updating address detail:', error);
            }
            
            // 기존 방식도 유지 (fallback)
            void persistDefaultAddress(updated);
          }}
          placeholder="동/호수 등"
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
        />
      </div>

      {/* 현관 출입 방법 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          현관 출입 방법
        </label>
        <div className="space-y-2">
          {[
            { value: "free", label: "자유 출입" },
            { value: "password", label: "공동현관 비밀번호" },
            { value: "security", label: "경비실 호출" },
            { value: "other", label: "기타" }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="entranceMethod"
                value={option.value}
                checked={addr.entranceMethod === option.value}
                onChange={async (e) => {
                  const updated = { ...addr, entranceMethod: e.target.value as any };
                  setAddr(updated);
                  onChange?.(updated);
                  
                  // 마이페이지 배송지 관리 API 업데이트
                  try {
                    const response = await fetch('/api/addresses');
                    if (response.ok) {
                      const data = await response.json();
                      const defaultAddress = data.addresses?.find((addr: any) => addr.is_default);
                      
                      if (defaultAddress) {
                        await fetch(`/api/addresses/${defaultAddress.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...defaultAddress,
                            entrance_method: e.target.value
                          })
                        });
                      }
                    }
                  } catch (error) {
                    console.error('Error updating entrance method:', error);
                  }
                  
                  // 기존 방식도 유지 (fallback)
                  void persistDefaultAddress(updated);
                }}
                className="w-4 h-4 text-[#13C2C2]"
              />
              <span className="text-sm text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>

        {/* 출입 안내 입력 (password 또는 other 선택 시) */}
        {(addr.entranceMethod === "password" || addr.entranceMethod === "other") && (
          <div className="mt-3">
            <input
              type="text"
              value={addr.entranceNote || ""}
              onChange={async (e) => {
                const updated = { ...addr, entranceNote: e.target.value };
                setAddr(updated);
                onChange?.(updated);
                
                // 마이페이지 배송지 관리 API 업데이트
                try {
                  const response = await fetch('/api/addresses');
                  if (response.ok) {
                    const data = await response.json();
                    const defaultAddress = data.addresses?.find((addr: any) => addr.is_default);
                    
                    if (defaultAddress) {
                      await fetch(`/api/addresses/${defaultAddress.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...defaultAddress,
                          entrance_note: e.target.value
                        })
                      });
                    }
                  }
                } catch (error) {
                  console.error('Error updating entrance note:', error);
                }
                
                // 기존 방식도 유지 (fallback)
                void persistDefaultAddress(updated);
              }}
              placeholder="출입 안내"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
            />
          </div>
        )}
      </div>

      <AddressSearch open={open} onClose={() => setOpen(false)} onSelect={handleSelect} />
    </section>
  );
}
