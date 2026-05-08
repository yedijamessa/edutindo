# Edutindo Website and Workflow Guide

## Purpose of this document

This document explains how the Edutindo website is structured today, what each portal is meant to do, and how the main user workflows currently work in the codebase.

It covers:

- The public-facing website
- Authentication and access control
- Student workflow
- Teacher workflow
- Parent workflow
- Curriculum access holder workflow
- Admin workflow
- Donor workflow
- A short appendix for the Principal portal, because it exists in the product even though it was not part of the requested role list

This guide is based on the current implementation in the repository as reviewed on 2026-05-08.

## Status legend

- `Live`: wired to real backend logic and likely intended for real usage
- `Hybrid`: partly backend-driven, but mixed with placeholders, hardcoded IDs, or demo assumptions
- `Mock`: mostly scaffold/demo UI with hardcoded or local sample data
- `Gap`: linked or modeled in code, but incomplete, missing, or blocked by current structure

## 1. Website overview

Edutindo is not just a single marketing website. It is a combined platform with two major layers:

1. A public foundation website for mission, partnerships, contact, and fundraising
2. A private portal system for different user roles inside the learning platform

At a high level, the product currently includes these experiences:

| Area | Main routes | Purpose | Status |
| --- | --- | --- | --- |
| Public site | `/`, `/about`, `/contact`, `/get-involved`, `/donate` | Present the foundation, collect enquiries, and support fundraising | `Live` / `Hybrid` |
| Auth | `/login`, `/signup`, `/demo-access` | Account creation, email verification, login, demo portal access | `Live` |
| Dashboard router | `/dashboard` | Decides which portal a logged-in user should enter | `Live` |
| Student portal | `/student/*` | Learning, quizzes, notes, progress, collaboration tools | `Hybrid` |
| Teacher portal | `/teacher/*` | Materials, student monitoring, communication, scheduling | `Hybrid` |
| Parent portal | `/parent/*` | Child progress visibility and communication | `Hybrid` |
| Principal portal | `/principal/*` | School-level oversight, materials, booking | `Mock` / `Gap` |
| Admin portal | `/admin/*` | Access control, curriculum management, module editing | `Live` / `Hybrid` |
| Curriculum role | modeled as portal key `curriculum` | Intended lightweight content/module access | `Gap` in current route structure |

## 2. Public-facing website

The public website is the foundation layer. Its purpose is to explain Edutindo's mission, introduce the team, collect community interest, and drive donations or partnerships.

### Public pages

| Page | Route | What it does | Status |
| --- | --- | --- | --- |
| Home | `/` | Mission-led landing page with vision, public storytelling, and calls to action | `Live` |
| About | `/about` | Presents the serving team and founders | `Live` |
| Contact | `/contact` | Contact form that emails `hello@edutindo.org` using SMTP | `Live` |
| Get Involved | `/get-involved` | Volunteer/supporter form saved through backend API | `Live` |
| Donate | `/donate` | Donation campaigns, equipment needs, donor submission, receipt upload | `Hybrid` |
| Login | `/login` | Starts portal login flow | `Live` |
| Sign up | `/signup` | Creates account and sends verification email | `Live` |
| Demo access | `/demo-access` | Lets unauthenticated users enter non-admin portals using a shared code | `Live` |
| Privacy / Terms | `/privacy`, `/terms` | Legal/supporting pages | `Live` |

### Public navigation behavior

- The top navigation exposes `Home`, `About`, and `Contact`.
- The public header also promotes `Support Us`, which routes to `/donate`.
- On mobile, the menu lists all portal entry points.
- If a visitor clicks into a non-admin portal without being logged in, the site sends them to `/demo-access?next=...` instead of directly blocking them.

### Donor and supporter entry points

Public users can enter the ecosystem from three main places:

- `/donate` for financial support
- `/get-involved` for volunteering, events, or monthly support
- `/contact` for general enquiries and partnership outreach

## 3. Authentication and access model

The platform uses a role-based portal model instead of a single generic account experience.

### Account creation and login

#### Standard user flow

1. User signs up with first name, last name, email, and password.
2. The system sends an email verification link.
3. The user verifies email before login is allowed.
4. On login, the first step only asks for email.
5. If the account is a standard user, the next step is password entry.
6. After successful login, the user is redirected to `/dashboard`, which then routes them to their primary portal.

#### Admin flow

