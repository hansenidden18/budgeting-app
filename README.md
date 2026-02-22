# Budget Tracker

Personal budgeting and investment tracker. Track expenses by category, visualize spending with charts, and monitor your investment portfolio.

---

## Running Locally

**Requirements**: Node.js 20+

```bash
# 1. Install dependencies
npm install

# 2. Set up the database
npx prisma db push
npx tsx prisma/seed.ts

# 3. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**To stop**: press `Ctrl+C` in the terminal.

Data is stored in `data/budget.db` (a local SQLite file). It persists between restarts automatically.

---

## Docker Deployment (Homelab / NAS)

**Requirements**: Docker + Docker Compose

### First-time setup

```bash
docker-compose up --build -d
```

Open `http://<your-machine-ip>:3000`.

### Start

```bash
docker-compose up -d
```

### Stop (data is safe)

```bash
docker-compose down
```

### Stop and delete all data

```bash
docker-compose down -v
```

### Update the app

```bash
git pull
docker-compose up --build -d
```

### Change the port

Edit `docker-compose.yml` and change `3000:3000` to `<your-port>:3000`:

```yaml
ports:
  - "8080:3000"   # now accessible at http://<ip>:8080
```

---

## Backup & Restore

Data lives in a Docker named volume (`budget-data`).

```bash
# Backup to current directory
docker run --rm \
  -v budget-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/budget-$(date +%Y%m%d).tar.gz /data

# Restore from backup
docker run --rm \
  -v budget-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/budget-YYYYMMDD.tar.gz -C /
```

---

## Importing Your CSV

Go to **Expenses -> Import CSV**. Expected columns: `Date, Description, Category, Amount`.

To export your data at any time: **Expenses -> Export CSV**.
