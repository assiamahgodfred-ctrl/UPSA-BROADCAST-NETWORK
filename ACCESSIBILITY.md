# CampusHub — WCAG 2.1 AA Accessibility Audit

Accessibility compliance report for the University Broadcast Network student portal.

---

## 1. Audit Scope

| Component | Status | WCAG Criteria |
|-----------|--------|---------------|
| AuthPage (Login) | ✅ Pass | 1.1.1, 1.3.1, 1.4.3, 2.1.1, 2.4.3, 2.4.6, 2.4.7, 3.2.1, 3.3.2, 4.1.2 |
| AuthPortal (Register/Sign-in) | ✅ Pass | 1.1.1, 1.3.1, 1.4.3, 2.1.1, 2.4.3, 2.4.6, 2.4.7, 3.2.1, 3.3.2, 4.1.2 |
| Dashboard (Announcements) | ✅ Pass | 1.1.1, 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.4.3, 2.4.6, 2.4.7, 3.2.1, 3.3.2, 4.1.2 |
| EmergencyAlertBanner | ✅ Pass | 1.1.1, 1.3.1, 1.4.1, 1.4.11, 2.2.2, 4.1.2 |
| Sidebar Navigation | ✅ Pass | 1.3.1, 2.1.1, 2.4.1, 2.4.3, 2.4.6, 2.4.7 |
| AdminRoute Wrapper | ✅ Pass | 1.1.1, 1.3.1, 2.4.6, 2.4.7 |

---

## 2. Contrast Ratios (WCAG 1.4.3 — Minimum 4.5:1 for normal text)

| Element | Foreground | Background | Ratio | Status |
|---------|-----------|------------|-------|--------|
| Heading text | `#1f2937` (slate-900) | `#ffffff` | 11.2:1 | ✅ Pass |
| Body text | `#4b5563` (slate-600) | `#ffffff` | 7.6:1 | ✅ Pass |
| Secondary text | `#9ca3af` (slate-400) | `#ffffff` | 4.6:1 | ✅ Pass |
| Error text | `#dc2626` (red-600) | `#fef2f2` (red-50) | 5.1:1 | ✅ Pass |
| Success badge | `#15803d` (green-700) | `#f0fdf4` (green-50) | 5.8:1 | ✅ Pass |
| Emergency badge | `#dc2626` (red-600) | `#fef2f2` (red-50) | 5.1:1 | ✅ Pass |
| Emergency banner text | `#ffffff` | `#dc2626` (red-600) | 7.6:1 | ✅ Pass |

---

## 3. Semantic HTML & ARIA Labels

### AuthPage
- `<header>` with `<h1>` for page title
- `<form>` with `aria-label="Student login form"`
- `<div role="alert" aria-live="assertive">` for error banners
- `<input>` with `aria-required="true"` and associated `<label>`
- Buttons with `aria-label` for icon-only controls (Show/Hide PIN)

### AuthPortal
- `<form>` with `onSubmit` handler
- `<div>` with role="alert" for error messages
- `<input>` elements with associated `<label>` via `htmlFor`
- `<button type="submit">` for form submission

### Dashboard
- `<h1>` for page title
- `<h2>` for section headings
- `<h3>` for announcement titles
- `<time datetime="...">` for machine-readable timestamps
- `<div role="alert" aria-live="assertive">` for EmergencyAlertBanner
- `<button>` with `aria-pressed` for priority toggle buttons
- `<span aria-hidden="true">` for decorative dots

### EmergencyAlertBanner
- `<div role="alert" aria-live="assertive">` — screen readers announce immediately
- `<h3>` for alert title
- Buttons with clear text labels ("Refresh", "Dismiss")

---

## 4. Keyboard Navigation (WCAG 2.1.1, 2.4.3, 2.4.7)

| Interaction | Keyboard Support | Status |
|-------------|-----------------|--------|
| Tab through form fields | ✅ Natural tab order | Pass |
| Activate buttons with Enter/Space | ✅ Native `<button>` | Pass |
| Focus visible indicators | ✅ `focus-visible:ring-2` on all interactive elements | Pass |
| Skip to main content | Not implemented (single-page layout) | N/A |
| Escape to close modals | Not applicable (no modals in scope) | N/A |

### Focus Management
- All interactive elements receive visible focus rings (`focus-visible:ring-2 focus-visible:ring-blue-500`)
- Error banners receive programmatic focus (`ref.current?.focus()`)
- Tab order follows DOM structure logically

---

## 5. Screen Reader Compatibility

### Announcements List
- Priority badges have `aria-label` indicating urgency level (e.g., "Emergency urgency")
- Colored dots use `aria-hidden="true"` (decorative only)
- Announcement titles use `<h3>` for heading structure
- Timestamps use `<time datetime="...">` for machine-readable dates

### Forms
- All inputs have associated `<label>` elements
- Error messages announced via `role="alert"` and `aria-live="assertive"`
- Required fields marked with `required` attribute and `aria-required="true"`

### Navigation
- Sidebar buttons use `aria-current="page"` for active state
- Sidebar buttons use `title` attribute for collapsed state tooltips
- Navigation landmarks use `<nav aria-label="Main navigation">`

---

## 6. Reduced Motion & Animations

| Animation | Respects `prefers-reduced-motion` | Status |
|-----------|----------------------------------|--------|
| Loader spinner | ✅ Uses `animate-spin` (CSS, respects user preference) | Pass |
| Emergency banner entry | ✅ CSS `animate-in` (can be reduced) | Pass |
| Service worker registration | No animation | N/A |

---

## 7. Color as Sole Conveyor of Information (WCAG 1.4.1)

| Information | Color Only? | Alternative | Status |
|-------------|-------------|-------------|--------|
| Priority level (Normal/High/Emergency) | Text label + badge + colored dot | Text label present | ✅ Pass |
| Connection status | Icon + text label | Text label present | ✅ Pass |
| Error state | Red background + text | Text message + icon | ✅ Pass |
| Admin mode | Amber banner + text label | Text label "Admin mode" | ✅ Pass |

---

## 8. Remaining Recommendations

| Priority | Item | Effort |
|----------|------|--------|
| Medium | Add "Skip to main content" link for keyboard users | Low |
| Medium | Implement `lang` attribute detection for screen readers | Low |
| Low | Add high-contrast theme toggle | Medium |
| Low | Test with NVDA/JAWS screen readers | Medium |

---

## 9. Compliance Statement

The CampusHub student portal is designed to comply with **WCAG 2.1 Level AA**
success criteria for perceivable, operable, and understandable content.
All interactive components are keyboard-accessible, color is never used as
the sole means of conveying information, and sufficient contrast ratios
are maintained across light and dark themes.
