# Stoatmod website

The public website and server dashboard for [Stoatmod](https://modstoat.site), a moderation bot
for [Stoat](https://stoat.chat). The dashboard talks to the API in the
[Stoatmod bot repository](https://github.com/StoatMod-site/Stoatmod).

## What's included

- The public site: home, features, guides, documentation, Discovery, status, privacy and appeal pages.
- The server dashboard for server owners and moderators.

Not included: Stoatmod's internal staff dashboards.

## Requirements

- Node.js 22.13+ and pnpm 12.11.2 (pinned in `package.json`)
- A running Stoatmod dashboard API (see the bot repository)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The example uses `http://127.0.0.1:8081` for the dashboard API. Start that API from its own
repository, then open `http://localhost:3000`. The development server proxies `/api/` requests
to `STOATMOD_PUBLIC_API_ORIGIN`.

In production, put the site and the API behind one origin; see `deploy/Caddyfile.example`.
Set the API's `DASHBOARD_ALLOWED_ORIGIN` to the public HTTPS origin and
`DASHBOARD_SECURE_COOKIES=true`. Keep the API's upstream address private.

## Tests

```bash
pnpm run lint
pnpm run build
node --test tests/*.test.mjs
```

## License

Copyright (C) 2026 Stoatmod Limited

Licensed under the [GNU Affero General Public License v3.0](LICENSE).
