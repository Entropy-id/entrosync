# Client Invite System — Full Implementation Plan

## Overview

This plan describes how to build a production-ready **client invitation system** that lets freelancers send secure email invites to clients. Clients can view their project dashboard via a magic link without registering or logging in.

## Architecture

```
Freelancer                      Server                           Client
   |                               |                                |
   |-- POST /createProjectInvite ->|                                |
   |   {projectId, clientEmail}    |                                |
   |                               |-- 1. Verify freelancer auth    |
   |                               |-- 2. Create token + expiry     |
   |                               |-- 3. Save to ProjectInvite     |
   |                               |-- 4. Send email via Resend     |
   |<- {token, url} ---------------|                                |
   |                               |                                |
   |                               |<-- GET /client/:token ---------|
   |                               |-- 1. Lookup token              |
   |                               |-- 2. Check expiry              |
   |                               |-- 3. Fetch project data        |
   |                               |-- 4. Render read-only view     |
   |                               |----------------> Client Dashboard
```

---

## Phase 1: Database & Schema (Already Done ✅)

### 1.1 Prisma Model

The `ProjectInvite` model stores invite tokens.

```prisma
model ProjectInvite {
  id        String   @id @default(uuid())
  token     String   @unique
  projectId String   @map("project_id")
  email     String?  // Optional: who the invite was sent to
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("project_invites")
}
```

**Migration command:**
```bash
npx prisma db push
npx prisma generate
```

### 1.2 Validation Schemas (Already Done ✅)

```ts
// src/modules/project/project.schema.ts

export const createProjectInviteSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email().optional(),
});

export const getProjectByInviteTokenSchema = z.object({
  token: z.string().min(1),
});

export const revokeInviteSchema = z.object({
  inviteId: z.string().uuid(),
});
```

---

## Phase 2: Email Service

### 2.1 Provider Choice: Resend

**Why Resend:**
- Free tier: 3,000 emails/day
- Great deliverability
- Simple API
- No SMTP configuration needed

**Alternative:** Nodemailer + any SMTP (Gmail, SendGrid, etc.)

### 2.2 Install

```bash
pnpm add resend
```

### 2.3 Create Email Module

**New file: `src/modules/email/email.service.ts`**

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InviteEmailData {
  to: string;
  clientName: string;
  freelancerName: string;
  projectTitle: string;
  inviteUrl: string;
}

export async function sendInviteEmail(data: InviteEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return null;
  }

  return await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "noreply@entrosync.com",
    to: data.to,
    subject: `${data.freelancerName} invited you to view "${data.projectTitle}"`,
    html: buildInviteHtml(data),
  });
}