Admin login is different:

1. The user enters email at `/login`.
2. If the email is in the admin allowlist or already marked admin, the system does not ask for password first.
3. Instead, it emails a 6-digit one-time passcode.
4. The admin submits the passcode.
5. A session cookie is created and the admin is routed into the admin portal.

### Portal assignment

Portal access is controlled per user account by admin-managed portal flags:

- `student`
- `teacher`
- `parent`
- `principal`
- `admin`
- `curriculum`

These are managed in Admin Access Control.

### Dashboard routing logic

The authenticated dashboard chooses a primary destination in this order:

1. `admin`
2. `student`
3. `teacher`
4. `parent`
5. `principal`
6. `curriculum`

Mapped destinations:

| Portal key | Home path |
| --- | --- |
| `student` | `/student` |
| `teacher` | `/teacher` |
| `parent` | `/parent` |
| `principal` | `/principal` |
| `admin` | `/admin` |
| `curriculum` | `/admin/modules` |

### Demo access behavior

For non-admin portals, anonymous visitors can still pass through a demo flow:

1. Visitor opens a portal route like `/student`.
2. If not logged in, they are redirected to `/demo-access`.
3. They enter the demo code.
4. The site stores a demo cookie.
5. They are allowed into non-admin portal routes for the demo period.

Admin routes do not allow demo access.

## 4. Back-end and system architecture

The current platform uses several different storage patterns at the same time.

### Main systems in use

| System | Used for |
| --- | --- |
| PostgreSQL / SQL auth tables | users, sessions, email verification, admin OTP |
| PostgreSQL / curriculum tables | school, year, subject, chapter, lesson tree |
| PostgreSQL / module editor tables | reusable module documents and lesson assignments |
| Drizzle ORM tables | some materials, quizzes, and progress queries |
| Firestore | notes, announcements, tutoring, chat, equipment needs, donations, some LMS objects |
| Firebase Storage | student locker files |
| Mock data modules | demo dashboards, teacher/principal views, some meeting/booking flows |

### Important product implication

The website is currently a hybrid product:

- Some areas are strongly operational, especially auth, access control, curriculum structure, chapter resources, reusable modules, and parts of the donor/contact flows.
- Some learner tools are connected to Firestore or database queries but still use hardcoded user IDs.
- Some role pages are clearly demonstrator screens with mock data and placeholder actions.

That means this document describes both:

- what the platform is intended to do
- what the current code actually supports today

## 5. Student workflow

### Student role summary

The Student Portal is the broadest user-facing experience. It combines formal learning content, self-study tools, collaboration tools, scheduling, and experimental AI features.

### Typical student journey

1. Student logs in or enters through demo access.
2. Student lands on `/student`.
3. The dashboard shows current learning status, progress, recent materials, and upcoming events.
4. Student opens learning materials from the dashboard or sidebar.
5. Student browses curriculum by year, subject, chapter, and lesson.
6. Student completes lessons, optional pre-tests/post-tests, quizzes, and personal notes.
7. Student may also use locker, tutoring, announcements, whiteboard, annotation, oral exam, gamification, or AI assistant tools.

### Student portal pages

