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

## Adding a paying couple (manual for now)

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
  designs/animated/            Animated designs: Kandyan Heritage, Chapel Doors, Velvet Night,
                               Wax Seal, Crimson Curtain, Coastal Drive, Boarding Pass
                               (ThemedSections.tsx = shared sections, ornaments.tsx = SVG art, Reveal.tsx = scroll fade-in)
  designs/GoldenPoruwa.tsx     Maroon & gold design
  designs/EternalNoir.tsx      Black & white house-style design
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

1. Copy `components/designs/EternalNoir.tsx` to e.g. `components/designs/IvoryModern.tsx` and restyle it. Keep the `blocks` map so section order and show/hide keep working, and respect the `preview` prop.
2. Add it to the `DESIGNS` list in `components/designs/index.ts`. It then appears in the editor's template picker.

## Animated designs

| Design | Opening animation | While reading |
| --- | --- | --- |
| Kandyan Heritage | Spinning mandala, elephant procession, "Open invitation" slides away | Mandala blooms, petals fall, sections fade up |
| Chapel Doors | Arched doors swing open with light behind | Twinkling sparkles, arched event cards |
| Velvet Night | Glowing arch under fairy lights, "Step inside" | Lights brighten, fireflies drift, shimmering names |
| Wax Seal | Ivory envelope with embossed flowers; tap the monogram seal – it cracks and the flap lifts | Soft ivory card style |
| Crimson Curtain | Red velvet curtains with a pulsing "Tap to open" – they part to the sides | Swaying marigold garlands, gold on crimson |
| Coastal Drive | "Save the date" over a palm-lined road, "Start the drive" | Scroll-driven: the road and palms roll by and the wedding car drives on as guests scroll |
| Boarding Pass | "Preparing your journey" loading bar, then a boarding pass with the guest as passenger; "Board now" tears the stub and a plane takes off | Night sky with stars and clouds; a plane moves along the flight path as guests scroll |

Every design also supports a **couple photo** (opening screen and intro), a **photo gallery** section (tap a photo to view it full screen; swipe or use arrow keys), and **background music** that starts when the guest taps the open button, with a floating play/pause button. Couples upload these in the editor; photos are resized in the browser before upload.

Animations switch off automatically for guests who turn on "reduce motion" on their phone. The keyframes live in `app/globals.css` (look for `ec-`).

## Going live

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com, add the same three environment variables (set `NEXT_PUBLIC_SITE_URL` to your real domain), and deploy.
3. Add your domain in Vercel, and add it under Supabase → **Authentication → URL Configuration**.

## Next features to build

- More designs (Kandyan, modern, Sinhala/Tamil versions)
- Photo gallery and couple photos (Supabase Storage)
- Table arrangement / seating planner
- Payments + automatic account creation (a Sri Lankan payment gateway), replacing the manual *Add user* step
- Video invitations (Remotion)
- CSV export of RSVPs

> Note: if you run `schema.sql` a second time it will stop at "policy already exists". That's fine – the tables are already set up.
