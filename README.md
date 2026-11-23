# Eternal Chapter

Digital wedding invitations for Sri Lankan celebrations. Couples build an invitation, add guests, send each guest a personal WhatsApp link, and watch RSVPs arrive live.

**Stack:** Next.js 15 (React + TypeScript) · Tailwind CSS · Supabase (database, login, live updates) · Vercel (hosting)

---

## 1. Install the tools (one time)

1. Install **Node.js LTS** from https://nodejs.org (version 20 or newer).
2. Install **VS Code** from https://code.visualstudio.com (recommended editor).
3. Open this folder in VS Code, then open a terminal (**Terminal → New Terminal**) and run:

```bash
npm install
```

## 2. Create the database (one time)

1. Create a free account at https://supabase.com and click **New project**.
2. When it's ready, open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Go to **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up". Only couples you add yourself can sign in (see *Adding a paying couple* below).
4. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.

### Photos & music (all projects)

Run `supabase/migrations/003_media.sql` once. It adds the couple photo, background music and photo gallery, and creates a public **media** storage bucket where each couple can only change files in their own folder.

### Already ran schema.sql before this update?

Run `supabase/migrations/002_editor.sql` once in the SQL Editor. It adds the live editor's sections, invitation names and page views. Then run `npm install` again (a QR code package was added).

## 3. Connect the app to the database

Copy `env.example` to a new file named `.env.local` and paste in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Run it

```bash
npm run dev
```

Add yourself as a test couple first (see *Adding a paying couple*), open http://localhost:3000/login, sign in, then:

1. Create the invitation (names, events, venues).
2. **Add guests**.
3. **Publish** it from the Overview.
4. Open **Guest list & links** and copy a guest's link, or tap **Send on WhatsApp**.
5. Open that link in another browser (or a private window), reply, and watch it appear in **RSVP management**.

---

## Admin panel (`/admin`)

Manage every couple from one place: add couples, choose their plan and templates, set how many invitations they can make, record payments, pause or remove them, reset passwords, and publish/unpublish any invitation.

**One-time setup**
1. Run `supabase/migrations/004_admin.sql` in the SQL Editor.
2. Make yourself admin – run this with your own email:
   `update public.profiles set role = 'admin', max_invitations = 100 where email = 'you@example.com';`
3. Copy the **service_role** key from Supabase → Project Settings → API and add it as `SUPABASE_SERVICE_ROLE_KEY`:
   - in `.env.local` on your computer, and
   - in Vercel → Settings → Environment Variables (no `NEXT_PUBLIC_` prefix), then redeploy.
   This key has full access to your database. Never share it or paste it into chat, and never rename it with `NEXT_PUBLIC_`.
4. Sign in – admins land on `/admin`.

**What's enforced:** the database itself stops couples from creating more invitations than their limit, from switching to a template outside their plan, and from editing while suspended or after their *Access until* date. Published invitations stay online for guests even when a couple is paused – unpublish them from the couple's page if needed.

**Plans** (`/admin/plans`): Basic, Premium and Signature are created for you – change prices, invitation counts and templates, or add your own. Choosing a plan when adding a couple copies its limits; you can then adjust that couple individually.

## Adding a paying couple (manual for now)

Easiest: **Admin panel → Add couple**. The steps below are the manual way in Supabase, if you ever need it.

There is no public sign-up. After a couple pays, give them access in Supabase:

**Option A – you choose the password (quickest)**
1. Supabase → **Authentication → Users → Add user → Create new user**.
2. Enter the couple's email and a temporary password, and tick **Auto Confirm User**.
3. Send them the sign-in details on WhatsApp: `https://your-site/login`. They can change the password any time with *Forgot your password?*.

**Option B – they choose their own password (by email)**
1. One-time setup: Supabase → **Authentication → Emails → Templates**:
   - **Invite user**: change the link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
   - **Reset password**: change the link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   - Also set **Authentication → URL Configuration → Site URL** to your site (e.g. `http://localhost:3000` while testing).
2. **Authentication → Users → Add user → Send invitation**, enter their email.
3. They tap the link in the email, choose a password on the *Set password* page and land in their dashboard.

To remove access later, delete the user (this also deletes their invitations and guest lists) or use **Ban user** in Supabase.

Your WhatsApp number for enquiries is set in `lib/site.ts` – change `whatsapp` to your own number.