| Area | Route | What student can do | Status |
| --- | --- | --- | --- |
| Dashboard | `/student` | View learning stats, continue learning, see tasks and upcoming events | `Hybrid` |
| Materials library | `/student/materials` | Browse materials and curriculum structure | `Hybrid` |
| Year/subject curriculum | `/student/materials/year-7/science`, `/student/materials/curriculum/...` | Browse chapters and lessons from Curriculum Portal data | `Live` |
| Chapter page | `/student/materials/.../[chapterSlug]` | See chapter overview, lessons, learning outcomes, resources, and pre-test if enabled | `Live` |
| Lesson page | `/student/materials/.../[chapterSlug]/[lessonSlug]` | View module content, activities, or fallback lesson guide; move next/previous; take post-test at chapter end | `Live` |
| Material detail | `/student/materials/[id]` | Read standalone material content and attachments | `Hybrid` |
| Learning Path | `/student/learning-path` | See unlocked vs locked materials based on prerequisites | `Live` |
| Quizzes | `/student/quizzes` | Browse quizzes, search, and create self-made quizzes; AI-assisted generation is exposed in UI | `Hybrid` |
| Notes | `/student/notes` | Create, edit, search, tag, and delete study notes | `Live` |
| Progress | `/student/progress` | Review progress metrics, charts, and achievements | `Hybrid` |
| Announcements | `/student/announcements` | Read school/news/event announcements | `Live` |
| Calendar | `/student/calendar` | View upcoming and past events; join linked meetings | `Hybrid` |
| Meeting Room | `/student/meeting` | See meeting list and join meeting links with portal Zoom details | `Mock` |
| Book Room | `/student/booking` | Reserve study rooms and facilities | `Mock` |
| Digital Locker | `/student/locker` | Upload, organize, download, and delete files in cloud storage | `Live` |
| Tutoring | `/student/tutoring` | Find tutors, offer tutoring, or create help requests | `Live` |
| Whiteboard | `/student/whiteboard` | Use collaborative whiteboard | `Hybrid` |
| Annotations | `/student/annotations` | Use collaborative annotation viewer | `Hybrid` |
| Oral Exam | `/student/oral-exam` | Practice speaking with AI oral examiner UI | `Hybrid` |
| Gamification | `/student/gamification` | See points, levels, achievements, leaderboard | `Mock` |
| Mind Map | `/student/mindmap` | Open/edit mind-map style study boards | `Mock` |
| AI Assistant | `/student/ai-assistant` | Chat-style study assistant | `Mock` / `Gap` |

### Student learning workflow in more detail

#### A. Starting learning

The student dashboard is built around "resume learning" behavior:

- enrolled materials are surfaced first
- each card shows subject, title, description, and percent complete
- the student can jump directly back into a material or lesson

#### B. Browsing the curriculum

The strongest structured learning path is now curriculum-based:

1. Open materials
2. Pick year and subject
3. Open a chapter
4. Review lesson plan and learning outcomes
5. Open a lesson
6. Read module content or the fallback lesson guide
7. Continue to next lesson
8. Finish chapter and optionally take chapter post-test

#### C. Assessments

Student assessment currently appears in multiple places:

- standalone quiz library in `/student/quizzes`
- chapter pre-test on chapter page when enabled
- chapter post-test on the last lesson when enabled
- quiz content blocks inside reusable lesson modules

#### D. Study support tools

Students also have self-management tools:

- `Notes` for personal study notes
- `Digital Locker` for storing files
- `Learning Path` for prerequisite-driven course access
- `Tutoring` for peer-to-peer support

#### E. Experimental/student-engagement tools

These appear more exploratory than production-complete right now:

- AI assistant
- gamification
- mind map
- oral exam
- booking
- meeting room

### Student workflow observations

- The curriculum-backed lesson flow is one of the clearest end-to-end student journeys.
- Notes, announcements, locker, and tutoring have real persistence patterns.
- Some student pages still use hardcoded student IDs like `student-1`.
- The AI assistant UI is present, but the actual AI API call is still marked TODO.

## 6. Teacher workflow

### Teacher role summary

The Teacher Portal is designed to let a teacher manage materials, monitor students, communicate with families, and coordinate scheduling.

### Typical teacher journey

1. Teacher logs in or uses demo access.
2. Teacher lands on `/teacher`.
3. Teacher reviews class summary and recent student activity.
4. Teacher opens materials to browse curriculum content.
5. Teacher can open chapter pages, inspect lesson plans, and manage chapter resources.
6. Teacher checks students, messages parents/others, and manages calendar or meeting flows.

### Teacher portal pages

| Area | Route | What teacher can do | Status |
| --- | --- | --- | --- |
| Dashboard | `/teacher` | View class stats, recent student activity, upcoming classes, calendar widget | `Mock` / `Hybrid` |
| Materials | `/teacher/materials` | Browse materials and curriculum like a teacher | `Hybrid` |
| Curriculum chapter pages | `/teacher/materials/curriculum/...` | View lesson plan and add chapter resources such as PDFs, videos, or links | `Live` |
| Material detail | `/teacher/materials/[id]` | Open material content, attachments, and teacher action buttons | `Hybrid` |
| Students | `/teacher/students` | Review per-student progress cards and summary stats | `Mock` |
| Notes | `/teacher/notes` | Keep lesson-plan notes and student observations | `Mock` |
| Messages | `/teacher/chat` | Use conversation list and real-time messaging UI | `Live` |
| Calendar | `/teacher/calendar` | Review scheduled events and add/edit events in UI | `Mock` |
| Meeting Room | `/teacher/meeting` | Start or manage class/meeting sessions | `Mock` |
| Book Room | `/teacher/booking` | Reserve classrooms and rooms | `Mock` |

