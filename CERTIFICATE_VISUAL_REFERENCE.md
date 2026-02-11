# Certificate Visual Reference & Preview

## Design Overview

```
╔════════════════════════════════════════════════════════════════════╗
║                    CERTIFICATE OF COMPLETION                       ║
║                         (A4 Landscape)                             ║
╚════════════════════════════════════════════════════════════════════╝

┌─ HEADER (50px height, Teal #1B9AAA bottom border) ──────────────────┐
│                                                                       │
│  [Logo]                                                               │
│  (50px height, left-aligned)                                          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ CONTENT AREA (centered, 60px padding) ──────────────────────────────┐
│                                                                       │
│                  Certificate of Completion                           │
│                   (32px, Georgia serif, Navy)                         │
│                                                                       │
│                                                                       │
│                     This is to certify that                          │
│                        (14px, Gray)                                   │
│                                                                       │
│                                                                       │
│                           John Doe                                   │
│                       (48px, Teal, Bold)                             │
│                     ← MAIN VISUAL FOCUS →                            │
│                                                                       │
│                                                                       │
│                  has successfully completed the course              │
│                        (14px, Gray)                                   │
│                                                                       │
│                                                                       │
│               Advanced React Development                             │
│              (20px, Navy, Bold, max-width: 800px)                    │
│                                                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ FOOTER (1px border top, Gray #E5E7EB) ──────────────────────────────┐
│                                                                       │
│ LEFT SECTION:                      RIGHT SECTION:                     │
│ ────────────                        ─────────────                     │
│ Course Instructor                   Certificate ID                   │
│ (10px, uppercase, gray label)       (10px, uppercase, gray label)   │
│ Jane Smith                          CERT-2026-000123                 │
│ (13px, dark text)                   (13px, monospace)                │
│                                                                       │
│ Date of Issue                                                        │
│ (10px, uppercase, gray label)                                        │
│ February 3, 2026                                                     │
│ (13px, dark text)                                                    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Typography Hierarchy

| Element | Font Size | Weight | Color | Font Family |
|---------|-----------|--------|-------|-------------|
| **Certificate Title** | 32px | 300 | #142C52 (Navy) | Georgia, serif |
| **Student Name** | 48px | 600 | #1B9AAA (Teal) | System sans-serif |
| **Course Name** | 20px | 600 | #071426 (Dark) | System sans-serif |
| **Subtitle** | 14px | 400 | #6B7280 (Gray) | System sans-serif |
| **Body Text** | 14px | 400 | #6B7280 (Gray) | System sans-serif |
| **Footer Values** | 13px | 500 | #071426 (Dark) | System sans-serif |
| **Footer Labels** | 10px | 400 | #9CA3AF (Light Gray) | System sans-serif |

---

## Color Usage

```
╔═══════════════════════════════════════════════════════════════════════╗
║                         CIVORA NEXUS PALETTE                          ║
╚═══════════════════════════════════════════════════════════════════════╝

PRIMARY ACCENT - TEAL
┌─────────────────────────────────────────────────┐
│                                                 │
│              Student Name (48px)               │  ← Main focus
│        Logo underline (2px bottom border)      │
│                                                 │
└─────────────────────────────────────────────────┘
Color: #1B9AAA
Usage: Student name, accents, logo border

SECONDARY - NAVY
┌─────────────────────────────────────────────────┐
│      Certificate of Completion (32px)          │
│            Course Name (20px)                   │
└─────────────────────────────────────────────────┘
Color: #142C52
Usage: Titles, headers, course name

NEUTRAL - TEXT DARK
┌─────────────────────────────────────────────────┐
│          Footer values, course name             │
│              General body text                  │
└─────────────────────────────────────────────────┘
Color: #071426
Usage: Primary text, body content

NEUTRAL - GRAY LABELS
┌─────────────────────────────────────────────────┐
│  "This is to certify that" (subtitle)          │
│  "has successfully completed" (body)           │
│  "Course Instructor" (label)                   │
└─────────────────────────────────────────────────┘
Color: #6B7280
Usage: Secondary text, instructions, labels

