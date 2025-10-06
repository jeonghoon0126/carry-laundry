# 🧪 최종 결제 시스템 테스트 가이드

## 📋 **테스트 체크리스트**

### ✅ **1. 환경 설정 확인**
- [x] Vercel 환경 변수 설정 완료
- [x] Supabase Service Role Key 설정 완료
- [x] Toss Payments 키 설정 완료

### 🧪 **2. 실제 결제 테스트**

#### **A. 정상 결제 플로우**
1. **프로덕션 사이트 접속**: https://carry-laundry.vercel.app
2. **주문 페이지 이동**: https://carry-laundry.vercel.app/order
3. **배송지 입력**:
   - 주소 검색으로 정확한 주소 입력
   - 이름, 전화번호 입력
4. **결제 진행**:
   - "결제하기" 버튼 클릭
   - Toss Payments 위젯에서 테스트 카드 사용
   - 결제 완료
5. **결과 확인**:
   - 결제 완료 페이지로 리다이렉트
   - DB에서 `paid: true` 확인

#### **B. 결제 실패 시나리오 테스트**
1. **결제 취소**:
   - 결제 위젯에서 "취소" 클릭
   - 에러 메시지 정상 표시 확인
2. **잘못된 카드 정보**:
   - 만료된 카드 번호 입력
   - 에러 메시지 정상 표시 확인
3. **네트워크 오류**:
   - 네트워크 연결 끊기
   - 재연결 후 에러 메시지 확인

### 📊 **3. DB 데이터 검증**

#### **Supabase 대시보드에서 확인**
1. **orders 테이블 접속**
2. **최신 주문 확인**:
   ```sql
   SELECT id, name, phone, address1, paid, payment_id, payment_amount, created_at 
   FROM orders 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
3. **결제 완료된 주문 확인**:
   ```sql
   SELECT * FROM orders WHERE paid = true ORDER BY created_at DESC;
   ```

### 🎯 **4. 예상 결과**

#### **정상 결제 시**
- ✅ 결제 완료 페이지로 리다이렉트
- ✅ DB에 `paid: true` 저장
- ✅ `payment_id`, `payment_amount` 저장
- ✅ 에러 없음

#### **결제 실패 시**
- ✅ 주문 페이지로 리다이렉트
- ✅ 구체적인 에러 메시지 표시
- ✅ DB에 `paid: false` 유지
- ✅ URL에 `error=payment_failed&reason=구체적메시지`

### 🔍 **5. 디버깅 도구**

#### **브라우저 개발자 도구**
- **Console 탭**: 에러 로그 확인
- **Network 탭**: API 호출 상태 확인
- **Application 탭**: 로컬 스토리지 확인

#### **Vercel 로그 확인**
```bash
vercel logs --follow
```

### 📱 **6. 다양한 환경 테스트**

- [ ] **데스크톱**: Chrome, Firefox, Safari
- [ ] **모바일**: iOS Safari, Android Chrome
- [ ] **다양한 화면 크기**: 반응형 테스트

### 🚨 **7. 문제 발생 시 체크리스트**

1. **환경 변수 확인**:
   ```bash
   curl https://carry-laundry.vercel.app/api/payments/env-check
   ```

2. **API 엔드포인트 테스트**:
   ```bash
   curl https://carry-laundry.vercel.app/api/payments/confirm?paymentKey=test&orderId=test&amount=1000
   ```

3. **브라우저 캐시 삭제**:
   - Ctrl+Shift+R (강제 새로고침)
   - 개발자 도구 → Application → Storage → Clear storage

## 🎉 **테스트 완료 후**

모든 테스트가 통과하면:
1. ✅ 결제 시스템 완전 작동 확인
2. ✅ 사용자에게 서비스 제공 가능
3. ✅ 다음 단계 (UX 개선) 진행

---

**테스트 시작**: https://carry-laundry.vercel.app/order