### Teacher content workflow

The most meaningful teacher-side workflow today is around curriculum content visibility:

1. Open `/teacher/materials`
2. Browse to a subject/chapter
3. Open chapter page
4. Review lesson plan table and learning outcomes
5. Add chapter-level support resources through Chapter Resources
6. Open lesson content for teaching preparation

Teachers can add resources with:

- title
- resource type
- URL
- optional description

Those resources are then visible to students in the same chapter.

### Teacher communication workflow

The chat system is more complete than some teacher dashboard pages:

1. Open `/teacher/chat`
2. Select a conversation
3. Messages subscribe in real time
4. Messages are marked as read
5. Teacher replies directly inside the thread

### Teacher workflow observations

- Teacher messaging and chapter resource sharing are the clearest teacher workflows.
- Most other teacher management screens still rely heavily on mock data or placeholder action buttons.
- Teacher notes currently look more like a scaffold than a full backend-connected notes system.

## 7. Parent workflow

### Parent role summary

The Parent Portal is designed for visibility and communication rather than full classroom interaction. It centers on monitoring a child's learning and coordinating with teachers.

### Typical parent journey

1. Parent logs in or uses demo access.
2. Parent lands on `/parent`.
3. Parent sees a child summary card and progress overview.
4. Parent reviews material completion and recent activity.
5. Parent can open chat with school/teacher contacts.
6. Parent can view or request parent-teacher meeting slots.

### Parent portal pages

| Area | Route | What parent can do | Status |
| --- | --- | --- | --- |
| Dashboard | `/parent` | See one child's progress, materials completed, quiz average, progress by material, recent activity | `Hybrid` |
| Messages | `/parent/chat` | Use the same conversation UI as teachers for real-time chat | `Live` |
| Meetings / booking | `/parent/booking` | View scheduled meetings and request or reschedule conferences in UI | `Mock` |
| Progress link in sidebar | `/parent/progress` | Intended dedicated progress page | `Gap` |

### Parent workflow observations

- The dashboard already behaves like the main progress page.
- There is a sidebar link to `/parent/progress`, but that route does not exist yet.
- The current parent flow appears to assume one child selected by default.
- Messaging is stronger than scheduling in the current implementation.

## 8. Curriculum access holder workflow

### What this role appears to mean

The codebase models a separate `curriculum` portal. This role is not a full admin, but is intended to support curriculum/module management work.

The logical purpose of this role is:

- create or maintain reusable lesson modules
- assign modules to lessons
- support curriculum content operations without giving full admin access to all admin tools

### Intended home experience

The portal routing logic sends a `curriculum` user to:

- `/admin/modules`

That page is the Module Library.

### Intended curriculum-holder workflow

1. Sign in with a user account that has the `curriculum` portal enabled.
2. Land in Module Library.
3. Review existing reusable modules.
4. Search/filter modules by assignment status.
5. Review lessons that do not yet have a module assigned.
6. Create a new module in Module Editor.
7. Add pages and blocks to the module.
8. Save the module.
9. Assign the module to one or more lessons.
10. Preview the resulting lesson from the admin materials preview route.

### Curriculum-holder tools in the codebase

| Tool | Route | What it is for | Status |
| --- | --- | --- | --- |
| Module Library | `/admin/modules` | Search modules, see assignment counts, assign/unassign modules, delete modules, inspect lessons without modules | `Live` in isolation |
| Module Editor | `/admin/module-editor` | Build reusable page-by-page lesson modules | `Live` in isolation |
| Admin materials preview | `/admin/materials/curriculum/...` | Preview the lesson after module assignment | `Live` for admins |

### What a reusable module contains

The Module Editor supports:

- multiple pages per module
- text blocks
- image blocks
- quiz blocks

Supported quiz block types include:

- multiple-choice single answer
- multiple-choice multiple answer
- true/false
- short answer
- fill-in-the-blank
- matching
- ordering / sequencing
- essay

The editor also supports:

- block reordering
- page reordering
- student-preview mode
- save state and updated timestamp

### Important current limitation

The intended `curriculum` role is modeled in auth and routing, but the current route/layout structure has problems:

