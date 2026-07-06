# Client Dashboard Architecture Plan

## Overview

This document describes how clients access their project dashboard via a secure magic link, what they can see, and how the system enforces read-only access.

---

## 1. Access Control Architecture

### 1.1 Invite Token Lifecycle

```
Freelancer creates invite
        |
        v
+----------------------------+
|    ProjectInvite Table     |
|  token (UUID, unique)      |
|  projectId (FK)            |
|  email (optional)          |
|  expiresAt (+30 days)      |
|  createdAt                 |
+----------------------------+
        |
        v
Client receives email with /client/:token
        |
        v
Server validates token + expiry
        |
        v
Client sees read-only dashboard
```

### 1.2 Token Validation Rules

| Check | Failure Result |
|-------|---------------|
| Token exists in DB | `404 Not Found` |
| Token not expired (`expiresAt > now()`) | `404 Not Found` |
| Project exists | `404 Not Found` |

**No session required.** The token IS the credential.

---

## 2. Route Structure

```
Freelancer Routes (Auth Required)
├── /dashboard/admin          → Freelancer dashboard
├── /project/:projectName     → Project detail (full CRUD)
└── /project/:projectName/... → Milestones, tasks, documents

Public Routes (No Auth)
└── /client/:token            → Client dashboard (read-only)
```

### 2.1 Route Guard Comparison

| Route | Auth Check | Data Scope |
|-------|-----------|------------|
| `/dashboard/admin` | `getSession()` required | All freelancer's projects |
| `/project/:name` | `getSession()` + ownership | Single project if freelancer owns it |
| `/client/:token` | **None** — token only | Single project linked to token |

---

## 3. Data Fetching for Client View

### 3.1 Server Function: `getProjectByInviteToken`

```ts
// Public — no auth header check
export const getProjectByInviteToken = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  // 1. Validate token exists
  const invite = await prisma.projectInvite.findUnique({
    where: { token: data.token },
  });
  if (!invite) throw notFound();

  // 2. Check expiry
  if (invite.expiresAt < new Date()) throw notFound();

  // 3. Fetch project with ALL relations
  const project = await prisma.project.findUnique({
    where: { id: invite.projectId },
    include: {
      milestones: { include: { tasks: true } },
      invoices: true,
      feedbacks: true,
      resources: true,
      documents: true,
      logs: true,
    },
  });

  return serializeProjectDetail(project);
});
```

### 3.2 What Data Is Returned

The client receives the **same serialized data** as the freelancer's `getProjectById`, but the UI decides what to render and what actions to expose.

| Data | Client Can View | Client Can Modify |
|------|----------------|-------------------|
| Project title, description, status | ✅ Yes | ❌ No |
| Milestones + tasks | ✅ Yes | ❌ No |
| Invoices | ✅ Yes | ❌ No |
| Resources | ✅ Yes | ❌ No |
| Documents | ✅ Yes | ❌ No |
| Logs/Activity | ✅ Yes | ❌ No |
| Feedback | ✅ Yes | ❌ No (view only) |

---

## 4. Read-Only Enforcement (Two Layers)

### 4.1 Backend Enforcement (Critical)

**There are NO public server functions for mutation.**

| Server Function | Auth Required | Who Can Call |
|----------------|---------------|--------------|
| `createProject` | ✅ Session | Freelancer only |
| `updateProject` | ✅ Session | Freelancer only |
| `deleteProject` | ✅ Session | Freelancer only |
| `createMilestone` | ✅ Session | Freelancer only |
| `updateMilestoneStatus` | ✅ Session | Freelancer only |
| `deleteMilestone` | ✅ Session | Freelancer only |
| `createTask` | ✅ Session | Freelancer only |
| `updateTaskStatus` | ✅ Session | Freelancer only |
| `deleteTask` | ✅ Session | Freelancer only |
| `createInvoice` | ✅ Session | Freelancer only |
| `updateInvoiceStatus` | ✅ Session | Freelancer only |
| `deleteInvoice` | ✅ Session | Freelancer only |
| `createProjectInvite` | ✅ Session | Freelancer only |
| `revokeProjectInvite` | ✅ Session | Freelancer only |
| `getProjectByInviteToken` | ❌ **None** | Anyone with token |

**Even if a malicious client crafts a request, there is no public API to modify data.**

### 4.2 Frontend Enforcement (UX)

The client dashboard UI (`ClientDashboardPage.tsx`) is built from scratch with **zero edit controls.**

| UI Element | Freelancer Project Page | Client Dashboard |
|-----------|------------------------|------------------|
| Editable project name | ✅ `EditableName` | ❌ Static text |
| Editable description | ✅ `EditableDescription` | ❌ Static text |
| Add/Edit/Delete milestones | ✅ `ProjectMilestones` with handlers | ❌ `MilestoneTimeline` (view only) |
| Add/Edit/Delete tasks | ✅ Task forms | ❌ Status badges only |
| Change project status | ✅ Dropdown | ❌ Static badge |
| Upload resources | ✅ File inputs | ❌ Link list only |
| Create invoices | ✅ Generator button | ❌ Table only |
| Download invoices | ✅ | ✅ (non-destructive) |
| Generate invite link | ✅ | ❌ Not visible |

---

## 5. Client Dashboard UI Breakdown

### 5.1 Layout

