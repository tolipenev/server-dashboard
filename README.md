# Homeserver Frontpage

A clean frontpage dashboard for your homelab / homeserver that lists services by category, checks live deployment health from **Argo CD**, and provides a secure login experience with **Google OAuth** + **encrypted user database**.

Built for people who want a fast, sleek “single pane of glass” for services running in Kubernetes / GitOps setups.

---

## Features

- **Service catalog dashboard**

  - Display services grouped by custom categories
  - Quick links to internal and external endpoints

- **Argo CD integration**

  - Pulls application status directly from Argo CD
  - Shows:

    - Synced / OutOfSync
    - Health status (Healthy/Degraded/Progressing/etc)
    - Full Argo application status surfaced in the UI

- **Authentication**

  - Google login with **NextAuth**
  - Secure user tracking via an **encrypted database**

- **Modern UI**

  - Responsive, minimal design
  - Dark/light theme toggle using `next-themes`
  - Animations via `motion`

- **Type-safe & robust**

  - Runtime validation with `zod`
  - DB access with `drizzle`
  - Code formatting/linting via `biome`

---

## Tech Stack

- **Framework:** Next.js (React)
- **Runtime:** Node.js
- **UI:** shadcn/ui
- **Auth:** NextAuth (Google Provider)
- **DB ORM:** Drizzle
- **Database:** PostgreSQL
- **Validation:** Zod
- **Networking:** Axios
- **Animation:** Motion
- **Theming:** next-themes
- **Tooling:** Biome

---

## Preview

> Add screenshots / GIFs here when you have them:
>
> - Dashboard view
> - Argo application status view
> - Category grouping view

---

## Getting Started

### 1) Clone

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```

### 2) Install dependencies

```bash
pnpm install
```

> (Or use `npm` / `yarn` depending on your repo.)

### 3) Configure environment variables

Create `.env.local`:

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_me_with_a_long_random_value

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=postgres://user:password@host:5432/dbname

# Argo CD
ARGOCD_BASE_URL=https://argocd.example.com
ARGOCD_TOKEN=your_argocd_token

# Optional encryption key if encrypting DB fields
ENCRYPTION_KEY=replace_me_with_a_32_byte_key

# Service links (optional)
# Used to build clickable service URLs without hardcoding LAN IPs in the repo
NEXT_PUBLIC_HOMESERVER_BASE_URL=http://192.168.0.100
```

## Notes

- `NEXTAUTH_SECRET` should be long and random (32+ chars).
- `ARGOCD_TOKEN` should have permission to read application status.
- If you're encrypting DB fields, `ENCRYPTION_KEY` must be stable across deployments.
- `NEXT_PUBLIC_HOMESERVER_BASE_URL` is used to build service URLs (e.g. `:8123`, `:30808`) so no static IPs are committed.

### Service URLs (no hardcoded IPs)

This repo intentionally avoids hardcoded LAN IP addresses.

Set the homeserver base URL:

```env
NEXT_PUBLIC_HOMESERVER_BASE_URL=http://192.168.0.100
```

Service links defined in `serviceMappings` append ports/paths to this base URL. Any absolute URL (e.g. public domain services) is used as-is.

---

## Database Setup (Drizzle + Postgres)

Ensure Postgres is running and `DATABASE_URL` is correct.

### Generate migrations

```bash
pnpm drizzle:generate
```

### Apply migrations

```bash
pnpm drizzle:migrate
```

> Commands may vary depending on your `package.json` scripts.

---

## Run Locally

```bash
pnpm dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## How It Works

### Service Directory

Services are defined from a configuration source (file/db/etc) and displayed grouped into categories.

Each service typically includes:

- Name
- URL
- Category
- Optional icon/description
- Optional Argo application mapping

### Argo CD Status

The dashboard periodically fetches Argo CD application status and maps it into UI-friendly labels.

Displayed fields include:

- **Sync:** Synced / OutOfSync
- **Health:** Healthy / Degraded / Progressing / Missing / Unknown
- **Extra details:** surfaced from the Argo response for deeper visibility

---

## Authentication & Security

- Login is handled via **Google OAuth** (NextAuth)
- User data is stored in Postgres via Drizzle
- Sensitive user-related fields can be stored encrypted (when enabled)

> This project is primarily designed for private hosting (LAN/VPN), but authentication prevents casual access.

---

## Deployment

This repo includes a `Dockerfile` and `.dockerignore` for containerized deployments.

Deploy anywhere Next.js can run:

- Docker
- Kubernetes
- VM / self-hosted Node

If deploying next to Argo CD:

- pass env vars via Kubernetes Secrets
- ensure network access to the Argo CD API
- consider caching Argo responses to reduce API load

---

## Contributing

PRs welcome!

- Use `biome` for formatting/linting
- Keep UI components consistent with shadcn conventions
- Prefer Zod schemas for runtime safety

---

## License

MIT

---

## 🙌 Credits

Built with:

- Next.js + React
- shadcn/ui
- NextAuth
- Drizzle ORM
- Argo CD
