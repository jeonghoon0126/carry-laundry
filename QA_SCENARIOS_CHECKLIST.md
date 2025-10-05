# QA Scenarios Checklist - New Order Page (`/order/new`)

## 🎨 UI/UX Validation

### Initial Load & Layout
- [ ] **390px View**: Page loads correctly at 390px width with proper card radius (`rounded-2xl`)
- [ ] **Shadow**: Cards display subtle shadow (`shadow-sm`) consistently
- [ ] **Responsive**: On desktop (≥640px), page stays centered at 390px max-width
- [ ] **Background**: Page uses `bg-gray-50` background
- [ ] **Icons**: All icons use brand color `#13C2C2`

## 📋 Form Validation

### Address Selection
- [ ] **Default Address**: Shows mock address "서울 관악구 과천대로 863 (남현동)"
- [ ] **Change Button**: "변경" button links to `/home` (temporary)
- [ ] **CTA State**: Button disabled when address not selected (always enabled for mock)

### Time Selection
- [ ] **Pickup Times**: 4 options (오늘 오후/저녁, 내일 오전/오후) display correctly
- [ ] **Delivery Times**: 4 options (내일 오후/저녁, 모레 오전/오후) display correctly
- [ ] **Selection State**: Selected time shows brand color border and background
- [ ] **Hover State**: Unselected times show hover effects
- [ ] **Form Validation**: CTA disabled until both pickup and delivery times selected

### Payment Method
- [ ] **Default Selection**: "토스 간편결제" selected by default
- [ ] **Radio Cards**: Both payment methods display as selectable cards
- [ ] **Selection State**: Selected method shows brand color border and background
- [ ] **Default Badge**: "토스 간편결제" shows "기본" badge

### Special Requests
- [ ] **Textarea**: 3-line textarea with placeholder text
- [ ] **Focus State**: Textarea shows brand color focus ring
- [ ] **Optional Field**: Not required for form validation

## 💰 Pricing Display

### Order Summary
- [ ] **Service Price**: "세탁 서비스 10,000원" displays correctly
- [ ] **Delivery Fee**: "배달비 1,900원" displays correctly
- [ ] **Total Format**: "총 결제금액 11,900원" with proper comma formatting
- [ ] **Typography**: Total amount uses `font-semibold`

## 🔧 Technical Validation

### Environment Variables
- [ ] **Missing Client Key**: When `NEXT_PUBLIC_TOSS_CLIENT_KEY` is missing:
  - [ ] Red alert badge appears at top of page
  - [ ] CTA button remains disabled
  - [ ] Console shows appropriate warning

### Payment Flow
- [ ] **Form Validation**: CTA only enabled when all required fields selected
- [ ] **Console Logging**: Order payload logged to console on submit
- [ ] **API Integration**: Posts to `/api/orders` (when implemented)
- [ ] **Toss Integration**: Loads Toss Payments script when payment method is 'toss'

### Error Handling
- [ ] **Network Errors**: Graceful handling of API failures
- [ ] **Fallback**: Redirects to `/order?error=...` on payment failure
- [ ] **Loading States**: Shows skeleton during data loading

## 🎯 End-to-End Flow

### Successful Payment
- [ ] **Order Creation**: Order successfully created in database
- [ ] **Payment Processing**: Toss Payments widget opens correctly
- [ ] **Completion Redirect**: After successful payment, redirects to `/order/completed`
- [ ] **MyPage Integration**: Order appears in MyPage with "결제완료" badge

### Navigation
- [ ] **Back Button**: Arrow left button navigates back to previous page
- [ ] **Address Change**: "변경" button navigates to `/home`
- [ ] **Error Redirects**: Failed payments redirect to `/order?error=...`

## 📱 Mobile-Specific Tests

### Touch Interactions
- [ ] **Button Sizes**: All buttons have adequate touch targets (≥44px)
- [ ] **Time Selection**: Touch-friendly time selection chips
- [ ] **Radio Cards**: Easy to select payment methods on mobile
- [ ] **Sticky CTA**: Bottom CTA remains accessible while scrolling

### Performance
- [ ] **Loading Speed**: Page loads quickly on mobile networks
- [ ] **Smooth Scrolling**: No jank during scroll interactions
- [ ] **Memory Usage**: No memory leaks during navigation

## 🔍 Accessibility

### Keyboard Navigation
- [ ] **Tab Order**: Logical tab sequence through form elements
- [ ] **Focus Indicators**: Clear focus rings on interactive elements
- [ ] **Escape Key**: Sheet closes with Escape key (when implemented)

### Screen Readers
- [ ] **Labels**: All form elements have proper labels
- [ ] **Error Messages**: Error states announced to screen readers
- [ ] **Status Updates**: Payment status changes announced

## 🚀 Production Readiness

### Code Quality
- [ ] **TypeScript**: No type errors in build
- [ ] **Linting**: No ESLint errors
- [ ] **Console Clean**: No console errors in production build

### Security
- [ ] **API Keys**: Client keys properly exposed, secret keys hidden
- [ ] **Input Validation**: All user inputs properly validated
- [ ] **XSS Prevention**: No unescaped user content in DOM

---

## 📝 Notes
- Test with both authenticated and unauthenticated users
- Verify payment flow works with test card numbers
- Check error states with network throttling
- Validate responsive design at various breakpoints

## ✅ Sign-off
- [ ] **QA Lead**: _________________ Date: _________
- [ ] **Product Owner**: _________________ Date: _________
- [ ] **Developer**: _________________ Date: _________