Supabase's built-in email service only sends a few emails per hour. Before launch, add your own SMTP (e.g. Resend, Brevo) under **Authentication → Emails → SMTP Settings**.

## Project map

```
app/
  page.tsx                     Landing page (your business homepage)
  admin/                       Admin panel: overview, couples, add couple, plans & templates
  login/page.tsx               Couple sign in + forgot password (no public sign-up)
  set-password/page.tsx        Choose a password after an invite or reset email
  auth/confirm/route.ts        Handles the links in Supabase emails
  i/[slug]/page.tsx            The invitation guests open: /i/kasun-nethmi?g=TOKEN
  dashboard/
    page.tsx                   Overview: invitation cards, getting started, stats, latest replies
    invitations/page.tsx       My invitations: links, QR codes, publish, delete
    invitations/new/page.tsx   Create another invitation (homecoming, engagement…)
    invitation/page.tsx        Live editor with phone preview
    guests/add/page.tsx        Add guests (rows or paste from Excel)
    guests/links/page.tsx      WhatsApp template + personal links
    guests/rsvp/page.tsx       RSVP management (live)
components/
  designs/index.ts             List of designs shown in the template picker
  designs/story/               Pampas Emboss template (+ Story.tsx shared scenes, Envelope.tsx, art.tsx)
                               (Story.tsx = shared scenes and text animation, art.tsx = SVG roses, pampas, seals, frames)
  editor/                      Live editor, phone preview, section toggles
  invitation/                  Countdown + guest RSVP form
  dashboard/                   Dashboard building blocks
lib/
  supabase/                    Database connection (browser, server, middleware)
  types.ts                     Data shapes
  utils.ts                     Dates (Sri Lanka time), links, phone numbers
supabase/schema.sql            Tables, security rules and guest functions
```

## How guest RSVPs stay safe

Guests don't sign in. Each guest link has a private token (`?g=…`). The guest page calls two database functions, `get_guest` and `submit_rsvp`, which only work with a valid token for a published invitation. Guests can't see anyone else's details. Couples see only their own data through row-level security.

## Adding a new design

1. Copy one of `components/designs/story/*.tsx` (e.g. `PampasEmboss.tsx`) and restyle its cover, background, frame and colours. The shared scenes come from `story/Story.tsx`, so section order and show/hide keep working.
2. Add it to the `DESIGNS` list in `components/designs/index.ts`. It then appears in the editor's template picker.

## Template: Pampas Emboss

Run `supabase/migrations/007_story.sql`, `008_story_only.sql` and `009_pampas_only.sql` once, in that order.

Pampas Emboss is currently the only template. It opens with an embossed burgundy envelope (`public/story/pampas-envelope.jpg`, cut along its folds in `components/designs/story/Envelope.tsx`). The side flaps swing open, then the top and bottom fold away. Inside, ivory paper with drifting window light, embossed pampas grass growing in, and text that writes itself in letter by letter (`story/Story.tsx`). It ends on maroon with a monogram frame that draws itself.

## Table arrangement (`/dashboard/guests/tables`)

Run `supabase/migrations/006_seating.sql` once. Then, for each event (Wedding, Homecoming…):
- **Designer** – add round, banquet and head tables, chair rows and decor areas (stage, dance floor); drag them into place. Drag a guest from the list onto a chair: their whole party (e.g. ×3) fills the next free chairs. Drag a seated guest to another chair to move them, or back onto the guest list to unseat. Works with a finger on phones (use the ⋮⋮ handle).
- **List** – the easiest way on a phone: each table shows its chairs, with a *Seat a guest…* picker.
- **Publish** – guests who accepted see *Your table: Table 3* on their invitation. **Print** gives a clean seating chart (save as PDF from the print dialog).

## Going live

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com, add the same three environment variables (set `NEXT_PUBLIC_SITE_URL` to your real domain), and deploy.
3. Add your domain in Vercel, and add it under Supabase → **Authentication → URL Configuration**.

## Next features to build

- More designs (Kandyan, modern, Sinhala/Tamil versions)
- Photo gallery and couple photos (Supabase Storage)
- Payments + automatic account creation (a Sri Lankan payment gateway), replacing the manual *Add user* step
- Video invitations (Remotion)
- CSV export of RSVPs

> Note: if you run `schema.sql` a second time it will stop at "policy already exists". That's fine – the tables are already set up.
