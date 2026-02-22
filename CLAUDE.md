# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development
npm run dev              # Start dev server on localhost:3000

# Database
npx prisma db push       # Apply schema changes to SQLite
npx tsx prisma/seed.ts   # Seed default categories (Mandatory, Food, Shopping)

# Build & production
npm run build            # TypeScript check + production build
npm start                # Start production server

# Docker
docker-compose up --build   # Build and start (first run)
docker-compose up -d        # Start in background (subsequent runs)
docker-compose down         # Stop (data persists in named volume)
docker-compose down -v      # Stop AND delete all data
```

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + SQLite via Prisma 7 + shadcn/ui + Recharts

### Prisma v7 - Critical Difference

Prisma v7 uses the new `prisma-client` generator (not `prisma-client-js`). The generated client lives at `src/generated/prisma/client` (gitignored) and **requires a database adapter** - it cannot read `DATABASE_URL` directly. The `PrismaClient` must always be constructed with `{ adapter }`:

```typescript
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

The singleton is in `src/lib/db.ts`. All API routes import `{ prisma }` from there.

### Database

- SQLite file: `data/budget.db` (gitignored)
- `prisma.config.ts` configures the schema and datasource URL
- Run `npx prisma db push` after schema changes (no migration history, just push)
- Three models: `Category`, `Expense`, `Investment`

### Key Design Decisions

- **Expenses**: `amount` is signed float - positive = outflow, negative = reimbursement
- **Investments**: `quantity` is nullable - null means private equity/single-value asset (gain/loss % shown as N/A)
- **No income tracking** - only outflows. Reimbursements are negative expenses.

### Directory Structure

```
src/
  app/
    api/
      categories/         GET, POST + [id] PUT, DELETE (409 if has expenses)
      expenses/           GET (filter by month/year/category/search), POST
      expenses/[id]/      PUT, DELETE
      expenses/import/    POST multipart - CSV upload
      expenses/export/    GET - returns CSV file download
      investments/        GET (with computed gain/loss), POST
      investments/[id]/   PUT, DELETE
      dashboard/          GET - single endpoint returning all chart data
    dashboard/page.tsx    Charts + KPI cards
    expenses/page.tsx     Expense list with filters, import/export
    categories/page.tsx   Category CRUD with color picker
    investments/page.tsx  Portfolio tracker
  components/
    layout/               Navbar.tsx, ThemeToggle.tsx
    dashboard/            MonthlyBarChart, CategoryPieChart, TrendLineChart, YtdSummaryTable, PeriodFilter
    expenses/             ExpenseTable, ExpenseForm, ExpenseFilters, ImportCsvDialog, ExportCsvButton
    categories/           CategoryList, CategoryForm
    investments/          PortfolioSummary, HoldingsTable, InvestmentForm
  lib/
    db.ts                 Prisma singleton (always import from here)
    csv.ts                parseCsv(), generateCsv() - handles "$1,716.41" and M/D/YYYY format
    types.ts              Shared TypeScript types
    utils.ts              cn(), formatCurrency(), formatDate(), formatDateInput(), parseLocalDate()
```

### Dashboard API

`GET /api/dashboard?year=YYYY&month=M` returns a single payload for all charts to minimize round-trips:
- `monthlyByCategory` - last 12 months, per-category breakdown (for stacked bar chart)
- `periodByCategory` - selected month, per-category totals (for pie chart)
- `monthlyTotals` - last 12 months totals (for trend line)
- `ytdTable` - categories x months grid (for YTD summary table)
- `selectedMonthTotal`, `ytdTotal`, `largestCategory` (for KPI cards)
- `categoryNames`, `categoryColors` (for chart rendering)

### Recharts + Dark Mode

Recharts doesn't read CSS variables. Chart components use `useTheme()` from `next-themes` and pass explicit hex colors. Formatter props use `as any` casts due to strict Recharts v3 types.

### CSV Import Format

The parser in `csv.ts` handles:
- Amounts: `$589.97` or `$1,716.41` (strips `$` and `,`)
- Dates: `9/1/2025` (M/D/YYYY, no leading zeros)
- Skip rule: any row where col[0] is empty or not a parseable date

### Docker / Data Persistence

- Named volume `budget-data` mounts to `/app/data` inside container
- SQLite file lives in the volume, survives `docker-compose down`
- `docker-entrypoint.sh` runs `prisma db push` (idempotent) on every start
- `next.config.ts` has `output: "standalone"` required for Docker

## Homelab / NAS Deployment

```bash
# First-time setup on any Linux machine with Docker
git clone <repo>
docker-compose up --build -d

# Access at http://<machine-ip>:3000

# To update the app
git pull
docker-compose up --build -d

# Backup your data
docker run --rm -v budget-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/budget-backup-$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm -v budget-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/budget-backup-YYYYMMDD.tar.gz -C /
```

To expose on a custom port, change `3000:3000` to `<port>:3000` in `docker-compose.yml`.