NEUTRAL - LIGHT GRAY ACCENTS
┌─────────────────────────────────────────────────┐
│  Certificate ID / Date label (10px)            │
│  Footer border line                            │
└─────────────────────────────────────────────────┘
Color: #9CA3AF (labels), #E5E7EB (border)
Usage: Metadata labels, borders
```

---

## Spacing & Layout

```
A4 Landscape: 1123px × 794px

┌─────────────────────────────────────────────────┐
│                                                 │
│                  40px margin                    │
│  60px     [Logo / Header]          60px margin │
│  margin                                         │
│           ═════════════════════                │ ← 2px teal border
│           (end)                                │
│                                                 │
│           40px margin below                     │
│           ─────────────────────                │
│                                                 │
│  60px     CERTIFICATE OF COMPLETION            │
│  margin                                         │
│                                                 │
│           This is to certify that              │
│                                                 │
│                                                 │
│                 John Doe                        │
│                                                 │
│           has successfully completed           │
│                                                 │
│                                                 │
│           Advanced React Development           │
│  60px                                          │
│  margin   (centered content area)              │
│           ─────────────────────                │
│                                                 │
│           40px bottom padding                   │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  60px     Instructor │          │ Cert ID      │
│  margin   Jane Smith │          │CERT-2026     │
│                      │          │-000123       │
│           Date       │          │              │
│           Feb 3, 26  │          │              │
│                                                 │
│           40px bottom padding                   │
│                                                 │
└─────────────────────────────────────────────────┘

Vertical Spacing:
- Header to content: 40px
- Title to subtitle: 60px
- Subtitle to name: 20px
- Name to completion text: 30px
- Completion text to course: 20px
- Course to footer: 40px
- Footer padding: 40px bottom

Horizontal Spacing:
- Left/right padding: 60px
- Logo height: 50px
- Logo margin: right 60px
- Footer gap: space-between layout
- Course max-width: 800px (centered)
```

---

## Visual States

### Complete Certificate (Web Display)
```
┌─────────────────────────────────────┐
│ 🏆 Course Completed!                │
│                                     │
│ Congratulations! You've             │
│ successfully completed this course. │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  [Full Certificate Display]     │ │
│ │  (A4 landscape preview)         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [View & Download Certificate] (CTA)│
│                                     │
└─────────────────────────────────────┘
```

### Print Dialog
```
Browser Print Dialog
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Destination: Save as PDF
Paper Size: A4
Orientation: Landscape ✓
Margins: None (0mm)
Scale: 100%
Background graphics: ✓ Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Mobile Preview (Responsive)
```
┌──────────────────────┐
│ Certificate Preview  │
│                      │
│  (Scaled down cert)  │
│  (horizontally      │
│   scrollable)       │
│                      │
│ [View on Desktop]   │
│ [Print / Save PDF]  │
└──────────────────────┘
```

---

## Component Structure (React)

```jsx
<Certificate>
  ├─ .certificate-header
  │  └─ img.logo
  │
  ├─ .certificate-content (flex center)
  │  ├─ h1.certificate-title
  │  ├─ p.certificate-subtitle
  │  ├─ p.student-name
  │  ├─ p.completion-text
  │  └─ p.course-name
  │
  └─ .certificate-footer
     ├─ .footer-left
     │  ├─ p.footer-label (instructor label)
     │  ├─ p.footer-value (instructor name)
     │  ├─ p.footer-label (date label)
     │  └─ p.footer-value (issue date)
     │
     └─ .footer-right
        ├─ p.footer-label (certificate id label)
        └─ p.footer-value.id (certificate id)
```

---

## Comparison: Before vs After

