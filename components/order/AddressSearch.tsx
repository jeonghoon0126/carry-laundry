// components/order/AddressSearch.tsx
"use client";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (addr: {
    zipcode?: string;
    address1: string;
    si?: string;
    gu?: string;
    dong?: string;
  }) => void;
};

// 다음 우편번호 모달(Portal 없이 단순 렌더)
export default function AddressSearch({ open, onClose, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // 스크립트 로드
    const id = "daum-postcode";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      s.async = true;
      s.onload = () => openLayer();
      document.body.appendChild(s);
    } else {
      openLayer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const parseRegion = (addr: string) => {
    // 아주 단순 파서(서울시/구/동 추출). 프로젝트에 맞게 개선 가능.
    const parts = addr.split(" ");
    return {
      si: parts[0]?.replace(/(특별시|광역시|시)$/, "") || undefined,
      gu: parts[1] || undefined,
      dong: parts[2] || undefined,
    };
  };

  const openLayer = () => {
    // @ts-ignore
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        const address1 = data.roadAddress || data.address;
        const zipcode = data.zonecode;
        const r = parseRegion(address1);
        onSelect({ zipcode, address1, ...r });
        onClose();
      },
      onresize: function () {},
      width: "100%",
      height: "100%",
    }).embed(wrapRef.current);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="absolute inset-x-0 bottom-0 top-14 bg-white rounded-t-2xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-medium">주소 검색</span>
          <button onClick={onClose} className="text-sm text-gray-600">닫기</button>
        </div>
        <div ref={wrapRef} className="w-full h-[calc(100%-49px)]" />
      </div>
    </div>
  );
}
