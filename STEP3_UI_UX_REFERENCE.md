# Student Course Details - UI/UX Reference Guide

## Page Layout Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ← Back to My Courses                                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Python Fundamentals                                     │ │
│  │  Instructor: John Smith                                  │ │
│  │  Learn the basics of Python programming with hands-on   │ │
│  │  projects and real-world applications.                  │ │
│  │  ✓ Course Completed                                      │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Overall Progress: 100%                                 │   │
│  │ [████████████████████] 5 of 5 completed                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║ 📚 Content (5)  │  📝 Assignments (1)  │  📊 Progress   ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  File Name            │Type      │Date      │Status │Action│ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 🎥 Intro to Python    │Video     │Feb 1    │✓     │      │ │
│  │ 📄 Python Guide.pdf   │PDF       │Feb 1    │✓     │      │ │
│  │ 📝 Variables Quiz     │Assign    │Feb 2    │✓     │      │ │
│  │ 📃 Cheat Sheet        │Document  │Feb 3    │✓     │      │ │
│  │ 🔗 Python Docs        │Link      │Feb 4    │✓     │      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Max Width: 1200px
Background: #F4F7FA (Light blue-grey)
Font: Segoe UI, 14px base
```

## Tab 1: Content (Active State)

```
CONTENT TAB STRUCTURE
═════════════════════

