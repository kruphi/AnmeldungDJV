# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

JagdSchießen is a digital registration platform for hunting shooting events per DJV guidelines. It's a monorepo with a React frontend, Express backend, and PostgreSQL database.

**Sprach-Regel:** Ausschließlich JavaScript. Kein TypeScript, kein Python, kein PHP. Backend, Frontend und Build-Config — alles JS.

## Local Development

```bash
# Start database only
docker compose up db -d

# Backend (port 3001)
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (port 5173, new terminal)
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:3001`, so the frontend always calls `/api/...` without hardcoding the backend URL.

## Environment

Copy `.env.example` to `.env`. In Produktion wird die `.env` automatisch durch `deploy-tenant.sh` erzeugt. Lokal manuell befüllen: `DB_PASSWORD` (beliebig) und `JWT_SECRET` (min. 32 Zeichen, `openssl rand -hex 32`).

## Database

```bash
cd backend
npx prisma migrate dev        # create + apply new migration
npx prisma migrate deploy     # apply pending migrations (production)
npx prisma studio             # open database GUI
npx prisma generate           # regenerate client after schema changes
```

The Prisma schema lives at [backend/prisma/schema.prisma](backend/prisma/schema.prisma). The shared PrismaClient instance is in [backend/src/lib/prisma.js](backend/src/lib/prisma.js) — all route files import from there, nie `new PrismaClient()` direkt.

## Architecture

### Netzwerk-Architektur (Produktion)
```
Internet → Caddy (web) → Nginx/Frontend (web + internal)
                              ├── statische Dateien
                              └── /api/* → Backend (internal only) → DB (internal)
```
Das Backend ist **nicht** im `web`-Netz — nur Nginx kann es erreichen. Nginx proxied `/api/*` intern an `http://backend:3001`. Caddy braucht deshalb keinen separaten Backend-Block, der Standard-`reverse_proxy`-Eintrag von `deploy-tenant.sh` reicht.

### Installation Wizard
On first deploy (empty DB), `GET /api/setup/status` returns `{ setupRequired: true }`. `AuthContext` prüft das beim Start und leitet auf `/setup` weiter. Die `SetupPage` erstellt den ersten ADMIN-User via `POST /api/setup`. Sobald ein User existiert, ist der Endpunkt gesperrt (409). Kein Seed-Script mehr nötig.

### Auth flow
JWT is issued on login and stored as an **HttpOnly cookie** (not localStorage). The `authenticate` middleware in [backend/src/middleware/auth.js](backend/src/middleware/auth.js) verifies the cookie. The frontend's `AuthContext` starts with `user = undefined` (loading), then resolves to a user object or `null` — components must handle the `undefined` state to avoid flashing redirects.

### Role-based access
Two roles: `ADMIN` (Kreisschießwart) and `OBMANN` (Schießobmann). The `requireAdmin` middleware guards admin-only routes. `requireOwnJaegerschaft` lets OBMANNs only touch their own Jägerschaft (ADMINs bypass it). The frontend mirrors this with `<PrivateRoute adminOnly>` in [frontend/src/App.jsx](frontend/src/App.jsx).

### Frontend API calls
All fetch calls go through `apiFetch` in [frontend/src/lib/api.js](frontend/src/lib/api.js). It automatically adds `credentials: 'include'`, serializes the body, and redirects to `/login` on a 401.

### Data model relationships
```
Veranstaltung
  ├── Gruppe[]         (Zeitplan: Stand, Startzeit, Endzeit)
  └── Jaegerschaft[]
        ├── Schuetze[] (Disziplin: BUECHSE/FLINTE/PISTOLE/KOMBINATION, DjvGruppe: A/B/C)
        ├── Helfer[]   (Aufgabe: STANDAUFSICHT/SCHEIBENSETZER/ZEITNAHME_PROTOKOLL)
        └── User[]     (OBMANNs; a User belongs to exactly one Jaegerschaft)
```
`Ergebnis` belongs to `Schuetze` (not to `Jaegerschaft` directly).

### Frontend page structure
Pages are split by role under `frontend/src/pages/`:
- `obmann/` — what a logged-in OBMANN sees (Mannschaft, Zeitplan, Helfer, Ergebnisse)
- `admin/` — admin-only management (Veranstaltung, Gruppen, Jaegerschaften, Benutzer)

## Deployment

Every push to `main` triggers the GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)), which SSHs into the server and runs `docker compose build && docker compose up -d`. ~60 seconds until live.

### Server
- **Hetzner CX22**, Ubuntu 24.04, IP `178.104.156.121`
- **App-Verzeichnis:** `/opt/kruempelmann/jagdscheissen`
- **SSH-Port:** 22 (Standard), Port **8443** hinter Firmenfirewall/Zscaler

### GitHub Actions Secrets (im Repo hinterlegen)
| Secret | Wert |
|--------|------|
| `SERVER_HOST` | `178.104.156.121` |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | Inhalt von `/root/.ssh/github-action` |

### Ersteinrichtung auf dem Server
```bash
cd /opt/kruempelmann
git clone git@github.com:kruphi/jagdscheissen.git
cd jagdscheissen
cp .env.example .env
# .env mit Produktionswerten füllen

# web-Netzwerk existiert bereits durch server-infra/Caddy — nicht neu erstellen
docker compose up -d
```

### Caddy-Konfiguration
Den Inhalt von [caddy-snippet.txt](caddy-snippet.txt) in `/opt/kruempelmann/server-infra/Caddyfile` einfügen, dann:
```bash
cd /opt/kruempelmann/server-infra
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Docker-Netzwerke
Das `web`-Netzwerk ist **external** — es wird von `server-infra`'s Caddy-Compose verwaltet und verbindet alle App-Frontends mit Caddy. Das `internal`-Netzwerk ist app-spezifisch (Backend ↔ DB, nicht von außen erreichbar).
