export default function Footer() {
  return (
    <footer className="w-full">
      <div className="mx-auto max-w-[520px] px-4 py-6 space-y-2 text-sm bg-gray-100 text-gray-600">
        <h3 className="text-base font-semibold text-gray-800">캐리</h3>
        <ul className="space-y-1">
          <li>사업자 등록번호 : 521-23-01693</li>
          <li>대표 : 함 정훈</li>
          <li>주소 : 부평동 908-1</li>
          <li>이메일 : <a href="mailto:kham0126@gmail.com" className="underline hover:no-underline">kham0126@gmail.com</a></li>
          <li>통신판매업신고 : 2024-인천계양-1064</li>
          <li>고객센터 : <a href="tel:01094320293" className="underline hover:no-underline">010-9432-0293</a></li>
        </ul>
        <p className="pt-2 text-gray-500">©Laundrypeople. ALL RIGHTS RESERVED</p>
        <div className="pt-1 flex items-center gap-3">
          <a href="/terms" className="hover:underline">이용약관</a>
          <span className="text-gray-400">|</span>
          <a href="/privacy" className="hover:underline">개인정보 처리방침</a>
        </div>
      </div>
    </footer>
  )
}