┌─────────────────────────────────────────────────────────────────┐
│ Header Row (Dark Navy #142C52, White Text, Bold)              │
├─────────────────────────────────────────────────────────────────┤
│ File Name (flex: 2)  │ Type (1) │ Date (1) │ Status (1) │ Act(1)│
├─────────────────────────────────────────────────────────────────┤
│ 🎥 Intro to Python   │ 🔴 video │ Feb 01  │ ✓ Comp. │          │
├─────────────────────────────────────────────────────────────────┤
│ 📄 Python Basics.pdf │ 🔵 pdf   │ Feb 02  │ ✓ Comp. │          │
├─────────────────────────────────────────────────────────────────┤
│ 📝 Assignment.docx   │ 🟡 assign│ Feb 03  │ ○ Pend. │ Mark Done│
└─────────────────────────────────────────────────────────────────┘

Color Coding:
─────────────
Video:    #FEE2E2 bg, #DC2626 text (Red)
PDF:      #DBEAFE bg, #2563EB text (Blue)
Assign:   #FEF3C7 bg, #D97706 text (Orange)
Document: #E0E7FF bg, #4F46E5 text (Indigo)
Link:     #F3E8FF bg, #7C3AED text (Purple)

Row Styling:
────────────
Alternating: #F9FAFB and #FFFFFF
Hover: Light shadow on hover (optional)
Border-bottom: #E5E7EB
Padding: 1rem all sides
```

## Tab 2: Assignments

```
ASSIGNMENTS TAB STRUCTURE
═════════════════════════

┌──────────────────────────────────────────────────┐
│  Assignment Card (flexbox column)                │
├──────────────────────────────────────────────────┤
│  📝 Python Variables Quiz      [Pending]         │
│  ────────────────────────────────────────────    │
│  Uploaded: Feb 3, 2026                           │
│                                                  │
│  [ Submit Assignment ]  (Button - Teal #1B9AAA) │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Assignment Card                                 │
├──────────────────────────────────────────────────┤
│  📝 Final Project Submission    [✓ Submitted]   │
│  ────────────────────────────────────────────    │
│  Uploaded: Feb 5, 2026                           │
│                                                  │
│  (Button disabled - already submitted)           │
└──────────────────────────────────────────────────┘

Status Badges:
──────────────
Pending:    #FEF3C7 bg, #F59E0B text (Orange), Outlined
Submitted:  #ECFDF5 bg, #22C55E text (Green), Outlined

Card Styling:
──────────────
Background: #F9FAFB
Border: 1px #E5E7EB
Border-radius: 8px
Padding: 1.5rem
Gap between cards: 1rem
```

## Tab 3: Progress

```
PROGRESS TAB STRUCTURE
══════════════════════

┌─────────────────────────────────────────────────┐
│  Course Completion                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────┐    ┌─────────────────┐    │
│  │                │    │ Total Content: 5│    │
│  │      100%      │    │ Completed:     5│    │
│  │   (Circle)     │    │ Remaining:     0│    │
│  │                │    └─────────────────┘    │
│  └────────────────┘                           │
│                                                 │
├─────────────────────────────────────────────────┤
│  🏆 Course Completed!                          │
│  ────────────────────────────────────────────  │
│  Congratulations! You've successfully          │
│  completed this course.                        │
│                                                 │
│  [ Download Certificate ]                      │
└─────────────────────────────────────────────────┘

Circle Progress:
─────────────────
Outer: 120px diameter, #E5E7EB background
Inner: #1B9AAA fill (animated from 0-100%)
Text: 100% in #1B9AAA (large, bold)
Animation: CSS circular progress

Stats Grid:
───────────
Layout: 3 columns
Each stat: centered, white box
Stat label: gray text, small
Stat value: dark navy, large (1.8rem)
Remaining: orange (#F59E0B)

Certificate Card:
─────────────────
Background: #FEF3C7 (light yellow)
Border: 2px #F59E0B (orange)
Title: #D97706 (dark orange)
Text: #92400E (brown)
Button: #D97706 bg, white text
```

## Component State Diagram

```
Component Lifecycle
═══════════════════

1. MOUNTING
   └─ useEffect triggered (dependency: [id])
      └─ fetchAllCourseData()
         ├─ Fetch contents (/api/courses/student/:id/contents/)
         ├─ Fetch progress (/api/courses/student/:id/progress/)
         └─ Fetch course info (/api/courses/)

2. LOADING STATE
   └─ Show spinner + "Loading course content..." message
   └─ Display: centered spinner (40px x 40px)

3. DATA RECEIVED
   ├─ courseData = { course_id, course_title, contents[] }
   ├─ progress = { total_content, completed_content, progress_percentage }
   └─ courseInfo = { id, title, description, instructor, ... }

4. RENDER
   ├─ Header: Display title, instructor, description
   ├─ Progress Card: Show percentage and completion count
   ├─ Tabs: Content (default), Assignments, Progress
   └─ Content: Based on activeTab state

5. USER INTERACTION
   ├─ Click tab → setActiveTab(newTab) → Re-render
   ├─ Click "Mark Done" → handleMarkComplete(contentId)
   │  ├─ POST /api/courses/student/:contentId/complete/
   │  ├─ Update state: setCourseData(...)
   │  ├─ Refresh: GET /api/courses/student/:id/progress/
   │  └─ Button shows "..." during request
   └─ Click "Back" → navigate(-1)

6. ERROR STATE
   └─ Display error message in red box
      └─ Show error.response?.data?.error or default message
```

## Styling Theme

```
EduVillage Branding Colors
══════════════════════════

Primary Colors:
  Teal:        #1B9AAA (buttons, tabs, progress bars)
  Dark Navy:   #142C52 (headers, titles)
  Light Blue:  #F4F7FA (page background)

Text Colors:
  Dark:        #142C52 (headings)
  Medium:      #666    (labels, secondary text)
  Light:       #999    (disabled text)

UI Element Colors:
  White:       #FFFFFF (card backgrounds)
  Border:      #E5E7EB (light gray)
  Success:     #22C55E (completed status)
  Warning:     #F59E0B (pending status)
  Error:       #DC2626 (error messages)

Content Type Badges:
  Video:    #FEE2E2 / #DC2626 (red)
  PDF:      #DBEAFE / #2563EB (blue)
  Assign:   #FEF3C7 / #D97706 (orange)
  Document: #E0E7FF / #4F46E5 (indigo)
  Link:     #F3E8FF / #7C3AED (purple)

Spacing (REM-based):
  Card padding:     2rem
  Element gap:      1rem
  Font size:        0.95rem - 2rem (responsive)
  Border radius:    4px - 8px
```

## Icon Reference

```
Content Type Icons
══════════════════
Video:      🎥 (movie camera)
PDF:        📄 (page with curl)
Assignment: 📝 (memo/note)
Document:   📃 (page)
Link:       🔗 (chain)
Other:      📦 (package)

Status Icons
════════════
Completed:  ✓ (checkmark, green)
Pending:    ○ (circle, orange)
Course OK:  ✓ Course Completed (green badge)
Trophy:     🏆 (trophy for completion)

Tab Icons
═════════
Content:    📚 (books)
Assignments:📝 (memo)
Progress:   📊 (chart)

Navigation
══════════
Back:       ← (left arrow)
```

## Responsive Breakpoints (Future Enhancement)

```
Desktop (Current - 1200px max)
  ├─ Full layout: side-by-side
  ├─ Table: 5 columns visible
  └─ Progress: 2-column grid

Tablet (768px - 1024px)
  ├─ Reduced padding: 1rem
  ├─ Table: scroll horizontally if needed
  └─ Progress: 1-column stack

Mobile (< 768px)
  ├─ Full width layout
  ├─ Single column for assignments
  ├─ Table: card layout or scroll
  └─ Progress: vertical stack
  └─ Tabs: dropdown or scroll
```

## Component Props & Data Flow

```
StudentCourseContent
│
├─ Input:
│  └─ URL Param: :id (course_id)
│
├─ State Management:
│  ├─ courseData (contents array)
│  ├─ courseInfo (instructor, description)
│  ├─ progress (stats)
│  ├─ loading (boolean)
│  ├─ error (string or null)
│  ├─ activeTab ('content' | 'assignments' | 'progress')
│  └─ markingComplete (object for UI state)
│
├─ Methods:
│  ├─ fetchAllCourseData() → Parallel API calls
│  └─ handleMarkComplete(contentId) → POST API + State update
│
└─ Output:
   └─ Rendered JSX with tab-based UI
```

## Error Handling Decision Tree

```
API Call Fails?
  ├─ YES: Network/Auth error
  │  ├─ Show error state (red box)
  │  └─ Message: err.response?.data?.error || default message
  │
  └─ NO: Continue

Data Missing?
  ├─ courseInfo not found
  │  └─ Show "Instructor: N/A"
  │  └─ Hide description (conditional render)
  │
  ├─ No contents
  │  └─ Show empty state: "No content available yet"
  │
  ├─ No assignments
  │  └─ Show empty state: "No assignments in this course"
  │
  └─ Mark complete failed
     └─ Show alert with error message
     └─ Button stays enabled for retry

Browser Local Storage Check?
  ├─ Auth token exists
  │  └─ Include in Authorization header
  │
  └─ No token
     └─ ProtectedRoute redirects to login
```

---

## User Flow Example

```
1. Student clicks "View Course" on enrolled course
   ↓
2. Navigate to /student/courses/5 (course_id=5)
   ↓
3. StudentCourseContent component mounts
   ↓
4. Show loading spinner (3-5 seconds)
   ↓
5. APIs return data:
   - Course title: "Python Basics"
   - Instructor: "Dr. Sarah Johnson"
   - Description: "Learn Python from basics to advanced..."
   - Content: 5 items (2 videos, 1 PDF, 1 assignment, 1 link)
   - Progress: 60% complete (3 of 5 items done)
   ↓
6. Page renders with all data
   ↓
7. Student views Content tab (default)
   - Sees 3 completed items with ✓
   - Sees 2 pending items with Mark Done button
   ↓
8. Student clicks "Mark Done" on pending video
   ↓
9. Button shows "..." (disabled temporarily)
   ↓
10. API call: POST /api/courses/student/12/complete/
    Backend marks content as complete
   ↓
11. State updates:
    - Content item: completed = true
    - Progress: 80% (4 of 5)
    - Button removed (already completed)
   ↓
12. Student clicks Assignments tab
   ↓
13. Sees 1 assignment card with "Submit Assignment" button
   ↓
14. Student clicks Progress tab
   ↓
15. Sees progress visualization:
    - Large circular progress (80%)
    - Stats: 5 total, 4 completed, 1 remaining
```

---

*This reference guide provides complete UI/UX specifications for the Student Course Details page.*
*All styling is implemented using inline CSS (styles object) for component isolation.*
