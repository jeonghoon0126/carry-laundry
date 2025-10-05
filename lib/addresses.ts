// lib/addresses.ts
// 기본 배송지 저장/복원 유틸(로그인: Supabase, 비로그인: localStorage)
export type AddressCore = {
  label?: string; // 예: 우리집, 회사
  name?: string;
  phone?: string;
  zipcode?: string;
  address1: string; // 도로명주소
  address2?: string; // 상세주소
  si?: string;
  gu?: string;
  dong?: string;
  isDefault?: boolean;
};

const LS_KEY = "carry.defaultAddress.v1";

export function loadDefaultAddressFromLS(): AddressCore | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDefaultAddressToLS(addr: AddressCore) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, JSON.stringify({ ...addr, isDefault: true }));
    }
  } catch {}
}

// Supabase 저장(있으면), 실패하면 localStorage만 유지
export async function persistDefaultAddress(addr: AddressCore) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) {
      saveDefaultAddressToLS(addr);
      return;
    }
    const supabase = createClient(url, anon);
    // auth user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      saveDefaultAddressToLS(addr);
      return;
    }
    // profiles에 shipping_default 같은 json 컬럼이 있다고 가정.
    // 없다면 upsert 시 jsonb 컬럼을 생성해 사용(프로젝트에 맞게 조정).
    const payload = { shipping_default: { ...addr, isDefault: true } };
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...payload }, { onConflict: "id" });
    if (error) {
      saveDefaultAddressToLS(addr);
    } else {
      saveDefaultAddressToLS(addr); // 로컬에도 동기화
    }
  } catch {
    saveDefaultAddressToLS(addr);
  }
}

export async function loadDefaultAddress(): Promise<AddressCore | null> {
  // 우선 Supabase 시도 → 실패 시 로컬
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return loadDefaultAddressFromLS();
    const supabase = createClient(url, anon);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return loadDefaultAddressFromLS();
    const { data, error } = await supabase
      .from("profiles")
      .select("shipping_default")
      .eq("id", user.id)
      .single();
    if (error) return loadDefaultAddressFromLS();
    if (data?.shipping_default) {
      const a = data.shipping_default as AddressCore;
      saveDefaultAddressToLS(a);
      return a;
    }
    return loadDefaultAddressFromLS();
  } catch {
    return loadDefaultAddressFromLS();
  }
}