1. `/dashboard` knows about the `curriculum` portal and routes to `/admin/modules`.
2. `app/admin/modules/layout.tsx` explicitly allows `admin` or `curriculum`.
3. But `app/admin/layout.tsx` still requires full `admin` access for all `/admin/*` routes.

This means a curriculum-only user may still be blocked by the parent admin layout before reaching Module Library or Module Editor.

### Additional curriculum-role gaps

- There is no dedicated Curriculum Portal card in the dashboard portal chooser UI.
- Module Editor also sits under `/admin`, so a curriculum-only user is not cleanly isolated from admin route gating.

### Conclusion for this role

The product clearly intends to support a curriculum/content maintainer role, but that role is not fully finished as a standalone portal yet. The module-management tooling exists and is one of the better-developed parts of the codebase, but the access path needs cleanup.

## 9. Admin workflow

### Admin role summary

The Admin Portal is the strongest back-office area in the platform. It owns portal access, curriculum structure, reusable module authoring, and admin-side lesson export.

### Typical admin journey

1. Admin logs in with email and one-time passcode.
2. Admin lands on `/admin`.
3. Admin chooses an admin tool:
   access control, curriculum portal, learning materials, module editor, or module library.
4. Admin grants users the correct portals.
5. Admin defines the school/year/subject/chapter/lesson structure.
6. Admin assigns reusable modules to lessons.
7. Admin previews lessons and exports them when needed.

### Admin portal areas

| Area | Route | What admin can do | Status |
| --- | --- | --- | --- |
| Admin dashboard | `/admin` | Launch point for all admin tools and cross-portal navigation | `Live` |
| Access control | `/admin/access` | List users, check verification/admin state, assign portal access flags, save changes | `Live` |
| Curriculum Portal | `/admin/curriculum` | Build and maintain the curriculum tree and chapter metadata | `Live` |
| Learning Materials | `/admin/materials` | Browse learning materials in admin mode | `Hybrid` |
| Material detail | `/admin/materials/[id]` | Open material content and attachments | `Hybrid` |
| Module Editor | `/admin/module-editor` | Create/edit reusable modules page by page | `Live` |
| Module Library | `/admin/modules` | Assign/unassign modules, inspect module coverage, delete modules | `Live` |

### Admin access-control workflow

The access-control workflow is clear and operational:

1. Open `/admin/access`
2. Load all registered users
3. Review each user's:
   email, name, created date, verification state, admin status, current portal count
4. Toggle portal checkboxes
5. Save portal access for that user

This is the control point for enabling Student, Teacher, Parent, Principal, Admin, and Curriculum access.

### Curriculum Portal workflow

The Curriculum Portal is a structured content-management interface for the academic hierarchy:

- School
- Year
- Subject
- Chapter
- Lesson

Admins can:

- create nodes
- rename nodes
- delete nodes
- drag-and-drop reorder siblings
- set chapter week ranges
- set lesson week and lesson code
- set subject descriptions
- set chapter learning outcomes
- link chapter pre-test and post-test quizzes
- enable/disable those assessments
- attach assignment tags for school/year usage

#### Typical curriculum-setup flow

1. Create or select a school
2. Create years under that school
3. Create subjects
4. Create chapters under subjects
5. Create lessons under chapters
6. Add chapter metadata such as week range and learning outcomes
7. Add lesson metadata such as lesson code and week
8. Create or link pre/post assessment quizzes
9. Use the lesson plan view to manage module assignment and export

### Module workflow for admins

Admins can use Module Editor and Module Library together:

1. Create a reusable module
2. Add pages
3. Add text, images, and quiz blocks
4. Preview student-facing output
5. Save module
6. Open Module Library
7. Assign module to a lesson
8. Preview lesson in admin materials view
9. Export lesson

### Lesson export workflow

From admin lesson pages, export supports:

- PDF: opens a print-ready browser view
- Word: downloads a `.doc` file

This is useful for sharing lesson content outside the web portal.

### Admin workflow observations

- Admin Access Control is one of the clearest finished business workflows.
- Curriculum Portal and Module Editor/Library are the strongest content operations features.
- Admin materials browsing is useful but still sits beside older material-detail patterns.

## 10. Donor workflow

### Donor role summary

The donor experience is public-facing. It does not require a private portal. It is centered on campaign visibility, contribution capture, and receipt submission.

### Typical donor journey