### BEFORE (Old Certificate)
```
╔═══════════════════════════════════════════════════╗
║ 🏅 COURSE COMPLETION CERTIFICATE 🏅              ║
║                                                   ║
║ ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★  ║
║ ★                                              ★ ║
║ ★    CERTIFIED!                                ★ ║
║ ★                                              ★ ║
║ ★    John Doe                                  ★ ║
║ ★    ═════════════════════════════════════   ★ ║
║ ★                                              ★ ║
║ ★    Has Successfully Completed               ★ ║
║ ★                                              ★ ║
║ ★    Advanced React Development               ★ ║
║ ★    ═════════════════════════════════════   ★ ║
║ ★                                              ★ ║
║ ★    Instructor: Jane Smith                   ★ ║
║ ★    Date: February 3, 2026                   ★ ║
║ ★    ID: CERT-2026-000123                     ★ ║
║ ★                                              ★ ║
║ ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★  ║
║                                                   ║
║ [Print] [Download] [Share]                       ║
╚═══════════════════════════════════════════════════╝

Issues:
❌ Heavily decorated (stars, borders)
❌ Too colorful (multiple color schemes)
❌ Cluttered layout
❌ Generic emoji icons
❌ Not EdTech style
```

### AFTER (New Certificate)
```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  [Logo]     ────────────────────────────────    ║
║                   (Teal underline)               ║
║                                                   ║
║                                                   ║
║          Certificate of Completion              ║
║                                                   ║
║            This is to certify that               ║
║                                                   ║
║                  John Doe                        ║
║                                                   ║
║          has successfully completed the course  ║
║                                                   ║
║          Advanced React Development             ║
║                                                   ║
├───────────────────────────────────────────────────┤
║                                                   ║
║  Instructor: Jane Smith   │   CERT-2026-000123  ║
║  Date: February 3, 2026   │                     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝

Improvements:
✅ Minimal, clean design
✅ Professional EdTech style
✅ Two-color brand palette only
✅ Student name is main focus
✅ All required info present
✅ Print-ready and elegant
```

---

## Print Testing Checklist

- [ ] Print on A4 landscape paper
- [ ] Verify logo is visible (top-left)
- [ ] Check student name is legible and in teal
- [ ] Confirm all text is readable (no overflow)
- [ ] Verify footer information is complete
- [ ] Test margins are appropriate
- [ ] Ensure no page breaks occur
- [ ] Save to PDF without distortion
- [ ] Check PDF on another device/viewer
- [ ] Verify color reproduction (if color printer)

---

## Browser Compatibility

### Layout Rendering
- ✅ Chrome 90+ (Excellent)
- ✅ Firefox 88+ (Excellent)
- ✅ Safari 14+ (Excellent)
- ✅ Edge 90+ (Excellent)

### Print Output
- ✅ Chromium-based (Best color accuracy)
- ✅ Firefox (Excellent)
- ✅ Safari (Good, slight color shift possible)

### PDF Viewers
- ✅ Adobe Reader (Full support)
- ✅ Preview (macOS, Full support)
- ✅ Windows PDF Viewer (Full support)
- ✅ Web browsers (Full support)

---

## Final Design Summary

| Aspect | Specification |
|--------|--------------|
| **Layout** | A4 Landscape (1123×794px) |
| **Background** | Pure White (#FFFFFF) |
| **Primary Color** | Teal (#1B9AAA) |
| **Secondary Color** | Navy (#142C52) |
| **Text Colors** | Dark (#071426), Gray (#6B7280) |
| **Logo** | 50px height, top-left |
| **Borders** | 1× teal underline (header), 1× gray (footer) |
| **Decorations** | None - completely minimal |
| **Fonts** | System sans-serif + Georgia serif |
| **Print Quality** | 96 DPI (web standard) |
| **File Format** | HTML/CSS, easy PDF conversion |
| **Page Breaks** | No breaks on A4 landscape |
| **Margins** | 60px sides, 40px top/bottom |

---

*Visual Guide Created: February 3, 2026*  
*Certificate Design v1.0 - Civora Nexus EdTech*