```
+------------------------------------------+
|  Sidebar (read-only nav)  |  Topbar     |
|  - Dashboard (active)     |  - Search   |
|  - Projects (disabled)    |  - Bell     |
|  - Invoices (disabled)    |  - Avatar   |
+---------------------------+-------------+
|                                          |
|  Overview: "Status check for {title}"   |
|  + Project status badge                  |
|                                          |
|  +------------------+  +--------------+  |
|  | Progress Ring    |  | Milestones   |  |
|  |   75%            |  | Timeline     |  |
|  |                  |  | (view only)  |  |
|  | Spent | Remain   |  |              |  |
|  | Deadline         |  |              |  |
|  +------------------+  +--------------+  |
|                                          |
|  +------------------------------------+  |
|  | Recent Invoices                    |  |
|  | ID | Date | Amount | Status | ↓    |  |
|  | (table, no edit buttons)           |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

### 5.2 Component Inventory

| Component | Source | Read-Only? |
|-----------|--------|-----------|
| `CircularProgress` | Custom SVG | Yes — display only |
| `MilestoneTimeline` | Custom | Yes — no click handlers |
| `ClientInvoiceTable` | Custom | Yes — download only, no status change |
| `StatusBadge` | Reused | Yes — display only |
| Sidebar nav items | Custom | Disabled (cursor-default, no onClick) |

---

## 6. Security Considerations

### 6.1 Token Expiry

- Tokens expire after **30 days** by default
- Expired tokens return `404` — same as non-existent tokens (no information leak)

### 6.2 Token Revocation

- Freelancer can revoke an invite from the project page
- Revoked tokens are **deleted from DB** — not soft-deleted
- Immediate effect — no caching issues

### 6.3 Rate Limiting (Recommended)

```ts
// On createProjectInvite
const now = Date.now();
const recent = invites.filter(i => now - i.createdAt.getTime() < 60 * 60 * 1000);
if (recent.length >= 10) throw new Error("Rate limit exceeded");
```

### 6.4 Access Logging (Recommended)

```ts
// Log each client dashboard access
await prisma.projectLog.create({
  data: {
    projectId: invite.projectId,
    action: "CLIENT_DASHBOARD_VIEWED",
    description: `Client viewed dashboard via invite`,
  },
});
```

### 6.5 Data Isolation

- The token only grants access to **one specific project**
- Client cannot enumerate other projects by changing the token
- Client cannot access freelancer's dashboard or other routes

---

## 7. Future Enhancements

### 7.1 Short-Term (Easy Wins)

| Feature | Effort | Impact |
|---------|--------|--------|
| Add `accessedAt` to ProjectInvite | 15 min | Track when client first opened link |
| Add IP logging | 15 min | Security audit trail |
| Custom expiry duration (7/14/30 days) | 30 min | Freelancer flexibility |
| Resend email if client lost link | 15 min | UX improvement |

### 7.2 Medium-Term

| Feature | Effort | Impact |
|---------|--------|--------|
| Client feedback submission from dashboard | 1 hour | Two-way communication |
| "Mark as viewed" notification to freelancer | 30 min | Real-time transparency |
| Download invoice PDF | 1 hour | Self-service billing |
| Mobile app deep-linking | 2 hours | Better mobile UX |

### 7.3 Long-Term

| Feature | Effort | Impact |
|---------|--------|--------|
| Password-protected invites | 2 hours | Extra security layer |
| Time-limited viewing (e.g., 1 hour session) | 3 hours | Banking-level security |
| Client comment threads per milestone | 4 hours | Collaboration |

---

## 8. Testing Checklist

### 8.1 Functional Tests

- [ ] Client opens `/client/:token` → sees project data
- [ ] Client opens expired token → sees 404
- [ ] Client opens revoked token → sees 404
- [ ] Client opens random token → sees 404
- [ ] Freelancer revokes invite → link immediately stops working
- [ ] Client cannot access `/dashboard/admin` without login
- [ ] Client cannot access `/project/:name` without login

### 8.2 Security Tests

- [ ] No POST/PUT/DELETE endpoints are public
- [ ] Token doesn't expose other projects
- [ ] Client UI has zero edit buttons/forms
- [ ] Invoice status badge is not a dropdown
- [ ] Milestone status is text, not a clickable toggle

### 8.3 Email Tests

- [ ] Email sent when `email` provided
- [ ] Email not sent when `email` omitted
- [ ] Email renders correctly on mobile
- [ ] Email CTA button links to correct URL

---

## 9. File Reference

### Backend

| File | Role |
|------|------|
| `prisma/schema.prisma` | `ProjectInvite` model |
| `src/modules/project/project.api.ts` | `createProjectInvite`, `getProjectByInviteToken`, `getProjectInvites`, `revokeProjectInvite` |
| `src/modules/project/project.schema.ts` | Validation schemas |
| `src/modules/project/project.utils.ts` | `serializeProjectDetail` |
| `src/modules/email/email.service.ts` | Resend email sending |

### Frontend

| File | Role |
|------|------|
| `src/routes/client/$token/index.tsx` | Public route, token loader |
| `src/ui/client/ClientDashboardPage.tsx` | Read-only dashboard UI |
| `src/ui/project/ProjectDetailPage.tsx` | Freelancer view with invite modal |
| `src/ui/project/components/InviteClientModal.tsx` | Invite creation modal |
| `src/ui/project/components/SentInvitesList.tsx` | Active invites list |

---

## 10. Quick Decision Guide

| Question | Answer |
|----------|--------|
| Can client edit project name? | **No** — no API, no UI controls |
| Can client change milestone status? | **No** — status is display-only text |
| Can client pay an invoice? | **Not yet** — view only, payment link can be added |
| Can client download an invoice? | **Yes** — download button is safe, read-only |
| Can client see other projects? | **No** — token is scoped to one project |
| Can client access after 30 days? | **No** — token expires, returns 404 |
| Can freelancer revoke access? | **Yes** — delete invite, instant effect |
| Can client share the link? | **Yes** — anyone with the link can view |
| Can client see freelancer's other clients? | **No** — complete data isolation |
