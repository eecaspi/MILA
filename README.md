# MILA

Community commerce and affiliate platform for Haredi women in Israel.
Hebrew-first, full RTL. **MILA is a temporary brand name** — change it in
[`src/config/site.ts`](src/config/site.ts).

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Supabase (auth + Postgres)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add Supabase keys
npm run dev                  # http://localhost:3000
```

Without Supabase keys the site runs on the bundled demo data in `src/data/`.

### Checks

```bash
npm run check        # typecheck + lint + data integrity
npm run build
npm run format:check
```

## Project structure

```
src/
  app/
    (site)/            Consumer site: home, /businesses, /deals, /community
    admin/             Admin dashboard (phase 2 — dev preview only, 404 in production)
    layout.tsx         <html lang="he" dir="rtl">, Heebo font
  components/
    layout/            Header, footer, nav
    business/          BusinessCard
    deals/             DealCard, CopyCouponButton
    ui/                StatusBadge, DemoNotice, FilterChips, SectionHeading
  config/site.ts       Brand name, nav, feature flags — single source of truth
  data/                Categories + demo seed (businesses, offers)
  lib/
    data/repository.ts Data access layer — pages call only this
    supabase/          Browser, server and middleware clients
    types.ts           Domain model (incl. affiliate types for phase 3)
supabase/
  migrations/          SQL schema with RLS
  seed.sql             Categories
scripts/check-data.ts  Demo data integrity rules
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
2. **Phase 2:** Supabase auth, admin role, admin CRUD for businesses and offers, move data to DB.
3. **Phase 3:** community recommendations.
4. **Phase 4:** affiliate program — personal referral links, click/commission tracking,
   affiliate dashboard (schema already in `0001_initial_schema.sql`).