function buildInviteHtml(data: InviteEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation</title>
    </head>
    <body style="margin:0;padding:0;background-color:#09090b;font-family:system-ui,-apple-system,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" max-width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#18181b;border-radius:16px;border:1px solid #27272a;">
              <tr>
                <td style="padding:40px 32px 32px;">
                  <img src="https://yourdomain.com/logo_entrosync.svg" alt="EntroSync" width="32" height="32" style="margin-bottom:24px;">
                  <h1 style="color:#fafafa;font-size:20px;font-weight:600;margin:0 0 8px;">You're invited!</h1>
                  <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    <strong style="color:#e4e4e7;">${data.freelancerName}</strong> invited you to view the project 
                    <strong style="color:#e4e4e7;">"${data.projectTitle}"</strong> on EntroSync.
                  </p>
                  <a href="${data.inviteUrl}" style="display:inline-block;background:#ffffff;color:#09090b;text-decoration:none;padding:14px 28px;border-radius:9999px;font-size:14px;font-weight:600;">View Project Dashboard</a>
                  <p style="color:#52525b;font-size:12px;margin:24px 0 0;">
                    Or copy this link:<br>
                    <span style="color:#a1a1aa;word-break:break-all;">${data.inviteUrl}</span>
                  </p>
                  <p style="color:#52525b;font-size:12px;margin:16px 0 0;">
                    This link expires in 30 days. No account or password required.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
```

### 2.4 Environment Variables

Add to `.env`:

```env
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=noreply@entrosync.com
```

---

## Phase 3: API Layer

### 3.1 Create Invite (Already Done ✅ — needs email integration)

**File: `src/modules/project/project.api.ts`**

Update the existing `createProjectInvite` to:
1. Accept `email` (required for production)
2. Send email via Resend
3. Return the invite details

```ts
export const createProjectInvite = createServerFn({
  method: "POST",
})
  .validator((input) => createProjectInviteSchema.parse(input))
  .handler(async ({ data }) => {
    const parsed = createProjectInviteSchema.parse(data);
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: parsed.projectId, freelancerId: session.user.id },
      include: { freelancer: { select: { name: true } } },
    });
    if (!project) throw new Error("Project not found");

    // Generate token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save invite
    const invite = await prisma.projectInvite.create({
      data: {
        token,
        projectId: parsed.projectId,
        email: parsed.email,
        expiresAt,
      },
    });

    // Build URL
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/client/${token}`;

    // Send email if email is provided and Resend is configured
    if (parsed.email) {
      await sendInviteEmail({
        to: parsed.email,
        clientName: parsed.email.split("@")[0], // fallback
        freelancerName: project.freelancer.name ?? "Your freelancer",
        projectTitle: project.title,
        inviteUrl: url,
      }).catch((err) => {
        console.error("Failed to send invite email:", err);
        // Don't throw — invite is still created, user can copy link manually
      });
    }

    return { inviteId: invite.id, token, url };
  });
```

### 3.2 List Invites for a Project

**New server function:**

```ts
export const getProjectInvites = createServerFn({
  method: "GET",
})
  .validator((input) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const invites = await prisma.projectInvite.findMany({
      where: {
        projectId: data.projectId,
        project: { freelancerId: session.user.id },
      },
      orderBy: { createdAt: "desc" },
    });

    return invites.map((i) => ({
      id: i.id,
      email: i.email,
      token: i.token,
      expiresAt: i.expiresAt.toISOString(),
      createdAt: i.createdAt.toISOString(),
      isExpired: i.expiresAt < new Date(),
    }));
  });
```

### 3.3 Revoke Invite

```ts
export const revokeProjectInvite = createServerFn({
  method: "POST",
})
  .validator((input) => revokeInviteSchema.parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const invite = await prisma.projectInvite.findFirst({
      where: {
        id: data.inviteId,
        project: { freelancerId: session.user.id },
      },
    });
    if (!invite) throw new Error("Invite not found");

    await prisma.projectInvite.delete({ where: { id: data.inviteId } });
    return { success: true };
  });
```

### 3.4 Get Project by Token (Already Done ✅)

The existing `getProjectByInviteToken` works. Consider these enhancements:

**Optional: Track access** — add an `accessedAt` field to `ProjectInvite` to know when the client first opened the link.

**Optional: One-time use** — if you want links to expire after first use, add a `usedAt` field and check it.

---

## Phase 4: Freelancer UI (Project Detail Page)

### 4.1 Invite Client Modal

Replace the current simple "Generate Invite Link" button with a proper modal:

**New component: `src/ui/project/components/InviteClientModal.tsx`**

