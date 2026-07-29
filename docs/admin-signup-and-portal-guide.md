# Admin Signup and Portal Guide

This guide explains how someone gets an Edutindo account, how admins enter `/admin`, and what the main admin tools are for.

## Important rule

Edutindo signup is invitation-only.

Regular users cannot create an account by opening `/signup` directly. They need an invitation email sent by an admin from Admin Access Control.

Allowlisted admins can go to `/admin`, sign in with an emailed admin passcode, and then invite other users.

## Path 1: Invited user signup

Use this path for students, teachers, parents, principals, curriculum users, or additional admins.

1. An approved admin opens `/admin/access`.
2. The admin enters the person's email, first name, last name, school, and portal access.
3. The admin sends the invitation.
4. The invited person opens the invitation link from their email.
5. The invite link opens `/signup?invite=...`.
6. The signup page shows the invited email and assigned portals.
7. The invited person enters their name if needed and creates a password.
8. The system creates the account, marks the email as verified, applies the assigned portals, and signs the user in.
9. The user is sent to their correct portal through `/dashboard`.

## Path 2: Existing admin entry through `/admin`

Use this path for admins whose email is already allowlisted or marked as an admin.

1. The admin opens `/admin`.
2. If not signed in, the site redirects to `/login?next=/admin`.
3. The admin enters their email.
4. If the email is allowlisted or already has admin access, the system emails a one-time passcode.
5. The admin enters the passcode.
6. The system signs the admin in and opens `/admin`.
7. From `/admin`, the admin can open Content Sandbox, Admin Portals, and other portal shortcuts.

Admins should not use `/signup` directly. Direct signup is blocked unless the URL contains a valid admin invitation token.

## Who can manage admin access

Only these emails can open `/admin/access` and manage invitations or portal permissions:

- `ymsp@edutindo.org`
- `it@edutindo.org`
- `admin@edutindo.org`

Other admins can still use the admin portal tools they have access to, but they will not see the Admin Access Control card or menu item.

## Content Sandbox

The Content Sandbox is the quick creation area on `/admin`.

### Create Curriculum

Route: `/admin/content-sandbox/curriculum`

Admins can:

- create a curriculum structure
- add or copy chapters
- assign curriculum content to a school and year
- prepare the school/year/subject/chapter structure before modules are added

### Create Chapter

Route: `/admin/content-sandbox/chapter`

Admins can:

- create a chapter under an existing curriculum
- attach existing modules to the chapter
- create new modules from the chapter workflow
- build chapter-level content before lesson publishing

### Create Module

Route: `/admin/content-sandbox/module`

Admins can:

- create reusable module content
- set module title, code, and identifier
- place the module into a curriculum chapter
- prepare content that can later be assigned to one or more lessons

### Check Logs

Route: `/admin/logs`

Admins can:

- review recent curriculum changes
- review chapter, module, assignment, and edit activity
- audit what changed before publishing or handing work to teachers

## Admin Portals

The Admin Portals section is the main tool area on `/admin`.

### Curriculum Portal

Route: `/admin/curriculum`

Admins can:

- create and maintain the curriculum tree
- manage schools, years, subjects, chapters, and lessons
- rename, delete, reorder, and update curriculum nodes
- set chapter metadata such as week ranges and learning outcomes

### Learning Materials

Route: `/admin/materials`

Admins can:

- browse the admin materials catalog
- open curriculum material previews
- move from materials into module editing workflows
- inspect how learning materials are organized

### Module Editor

Route: `/admin/module-editor`

Admins can:

- create and edit reusable lesson modules
- build module pages
- update existing module content
- save modules for use across curriculum lessons

### Admin Access Control

Route: `/admin/access`

Only the three approved access-control emails can use this area.

Approved admins can:

- invite new users
- assign portal access flags
- assign school access
- review user verification and admin state
- update a user's student, teacher, parent, principal, admin, or curriculum access

## Practical first setup flow

1. Approved admin opens `/admin`.
2. Approved admin signs in with the emailed passcode.
3. Approved admin opens `/admin/access`.
4. Approved admin invites each user with the correct portals.
5. Invited users accept their email invitation and create passwords.
6. Admin builds curriculum structure in Curriculum Portal or Content Sandbox.
7. Admin creates reusable content in Module Editor or Create Module.
8. Admin assigns modules through Module Library or the sandbox workflows.
9. Teachers, students, parents, and principals use their assigned portals.