1. Donor lands on `/donate` from the public site.
2. Donor reviews needs and campaign progress.
3. Donor opens a donation dialog for a specific equipment or need.
4. Donor enters donation details.
5. Donation is submitted and recorded.
6. Donor can upload payment receipt for confirmation.
7. The receipt is emailed to Edutindo contacts.

### Donor-facing features

| Area | Route | What donor can do | Status |
| --- | --- | --- | --- |
| Donation page | `/donate` | See equipment needs, progress, recent donors, and open donation form | `Hybrid` |
| Donation submission | donation dialog inside `/donate` | Enter donor identity, amount, message, anonymity, and payment method | `Live` |
| Receipt upload | `/api/donate/receipt` from donation page | Upload one PDF/image receipt up to 8 MB | `Live` |
| Contact / involvement | `/contact`, `/get-involved` | Reach out beyond pure donation | `Live` |

### Donor data captured in the UI

The donation form collects:

- donor name
- optional email
- optional phone
- amount
- message
- anonymous flag
- payment method

### Receipt-upload workflow

Receipt upload is stricter than the generic form flow:

- exactly one file only
- max size 8 MB
- allowed types: PDF or supported image formats
- optional Cloudflare Turnstile verification if configured
- emails sent to `hello@edutindo.org` and `ymsp@edutindo.org`

### Donor workflow observations

- This is one of the stronger public conversion flows in the repo.
- It combines fundraising presentation, donor submission, and operational receipt handling.
- The page appears production-intended even though some surrounding donor stats may still depend on live Firestore data setup.

## 11. Principal portal appendix

Although not in the requested role list, the codebase includes a Principal Portal, so it is worth documenting briefly.

### Principal portal purpose

The Principal Portal appears intended for school-level oversight, partnership coordination, materials visibility, and facility booking.

### Principal portal pages

| Area | Route | What it does | Status |
| --- | --- | --- | --- |
| Dashboard | `/principal` | School summary, performance overview, STEAM implementation cards, quick actions | `Mock` |
| Materials | `/principal/materials` | Browse materials and curriculum as a school leader | `Hybrid` |
| Material detail | `/principal/materials/[id]` | Read content and attachments | `Hybrid` |
| Booking | `/principal/booking` | Reserve facilities and review bookings | `Mock` |
| Reports | `/principal/reports` | Intended reporting area | `Gap` |

### Principal notes

- The portal is visible in dashboard routing and navigation.
- The `Reports` link exists in UI but the page is not currently implemented.

## 12. Known implementation gaps and risks

This section is important if the document is going to be used for planning, onboarding, or stakeholder explanation.

### Clear gaps

| Gap | Detail |
| --- | --- |
| Parent progress page missing | Sidebar points to `/parent/progress`, but that route does not exist |
| Principal reports page missing | UI links to `/principal/reports`, but that route does not exist |
| Curriculum role access path incomplete | `curriculum` is modeled in auth, but parent admin layout likely still blocks non-admin curriculum-only access |
| Curriculum role not shown in dashboard chooser | Dashboard portal cards do not include a Curriculum card |
| Student AI assistant not actually connected | The UI explicitly marks real AI integration as TODO |
| Several scheduling/booking flows are mock | Student, teacher, parent, and principal booking/meeting pages use demo-style data or local state |
| Many role pages use hardcoded identity values | Examples include `student-1`, `teacher-1`, `parent-1` and hardcoded names |

### Product-state summary

If this platform were described honestly to a stakeholder today, the best summary would be:

- The public website and basic auth model are real and coherent.
- Admin-side curriculum and module operations are the most mature internal workflows.
- The student portal has the broadest scope and several real features, but not every tool is production-ready.
- Teacher and parent experiences are partly real and partly demo-level.
- The curriculum access holder role exists conceptually, but still needs route/access cleanup to become truly usable as a separate role.

## 13. Recommended way to explain the website to a new stakeholder

If you need a short verbal explanation, this is the most accurate version:

> Edutindo is a mission-led education website with a multi-role learning platform behind it. Public visitors can learn about the foundation, contact the team, get involved, or donate. Logged-in users are routed into role-specific portals for students, teachers, parents, principals, and admins. The strongest operational workflows today are admin access control, curriculum structure management, reusable lesson-module editing, and structured curriculum lesson delivery. Student tools are the most extensive, while some teacher, parent, and scheduling areas are still partly scaffolded or demo-based.