```tsx
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Mail, Link, Copy, Check } from "lucide-react";
import { createProjectInvite } from "#/modules/project/project.api";

interface Props {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

export function InviteClientModal({ projectId, projectTitle, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const createInvite = useServerFn(createProjectInvite);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createInvite({
        data: { projectId, email: email || undefined },
      });
      setInviteUrl(result.url);
    } catch (err) {
      alert("Failed to create invite");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Invite Client</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {!inviteUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Email (optional)
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 border border-neutral-800 rounded-xl px-3 py-2.5">
                <Mail size={16} className="text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="bg-transparent outline-none text-sm text-white w-full placeholder:text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                If provided, we'll send an invitation email. Otherwise you can copy the link.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-bold rounded-full py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Invite Link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                <Check size={16} /> Invite created successfully!
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-zinc-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full border border-neutral-700 text-gray-300 text-sm font-medium rounded-full py-2.5 hover:bg-neutral-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4.2 Sent Invites List

**New component: `src/ui/project/components/SentInvitesList.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Clock, X, Mail, Link } from "lucide-react";
import { getProjectInvites, revokeProjectInvite } from "#/modules/project/project.api";

interface Props {
  projectId: string;
}

export function SentInvitesList({ projectId }: Props) {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const getInvites = useServerFn(getProjectInvites);
  const revokeInvite = useServerFn(revokeProjectInvite);

  useEffect(() => {
    getInvites({ data: { projectId } })
      .then(setInvites)
      .finally(() => setLoading(false));
  }, [getInvites, projectId]);

  async function handleRevoke(inviteId: string) {
    if (!confirm("Revoke this invite? The link will no longer work.")) return;
    await revokeInvite({ data: { inviteId } });
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  }

  if (loading) return <p className="text-sm text-gray-500">Loading invites...</p>;
  if (invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
        Sent Invites
      </h4>
      {invites.map((invite) => (
        <div
          key={invite.id}
          className={`flex items-center justify-between p-3 rounded-xl border ${
            invite.isExpired
              ? "bg-red-500/5 border-red-500/10"
              : "bg-zinc-950 border-neutral-800"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {invite.email ? (
              <Mail size={14} className="text-gray-500 shrink-0" />
            ) : (
              <Link size={14} className="text-gray-500 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-gray-300 truncate">
                {invite.email ?? "Link only"}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                {invite.isExpired
                  ? "Expired"
                  : `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRevoke(invite.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4.3 Update Project Detail Page

Replace the current inline invite UI in `ProjectDetailPage.tsx` with:

```tsx
// In the right sidebar, replace the current Client Access card with:

<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
  <h3 className="text-sm font-semibold text-gray-100">Client Access</h3>
  <p className="text-xs text-gray-400">
    Generate a secure link so your client can view project progress without logging in.
  </p>
  <button
    type="button"
    onClick={() => setInviteModalOpen(true)}
    className="w-full bg-white text-black text-sm font-bold rounded-full py-2.5 hover:bg-zinc-200 transition-colors"
  >
    Invite Client
  </button>
  <SentInvitesList projectId={project.id} />
</div>

// And add the modal:
{inviteModalOpen && (
  <InviteClientModal
    projectId={project.id}
    projectTitle={project.title}
    onClose={() => setInviteModalOpen(false)}
  />
)}
```

---

## Phase 5: Client Dashboard (Already Done ✅)

The client dashboard at `src/ui/client/ClientDashboardPage.tsx` is already built and functional. Consider these enhancements:

### 5.1 Add a "Viewed By" Log

When a client opens the link, record it:

```ts
// In getProjectByInviteToken, after validation:
await prisma.projectLog.create({
  data: {
    projectId: invite.projectId,
    action: "CLIENT_VIEWED",
    description: `Client viewed dashboard via invite token`,
  },
});
```

### 5.2 Add Feedback Section

Allow clients to submit feedback directly from the dashboard:

- Add a "Leave Feedback" button that opens a simple form
- POST to a new `createFeedbackPublic` server function (validated by token)

### 5.3 Mobile Responsiveness

The current dashboard is responsive but test on actual mobile devices.

---

## Phase 6: Security Hardening

### 6.1 Rate Limiting

Add rate limiting to `createProjectInvite` to prevent abuse:

```ts
// Simple in-memory rate limiter (use Redis in production)
const inviteRateLimits = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10;

  const requests = inviteRateLimits.get(userId) ?? [];
  const recent = requests.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) return false;

  recent.push(now);
  inviteRateLimits.set(userId, recent);
  return true;
}
```

### 6.2 Token Rotation

Instead of allowing multiple active invites per project, consider:
- Revoking old invites when a new one is created
- Or limiting to 5 active invites per project

### 6.3 IP Logging (Optional)

For audit purposes, log the IP address that accesses the client dashboard:

```ts
// In the route loader or server function
const ip = getHeader("x-forwarded-for") ?? getHeader("x-real-ip") ?? "unknown";
```

---

## Phase 7: Testing Plan

### 7.1 Unit Tests

Test the validation schemas:

```ts
// src/modules/project/project.schema.test.ts
import { describe, expect, it } from "vitest";
import { createProjectInviteSchema } from "./project.schema";

describe("createProjectInviteSchema", () => {
  it("accepts valid data", () => {
    expect(
      createProjectInviteSchema.safeParse({
        projectId: "550e8400-e29b-41d4-a716-446655440000",
        email: "client@example.com",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      createProjectInviteSchema.safeParse({
        projectId: "550e8400-e29b-41d4-a716-446655440000",
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });
});
```

### 7.2 Integration Tests

Test the full flow:

1. Freelancer creates invite → token generated
2. Client accesses `/client/:token` → project data returned
3. Expired token → 404 or error page
4. Revoked invite → 404

### 7.3 E2E Testing

Manual QA checklist:

- [ ] Generate invite from project page
- [ ] Copy link and open in incognito
- [ ] Verify no edit buttons or forms
- [ ] Verify real data (milestones, invoices)
- [ ] Revoke invite and verify link no longer works
- [ ] Test with expired token
- [ ] Test email delivery (if Resend configured)
- [ ] Test mobile layout

---

## Phase 8: Deployment Checklist

### Environment Variables

Ensure these are set in production:

```env
APP_URL=https://entrosync.com
RESEND_API_KEY=re_live_xxx
FROM_EMAIL=noreply@entrosync.com
```

### Database

```bash
npx prisma migrate deploy
```

### DNS (for email deliverability)

If using a custom `FROM_EMAIL` domain:
1. Add SPF record: `v=spf1 include:spf.resend.com ~all`
2. Add DKIM record from Resend dashboard
3. Verify domain in Resend

---

## Summary of Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/modules/email/email.service.ts` | Resend email sending |
| `src/ui/project/components/InviteClientModal.tsx` | Modal to invite client |
| `src/ui/project/components/SentInvitesList.tsx` | List of active invites |

### Modified Files

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | `ProjectInvite` model ✅ |
| `src/modules/project/project.schema.ts` | Invite schemas ✅ |
| `src/modules/project/project.api.ts` | `createProjectInvite`, `getProjectByInviteToken` ✅, add `getProjectInvites`, `revokeProjectInvite` |
| `src/ui/project/ProjectDetailPage.tsx` | Add modal trigger + sent invites list |
| `.env` | Add `RESEND_API_KEY`, `FROM_EMAIL` |
| `package.json` | Add `resend` dependency |

### Existing & Working ✅

| File | Status |
|------|--------|
| `src/routes/client/$token/index.tsx` | Public route ✅ |
| `src/ui/client/ClientDashboardPage.tsx` | Read-only client dashboard ✅ |

---

## Timeline Estimate

| Phase | Time |
|-------|------|
| Phase 1: Database | 15 min ✅ |
| Phase 2: Email Service | 30 min |
| Phase 3: API Layer (list + revoke) | 30 min |
| Phase 4: Freelancer UI | 1 hour |
| Phase 5: Client Dashboard Polish | 30 min |
| Phase 6: Security | 30 min |
| Phase 7: Testing | 45 min |
| **Total** | **~4 hours** |

---

## Next Steps

1. Decide on email provider (Resend recommended)
2. Get API key and configure `.env`
3. Implement Phase
