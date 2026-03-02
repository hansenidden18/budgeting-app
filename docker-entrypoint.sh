#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --url "$DATABASE_URL"

echo "Seeding default categories (if empty)..."
npx tsx prisma/seed.ts || true

echo "Starting application..."
exec node server.js
