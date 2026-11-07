# Shorty

Fast and lightweight URL shortener. Initial Next.js / TypeScript skeleton.
Link creation, redirects, auth, analytics, monitoring, and backups are future work.

## Local development

Use Node.js 24 LTS and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. The placeholder page works without credentials.
Set DATABASE_URL in .env.local when ready. Upstash settings are optional.
Never expose service credentials through NEXT_PUBLIC_* variables.

## Database

```powershell
npm run db:generate
npm run db:migrate
npm run db:studio
```

The initial migration is generated, not applied to a live database.
The shared non-cycling link_id_seq allocates IDs atomically across app instances
using the same database. Rollbacks can leave gaps. Never reset the sequence;
restore its state correctly during recovery. Separate databases do not share it.

The future creation handler should reserve an ID using
SELECT nextval('link_id_seq')::text AS id, convert it to bigint, Base62 encode it,
and insert the explicit ID, code, and destination. Return only after commit,
then populate Redis. An unused reserved ID is safe. The primary key and unique
case-sensitive code constraint guard stored data. Keep the Base62 alphabet stable.
Codes are public, guessable identifiers, not access tokens.

## Structure

- src/app: App Router and placeholder home page
- src/db/schema.ts: sequence and links table
- src/db/index.ts: server-only Neon / Drizzle factory
- src/lib/base62.ts: precision-safe bigint encoding
- src/lib/redis.ts: optional server-only Upstash client; callers handle fallback
- drizzle: SQL migrations and metadata
- .github/workflows/ci.yml: checks without service credentials

## Validation

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

See docs/SETUP.md for commands used to initialize the project.
