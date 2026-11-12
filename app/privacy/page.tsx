import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Mail, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: '개인정보 처리방침 | 피개행개 - 캐리 (Carrie)',
  description: '피개행개 서비스 개인정보 처리방침 안내 (운영사: 캐리)',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              개인정보 처리방침
            </h1>
            <p className="text-xs text-slate-500">
              최종 개정일: 2026년 11월 7일 | 시행일: 2026년 11월 7일
            </p>
          </div>
          <Link
            href="/pigaehaenggae"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 피개행개 홈
          </Link>
        </div>

        {/* 본문 내용 */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          
          <p>
            <strong>캐리(Carrie)</strong>(이하 &apos;회사&apos;)는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. 개인정보의 처리 목적 및 수집 항목</h2>
            <p>회사는 다음의 목적을 위하여 필요한 최소한의 개인정보를 수집·처리합니다.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div><strong>① 서비스 회원가입 및 본인 확인:</strong> 성명, 휴대전화번호, 이메일 주소, 로그인 식별자</div>
              <div><strong>② 요금 결제 및 정산:</strong> 신용카드 정보(카드사명, 일부 마스킹 카드번호), 결제 승인번호, 은행계좌 정보 (결제 대행사를 통한 암호화 처리)</div>
              <div><strong>③ AI 맞춤 산책 코스 및 서비스 제공:</strong> 반려동물 정보(견종, 체중, 연령, 활동 성향), 위치 정보(GPS 기반 인근 장소 탐색 시)</div>
              <div><strong>④ 고객 상담 및 불만 처리:</strong> 상담 내역, 연락처, 기기 식별값</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. 개인정보의 보유 및 이용 기간</h2>
            <p>
              회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
              <li>회원 탈퇴 시: 지체 없이 파기 (단, 관계 법령에 따라 보존 의무가 있는 경우 해당 법령 기준 준수)</li>
              <li>전자상거래 등에서의 소비자보호에 관한 법률: 계약 또는 청약철회에 관한 기록 (5년), 대금결제 및 재화 공급에 관한 기록 (5년), 소비자 불만 또는 분쟁 처리에 관한 기록 (3년)</li>
              <li>통신비밀보호법: 서비스 이용 로그기록, 접속 IP 정보 (3개월)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. 개인정보의 제3자 제공 및 업무 위탁</h2>
            <p>
              회사는 이용자의 개인정보를 명시된 범위를 초과하여 제3자에게 제공하지 않습니다. 원활한 서비스 제공과 안전한 전자결제 처리를 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
            </p>
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 text-xs space-y-1">
              <div><strong>수탁업체:</strong> (주)코리아포트원, 토스페이먼츠(주)</div>
              <div><strong>위탁업무 내용:</strong> 전자결제 연동 API 및 신용카드, 계좌이체, 간편결제 등 전자결제 대행 및 에스크로(구매안전) 서비스 제공</div>
              <div><strong>보유 및 이용기간:</strong> 회원 탈퇴 시 또는 결제 대행 위탁 계약 종료 시까지 (관계 법령 준수)</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. 정보주체의 권리·의무 및 행사방법</h2>
            <p>
              정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있으며, 회사는 이에 대해 지체 없이 조치합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. 개인정보 보호책임자</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5 text-slate-600">
              <div><strong>개인정보 보호책임자:</strong> 함정훈 (대표)</div>
              <div><strong>소속/직책:</strong> 캐리 (Carrie) / 대표</div>
              <div><strong>연락처:</strong> 010-9432-0293</div>
              <div><strong>이메일:</strong> kham0126@gmail.com</div>
              <div><strong>주소:</strong> 인천광역시 부평구 길주남로73번길 33-7, 1층 (부평동) (서울 연구소: 서울특별시 강북구 솔샘로59길 18 303호)</div>
            </div>
          </section>

        </div>

        {/* 고객센터 안내 */}
        <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 010-9432-0293</span>
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> kham0126@gmail.com</span>
          </div>
          <div>© Carrie. All rights reserved.</div>
        </div>

      </div>
    </div>
  )
}
