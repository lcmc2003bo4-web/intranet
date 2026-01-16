# School ERP - Monorepo

## Apps
- `apps/client`: Next.js Frontend
- `apps/api`: NestJS Backend

## Packages
- `@repo/database`: Prisma Database Client

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Database:
   ```bash
   docker-compose up -d
   ```

3. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

4. Start Dev Server:
   ```bash
   npm run dev
   ```
