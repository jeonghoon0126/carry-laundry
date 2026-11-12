import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Building, Mail, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: '이용약관 및 환불정책 | 피개행개 - 캐리 (Carrie)',
  description: '피개행개 서비스 이용약관 및 결제·청약철회·환불 규정 안내 (운영사: 캐리)',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              서비스 이용약관 및 환불정책
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

        {/* 본문 약관 */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제1조 (목적)</h2>
            <p>
              본 약관은 <strong>캐리(Carrie)</strong>(이하 &apos;회사&apos;)가 제공하는 반려동물 AI 산책 코스 생성 및 동반 장소 큐레이션 서비스인 <strong>&apos;피개행개&apos;</strong>(이하 &apos;서비스&apos;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 요금 결제 및 환불 등에 관한 제반 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제2조 (회사 정보 및 연락처)</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs text-slate-600">
              <div><strong>상호명:</strong> 캐리 (Carrie)</div>
              <div><strong>대표자:</strong> 함정훈</div>
              <div><strong>사업자등록번호:</strong> 521-23-01693</div>
              <div><strong>업태 / 종목:</strong> 정보통신업 / 응용 소프트웨어 개발 및 공급업</div>
              <div><strong>사업장 소재지:</strong> 인천광역시 부평구 길주남로73번길 33-7, 1층 (부평동)</div>
              <div><strong>연구소 소재지:</strong> 서울특별시 강북구 솔샘로59길 18 303호</div>
              <div><strong>대표 전화번호:</strong> 010-9432-0293</div>
              <div><strong>대표 이메일:</strong> kham0126@gmail.com</div>
              <div><strong>통신판매업신고:</strong> 전자상거래법 제12조에 의거 결제 서비스(구매안전서비스) 연동 완료 후 관할 지자체 신고 진행 중</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제3조 (서비스 상품의 내용 및 이용 요금)</h2>
            <p>
              회사가 제공하는 유료 디지털 소프트웨어 라이선스 상품 및 이용 요금은 다음과 같습니다 (부가가치세 포함 금액).
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 text-sm">피개행개 베이직 이용권 (1개월)</div>
                <div className="text-base font-extrabold text-emerald-600">14,900원 (일시불)</div>
                <div className="text-xs text-slate-500">전국 4,600+ 플레이스 무제한 조회, AI 산책 코스 일 5회 생성, 실시간 기상 연동</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 text-sm">피개행개 프리미엄 패스 (1년)</div>
                <div className="text-base font-extrabold text-emerald-600">49,000원 (일시불)</div>
                <div className="text-xs text-slate-500">베이직 전체 기능 + AI 산책 코스 무제한, 천연잔디 오프리시 비밀 스팟, 1:1 활동량 리포트</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              ※ 본 이용권은 정기결제(자동 연장)가 아니며, 기간 만료 시 자동 청구되지 않는 단건(일시불) 결제 상품입니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제4조 (결제 방법 및 구매 안전)</h2>
            <p>
              1. 이용자는 신용·체크카드, 계좌이체, 토스페이·네이버페이·카카오페이 등 회사가 제공하는 전자결제 수단을 통해 이용 요금을 결제할 수 있습니다.<br />
              2. 모든 전자금융 결제는 (주)코리아포트원 및 토스페이먼츠(주)의 전자결제 대행 시스템과 에스크로(구매안전서비스) 시스템을 통해 안전하게 처리됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제5조 (청약철회 및 환불 규정)</h2>
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-emerald-900">
                회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠이용자보호지침」을 준수하며, 명확하고 공정한 환불 정책을 운영합니다.
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  <strong>전액 환불 (7일 이내 미이용):</strong> 결제일로부터 7일 이내에 유료 AI 기능이나 유료 콘텐츠를 전혀 이용하지 않은 경우, 전액 환불(청약철회)이 가능합니다.
                </li>
                <li>
                  <strong>중도 해지 및 부분 환불:</strong> 결제일로부터 7일이 경과하였거나 유료 기능을 이미 이용한 경우, 이용 일수 또는 사용한 AI 토큰에 비례한 금액과 결제 수수료(10%)를 차감한 잔액이 환불됩니다.
                </li>
                <li>
                  <strong>서비스 하자 및 중단:</strong> 회사의 귀책사유로 인하여 서비스가 24시간 이상 연속 중단되거나 정상 이용이 불가한 경우 전액 환불 또는 이용 기간 연장 조치를 취합니다.
                </li>
                <li>
                  <strong>환불 신청 절차:</strong> 이용자는 고객센터(이메일: kham0126@gmail.com, 전화: 010-9432-0293)로 환불을 요청할 수 있으며, 회사는 접수일로부터 영업일 기준 3일 이내에 환불을 진행합니다 (카드사 취소 처리 시점에 따라 3~5 영업일 소요).
                </li>
              </ol>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제6조 (개인정보 보호 및 보안)</h2>
            <p>
              회사는 이용자의 개인정보를 소중히 보호하며, 관련 법령 및 회사의 <Link href="/privacy" className="text-emerald-600 underline font-semibold">개인정보 처리방침</Link>에 따라 엄격히 관리합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제7조 (분쟁의 해결)</h2>
            <p>
              본 약관과 관련된 분쟁에 대해서는 대한민국 법령을 준거법으로 하며, 회사와 이용자 간 분쟁이 발생할 경우 상호 원만한 합의를 위해 성실히 협의합니다. 합의가 이루어지지 않을 경우 관할 법원은 민사소송법에 따릅니다.
            </p>
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
