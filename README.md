# לייקי · LIKEY

**יש לי משהו בשבילך!** — community shopping, deals and benefits platform for Haredi women in Israel.
Hebrew-first, full RTL, mobile-first. Brand name, slogan, nav and feature flags live in
[`src/config/site.ts`](src/config/site.ts). (The project was previously called MILA; the repository
name and deployment are unchanged.)

## Brand

- **Logo:** official artwork in `public/brand/likey-logo-reference.png`, rebuilt in code in
  `src/components/brand/Logo.tsx` — variants `framed` (full logo), `primary`, `compact`, `icon`, each with `onDark`.
  The symbol (`TagMark`) is two price tags hanging together. All variants are shown at `/brand`.
- **Colors / tokens:** `src/app/globals.css` — taken from the logo: cream canvas, ivory cards, deep rose gold
  `#9A5E57` for actions, metallic rose-gold gradient for the wordmark, blush `#F5E4DE`, champagne gold `#BFA585`.
- **Type:** Great Vibes (the "Likey" script), Frank Ruhl Libre (headings), Heebo (body).
- **AI character:** `src/components/brand/LikeyCharacter.tsx` reserves a fixed 4:5 slot with a branded
  placeholder. Add the final art via `src` and set `siteConfig.features.aiCharacter = true`.
- **WhatsApp:** set `siteConfig.community.whatsappUrl` to the invite link; until then the site shows "coming soon".

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Supabase (auth + Postgres)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add Supabase keys
npm run dev                  # http://localhost:3000
```

Without Supabase keys the site runs on the bundled demo data in `src/data/`;
sign-up, the personal area and admin show a "coming soon" state.

### Setting up Supabase (accounts + מועדון לייקי)

1. Create a Supabase project and put its URL and anon key in `.env.local` (and in Vercel → Environment Variables).
2. Run the migrations in order (`supabase/migrations/*.sql`, then `supabase/seed.sql`) in the SQL editor
   or with the Supabase CLI.
3. In Supabase → Authentication → URL Configuration, set the Site URL and add `<site>/auth/callback` as a redirect URL.
4. Sign up on the site, then make yourself admin in the SQL editor:
   `update profiles set role = 'admin' where email = 'you@example.com';`
5. Turn the club on (and the profile-completion rule) from `/admin/rewards` when ready.

### Checks

```bash
npm run check        # typecheck + lint + unit tests + data integrity
npm run test:db      # migrations + database tests on a local Postgres (PGHOST/PGUSER…)
npm run build
npm run format:check
```

## Project structure

```
src/
  app/
    (site)/            Consumer site: home, /businesses, /deals, /community,
                       /login, /account (מועדון לייקי), /account/profile
    admin/             Admin (admins only): overview, /admin/rewards, member detail
    api/affiliate/     Affiliate conversion webhook (501 until a network is connected)
    auth/callback      Email-confirmation handler
    layout.tsx         <html lang="he" dir="rtl">, Heebo font
  components/
    layout/            Header, footer, nav
    business/          BusinessCard
    deals/             DealCard, CopyCouponButton
    rewards/           PointsSummary, TransactionList
    admin/             StatTile, ActionResult
    ui/                StatusBadge, DemoNotice, FilterChips, SectionHeading, Alert, Field
  config/site.ts       Brand name, nav, feature flags — single source of truth
  data/                Categories + demo seed (businesses, offers)
  lib/
    data/repository.ts Data access layer — pages call only this
    auth/              Session helpers (requireSession, requireAdmin)
    rewards/           Rewards types, labels, queries, affiliate conversion interface
    notifications/     Channel-agnostic notify() (email/WhatsApp later)
    supabase/          Browser, server, middleware and service-role clients
    types.ts           Domain model (incl. affiliate types for phase 3)
supabase/
  migrations/          SQL schema with RLS (0002 = rewards foundation)
  seed.sql             Categories
  tests/               Database tests + local Supabase stub
docs/REWARDS.md        Rewards architecture, security rules, open business decisions
scripts/               check-data.ts, test-db.sh
```

## Demo vs. verified content

Every business and offer has a `status`:

| Status     | Meaning                                                      | Badge            |
| ---------- | ------------------------------------------------------------ | ---------------- |
| `demo`     | Placeholder for development; no relationship with business   | תוכן להדגמה      |
| `listed`   | Added from public info, not yet confirmed by the business    | ממידע פומבי      |
| `verified` | Confirmed directly / under a commercial agreement            | הצעה מאומתת ✓    |

Rules (enforced by `npm run check:data` and a DB trigger):

- The **real businesses** in the directory (Osher Ad, Shilav, Yad Sarah, etc.) are
  listings from public information only, with a `sourceUrl`. **No offers are attached
  to them.**
- Every demo offer belongs to a **fictional sample business** and uses a `DEMO-` coupon code.
- Pages show a visible notice wherever demo content appears.

## Roadmap

1. **Phase 1 (done):** setup, RTL layout, homepage, navigation, business directory, deals catalog.
2. **Phase 2 (this branch):** accounts, personal area, מועדון לייקי points ledger, earning rules,
   minimal rewards admin. See [docs/REWARDS.md](docs/REWARDS.md).
3. **Next:** admin CRUD for businesses and offers, move directory data to the DB.
4. **Later:** community recommendations; affiliate network integration and verified purchase points;
   rewards marketplace, tiers, challenges; WhatsApp notifications.
