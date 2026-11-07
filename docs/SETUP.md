# Setup command record

The original repository contained README.md, LICENSE, and .gitignore. The official
generator ran in a scratch directory to avoid conflicts with those existing files:

```powershell
npx --yes create-next-app@latest work/shorty-skeleton --ts --tailwind --eslint --app --src-dir --import-alias '@/*' --use-npm --empty --skip-install --disable-git --no-agents-md --no-agent-feedback --yes
```

Generated files were copied to the existing Shorty repository, preserving LICENSE
and .git, and merging .gitignore. Subsequent package commands ran from that repository:

```powershell
npm pkg set name=shorty 'scripts.typecheck=next typegen && tsc --noEmit' 'scripts.test=tsx --test src/lib/*.test.ts' 'scripts.db:generate=drizzle-kit generate' 'scripts.db:migrate=drizzle-kit migrate' 'scripts.db:studio=drizzle-kit studio'
npm install drizzle-orm @neondatabase/serverless @upstash/redis server-only
npm install -D drizzle-kit tsx dotenv
npm test # First run intentionally fails before Base62 implementation
npm run db:generate
npm test
npm run lint
npm run typecheck
npm run build
```

Source/configuration files were edited directly: schema, server-only clients, Base62
helper and tests, environment example, app metadata, placeholder page, ES2020 target,
CI workflow, and documentation. The lockfile records exact installed dependencies.

## Configure later

```powershell
Copy-Item .env.example .env.local
# Fill DATABASE_URL and optional Redis credentials in .env.local
npm run db:migrate
npm run dev
```

No live database migration, hosted account creation, deployment, authentication,
analytics, monitoring connection, or backup automation is performed by this skeleton.

## Verification results

- Base62: four tests pass (boundaries, bigint precision, uniqueness sample, negative IDs).
- ESLint, TypeScript checks, and production build pass.
- npm audit --omit=dev: zero production dependency vulnerabilities.
- npm audit: 12 moderate development-tool advisories, including transitive esbuild
  and minimatch dependencies. No forced downgrades or major overrides applied.
- No live database or Redis integration tested: credentials are not configured.
- Production server smoke check: HTTP 200 and Shorty heading rendered on 127.0.0.1:3100.
