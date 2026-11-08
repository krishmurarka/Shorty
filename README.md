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

## Google login and guest access

New visitors see a Google sign-in dialog with Continue as guest underneath.
Guest choice is a session cookie and never grants access to /account.
Google users can view their account, reload with their session, and sign out.

Configure NEON_AUTH_BASE_URL from the matching Neon branch and a random
NEON_AUTH_COOKIE_SECRET of at least 32 characters in .env.local.
The local values are configured; deployment environments need their own settings.
Generate a secret without printing it into a shared log.
Enable Google in Neon Auth and allow the exact app origins under trusted domains.
Neon shared Google credentials are for development; configure your own Google
OAuth credentials before public production use. Do not commit .env.local.

The OAuth return URL is /auth/callback. Neon middleware exchanges the verifier
and establishes HTTP-only session cookies before the route checks identity.
Authentication APIs are limited to Google sign-in, session checks, and sign-out.
No duplicate user table or database migration is needed for this flow.
Link creation, guest link claiming, and ownership are separate future features.

Run npm run test:e2e for the browser suite. It uses an isolated auth fixture
on port 3201 and the app on port 3100, with a separate .next-e2e build directory.
It does not create Neon accounts or contact Google. On Windows it uses installed
Chrome; on Linux install Chromium with npx playwright install --with-deps chromium.
The actual Google account-consent step should also be checked manually.
