## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

npx create-next-app@latest

npm install next-auth@beta

npm install @prisma/client @auth/prisma-adapter mongodb @auth/mongodb-adapter
npm install bcryptjs mongodb react-icons @types/bcryptjs

npm install prisma --save-dev

npx prisma init
// add Database url and db name in the url as well

// for putting in env auth secret
npx auth secret

npx prisma generate
npx prisma db push

# Docker & DigitalOcean Deployment

## Prerequisites
- Docker and Docker Compose installed locally
- DigitalOcean account and either:
  - App Platform (builds from repo/Dockerfile), or
  - Droplet with Docker Engine
- Environment variables set (see `.env.example` if you have one):
  - DATABASE_URL (MongoDB connection string)
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET
  - GITHUB_ID / GITHUB_SECRET (optional)
  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional)
  - For local Mongo container, you can set:
    - MONGO_INITDB_ROOT_USERNAME
    - MONGO_INITDB_ROOT_PASSWORD

## Local with Docker Compose
```bash
# 1) Create .env
cp .env.example .env  # then fill values

# 2) Build and start
docker compose up --build -d

# 3) Logs
docker compose logs -f app

# App at http://localhost:3000
```

- Uploads are persisted via `uploads` volume mounted to `public/uploads`.
- Mongo data is persisted via `mongo-data` volume.

## Notes on Prisma (MongoDB)
- Prisma Client is generated during the Docker build (`npx prisma generate`).
- No migrations for Mongo; schema is applied via `db push` if you need, but for the Dockerfile we keep the runtime lean. If you must push on boot, add a command step or init container to run `npx prisma db push`.

## Deploy to DigitalOcean

### Option A: App Platform
1. Push your repo with the included `Dockerfile`.
2. Create new App → choose your repo/branch.
3. App Platform will build the Docker image from `Dockerfile`.
4. Set environment variables in App → Settings → Environment Variables:
   - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, provider keys, etc.
5. Add a DigitalOcean Managed MongoDB or external MongoDB and set `DATABASE_URL` accordingly.
6. Expose port `3000`. App Platform will map it automatically.
7. For file uploads, use a persistent storage solution (e.g., Spaces/S3) in production. Local container FS is ephemeral. Update any upload logic/URLs accordingly if moving off `public/uploads`.

### Option B: Droplet (Docker Engine)
1. Provision a Droplet and install Docker + Docker Compose.
2. Copy project files to the droplet.
3. Create `.env` with production values.
4. Start the stack:
```bash
docker compose up --build -d
```
5. Put Nginx or Caddy in front for TLS and domain:
   - Reverse proxy to `app:3000`.
6. Ensure volumes are backed up (`mongo-data`, `uploads`).

## Health/Monitoring
- Check container logs: `docker compose logs -f app`.
- Restart policy can be adjusted in `docker-compose.yml`.

## Troubleshooting
- If auth fails, verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
- If DB connects locally but not in DO, check `DATABASE_URL` networking and allowlists.
- If images/uploads don’t persist, confirm the `uploads` volume is attached; for App Platform, prefer object storage.