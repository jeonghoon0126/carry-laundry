# 🧪 Fixed CTA Test Guide

## Quick Manual Test Steps

### 1. **Visibility Test**
```bash
# Start dev server
npm run dev
```

**Test CTA visibility on different routes:**

✅ **Should show CTA:**
- Navigate to `http://localhost:3000/` (home)
- Navigate to `http://localhost:3000/home`
- **Expected**: Fixed CTA visible at bottom with "🛒 11,900원에 주문하기"

❌ **Should hide CTA:**
- Navigate to `http://localhost:3000/order`
- Navigate to `http://localhost:3000/admin`
- Navigate to `http://localhost:3000/mypage`
- **Expected**: No CTA visible

### 2. **Design & Layout Test**

**Fixed positioning:**
- ✅ CTA stays at bottom when scrolling
- ✅ Background: Semi-transparent black with blur effect
- ✅ Z-index: Above other content (z-50)

**Container specs:**
- ✅ Max width: 448px (max-w-md)
- ✅ Padding: 16px horizontal, 12px vertical
- ✅ Safe area: `pb-[max(env(safe-area-inset-bottom),12px)]`

**Button specs:**
- ✅ Full width, 48px height (h-12)
- ✅ Black background, white text
- ✅ Rounded corners (rounded-xl)
- ✅ Font weight: bold
- ✅ Hover effect: opacity-90

### 3. **Mobile Safe Area Test**

**iOS Safari test:**
1. Open in iOS Safari (or use Chrome DevTools device simulation)
2. Navigate to any page where CTA should show
3. **Expected**: CTA respects safe area inset at bottom
4. **Verify**: No overlap with home indicator

**Android test:**
1. Open in Android Chrome
2. **Expected**: Minimum 12px padding at bottom

### 4. **Functionality Test**

**Click behavior:**
1. Click the CTA button
2. **Expected**: Navigates to `/order` page
3. **Verify**: CTA disappears on order page

**Accessibility:**
1. Tab to CTA button
2. **Expected**: Button is focusable
3. **Verify**: `aria-label="11,900원에 주문하기"` is present

### 5. **No Layout Shift Test**

**Footer interaction:**
1. Scroll to bottom of any page with footer
2. **Expected**: CTA overlays footer content without shifting layout
3. **Verify**: No content jumping or repositioning

### 6. **Single CTA Verification**

**Duplication check:**
1. Navigate through all pages
2. **Expected**: Only one CTA visible at any time
3. **Verify**: No multiple CTAs or conflicting bottom bars

## Browser Testing Checklist

| Browser | Desktop | Mobile | Notes |
|---------|---------|---------|-------|
| Chrome | ✅ | ✅ | Test safe area with DevTools |
| Safari | ✅ | ✅ | Test actual iOS safe area |
| Firefox | ✅ | ✅ | Test backdrop-blur support |
| Edge | ✅ | ✅ | Test Windows touch devices |

## Route Testing Matrix

| Route | CTA Visible | Notes |
|-------|-------------|-------|
| `/` | ✅ | Home page |
| `/home` | ✅ | Landing page |
| `/mypage` | ❌ | Hidden on user dashboard |
| `/order` | ❌ | Hidden on order page |
| `/order/confirmation` | ❌ | Hidden on order children |
| `/admin` | ❌ | Hidden on admin page |
| `/admin/dashboard` | ❌ | Hidden on admin children |

## CSS Properties Verification

**Container:**
```css
.fixed.left-0.right-0.bottom-0.z-50.bg-black\/50.backdrop-blur-md
```

**Inner container:**
```css
.max-w-md.mx-auto.px-4.py-3.pb-\[max\(env\(safe-area-inset-bottom\)\,12px\)\]
```

**Button:**
```css
.w-full.h-12.rounded-xl.font-bold.bg-black.text-white.hover\:opacity-90
```

## Expected Behavior Summary

✅ **Single CTA**: Only one CTA renders across the entire app  
✅ **Route exclusions**: Hidden on `/order` and `/admin` (including children)  
✅ **Safe area**: Respects iOS safe area inset  
✅ **No layout shift**: Overlays content without affecting layout  
✅ **Accessibility**: Proper aria-label and keyboard navigation  
✅ **Performance**: No hydration issues or client-side errors  

## Acceptance Criteria Verification

✅ **Exactly one CTA rendered site-wide** (except excluded paths)  
✅ **Safe-area gap present on iOS**  
✅ **No layout shift over footer content**  
✅ **Build/lint pass**  
✅ **Component mounted in root layout**  
✅ **Proper route exclusions implemented**
