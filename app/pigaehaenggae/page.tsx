import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Filter, Bot, Heart, ShieldCheck, Smartphone, CheckCircle, Mail, Phone, Building } from 'lucide-react'

export const metadata: Metadata = {
  title: '피개행개 - 큰 개도 갈 수 있는 곳 | 캐리 (Carrie)',
  description: '반려인을 위한 맞춤형 플레이스 탐색 및 AI 산책 플랫폼 피개행개. 운영사: 캐리 (Carrie) | 사업자등록번호: 521-23-01693 | 대표자: 함정훈',
  openGraph: {
    title: '피개행개 - 큰 개도 갈 수 있는 곳 | 캐리 (Carrie)',
    description: '반려견 동반 플레이스 큐레이션 및 AI 산책 플랫폼 피개행개 (운영사: 캐리)',
    url: 'https://carry-laundry.vercel.app/pigaehaenggae',
    siteName: '캐리 (Carrie)',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function PigaehaenggaePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🐾 피개행개
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              by 캐리 (Carrie)
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">주요 기능</a>
            <a href="#ai-tech" className="hover:text-emerald-600 transition-colors">AI 큐레이션</a>
            <a href="#company" className="hover:text-emerald-600 transition-colors">회사 소개</a>
            <Link href="/home" className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              🧺 캐리 세탁 바로가기
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs md:text-sm font-semibold">
            <span>✨</span> 1,500만 반려인을 위한 맞춤형 펫 라이프케어 O2O
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            큰 개도 갈 수 있는 곳,<br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              실패 없는 애견동반 플레이스
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            견종과 몸무게 맞춤 필터로 찾는 전국 <strong>4,600+</strong> 카페, 식당, 운동장, 숙소.<br className="hidden sm:inline" />
            매일의 산책 기록부터 AI 맞춤 코스 추천까지, 피개행개와 함께하세요.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 전국 4,660+ 등록 플레이스
            </div>
            <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 견종/몸무게별 맞춤 필터
            </div>
            <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Amazon Bedrock AI 기반
            </div>
            <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> iOS TestFlight 배포 중 (v1.0.7)
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            반려인의 모든 순간을 세심하게
          </h2>
          <p className="text-slate-600 text-sm md:text-base">
            블로그 광고와 불확실한 정보에 속지 않는 진짜 펫 프렌들리 플랫폼
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. 견종·몸무게별 완벽 맞춤 필터</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              소형견 전용인지, 대형견도 가능한지 매번 전화해 볼 필요 없습니다. 체중, 견종, 오프리시 가능 여부, 실내외 동반 규정을 클릭 한 번으로 걸러냅니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. 전국 4,600+ 검증된 플레이스</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              애견동반 식당, 카페부터 전용 운동장, 수영장, 펜션, 24시 응급 동물병원까지 내 위치를 기반으로 실시간 운영 정보와 이용 수칙을 안내합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. AI 맞춤 산책 코스 & 스마트 챗봇</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Amazon Bedrock의 최첨단 파운데이션 모델(Claude)을 활용해 견종의 연령·활동량과 실시간 날씨를 고려한 1:1 맞춤 산책 코스를 생성합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">4. 데일리 산책 링 & 기록 트래커</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              우리 강아지 권장 산책 시간을 채우면 링이 완성됩니다. 이동 경로와 시간을 기록하고 동네 반려견 친구들과 함께 건강한 일상을 만듭니다.
            </p>
          </div>
        </div>
      </section>

      {/* AI 기술 스택 및 클라우드 아키텍처 */}
      <section id="ai-tech" className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">Cloud & AI Architecture</span>
            <h2 className="text-2xl md:text-3xl font-bold">AWS 클라우드 인프라와 첨단 AI 기술</h2>
            <p className="text-slate-400 text-sm md:text-base">
              피개행개는 신뢰도 높은 클라우드 아키텍처 위에서 빠르고 안전하게 운영됩니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-2">
              <h4 className="font-semibold text-emerald-400">Amazon Bedrock AI</h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                Anthropic Claude 파운데이션 모델을 활용한 견종별 맞춤형 산책 코스 생성, 동반 장소 자연어 질의응답 에이전트 서빙.
              </p>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-2">
              <h4 className="font-semibold text-emerald-400">AWS Cloud Backend</h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                고가용성 서버리스 아키텍처와 S3 이미지 스토리지, 안전한 데이터베이스를 통해 실시간 플레이스 정보와 사용자 리뷰를 처리.
              </p>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-2">
              <h4 className="font-semibold text-emerald-400">iOS Native & O2O</h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                iOS 네이티브 최적화 및 위치 기반 O2O 연동으로 지체 없는 지도 렌더링과 오프라인 반려견 시설 예약 연계.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 운영사 소개 (캐리 / Carrie) 섹션 */}
      <section id="company" className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="border border-slate-200 bg-white rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Building className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">운영사 정보 — 캐리 (Carrie)</h3>
              <p className="text-xs text-slate-500">Lifestyle O2O Solutions & Pet Platform</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>캐리(Carrie)</strong>는 일상에서 반복되는 번거로움을 덜어주는 기술 기반의 O2O 라이프케어 서비스를 개발·운영하는 혁신 스타트업입니다.
            </p>
            <p>
              비대면 수거·배달 세탁 중개 플랫폼인 <strong>&apos;캐리 세탁&apos;</strong>과 1,500만 반려가구를 위한 장소 큐레이션 및 AI 산책 플랫폼인 <strong>&apos;피개행개&apos;</strong>를 통해 고객의 삶을 더 가볍고 가치 있게 만드는 데 집중하고 있습니다.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600">
            <div><strong>상호명:</strong> 캐리 (Carrie)</div>
            <div><strong>대표자:</strong> 함정훈 (Jeonghoon Ham)</div>
            <div><strong>사업자등록번호:</strong> 521-23-01693</div>
            <div><strong>통신판매업신고:</strong> 제2024-인천계양-1064호</div>
            <div><strong>사업장 소재지:</strong> 인천광역시 부평구 부평동 908-1</div>
            <div><strong>연구·개발 사무소:</strong> 서울특별시 강북구 솔샘로59길 18 303호</div>
            <div><strong>대표 이메일:</strong> kham0126@gmail.com</div>
            <div><strong>AWS 계정 이메일:</strong> kham0126+aws@gmail.com</div>
            <div><strong>고객센터/연락처:</strong> 010-9432-0293</div>
            <div><strong>주요 서비스:</strong> 캐리 세탁, 피개행개(반려동물 O2O)</div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-semibold text-slate-700">
              캐리 (Carrie) · 피개행개 (Pigaehaenggae)
            </div>
            <div className="flex items-center gap-3">
              <Link href="/terms" className="hover:underline">이용약관</Link>
              <span>|</span>
              <Link href="/privacy" className="hover:underline">개인정보 처리방침</Link>
              <span>|</span>
              <Link href="/home" className="hover:underline text-emerald-600 font-medium">캐리 세탁 홈</Link>
            </div>
          </div>
          <p className="text-slate-400">
            © 2024-2026 Carrie. All rights reserved. 본 웹사이트는 캐리(Carrie)가 운영하는 반려동물 O2O 서비스 &apos;피개행개&apos;의 공식 웹사이트입니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
