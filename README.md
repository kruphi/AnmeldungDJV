# JagdSchießen

Digitale Anmeldeplattform für jagdliches Schießen nach DJV-Richtlinien.

**Stack:** React 19 · Tailwind 3 · Vite 6 · React Router 7 · Express 4 · Prisma 6 · PostgreSQL 16 · Docker · Caddy

---

## Lokale Entwicklung

```bash
# 1. Repo klonen
git clone git@github.com:kruphi/jagdscheissen.git
cd jagdscheissen

# 2. Umgebungsvariablen
cp .env.example .env
# .env ausfüllen (Passwörter, JWT_SECRET)

# 3. Datenbank starten
docker compose up db -d

# 4. Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
node src/seed.js       # Testdaten anlegen (Datei selbst erstellen, s. BenutzerPage)
npm run dev            # Port 3001

# 5. Frontend (neues Terminal)
cd ../frontend
npm install
npm run dev            # Port 5173
```

---

## Deployment (Produktion)

```bash
# Auf dem Server einmalig einrichten:
cd /opt/kruempelmann
git clone git@github.com:kruphi/jagdscheissen.git
cd jagdscheissen
cp .env.example .env
# .env mit Produktionswerten füllen

docker compose up -d

# Caddy-Snippet in /opt/kruempelmann/server-infra/Caddyfile einfügen
# caddy reload ausführen
```

Danach läuft jeder Push auf `main` automatisch als Deployment via GitHub Actions.

---

## Rollen

| Rolle | Zugriff |
|-------|---------|
| `ADMIN` (Kreisschießwart) | Alles: Veranstaltungen, Gruppen, alle Jägerschaften |
| `OBMANN` (Schießobmann) | Nur eigene Jägerschaft: Schützen, Helfer, Ergebnisse |

---

## Datenmodell (Kurzübersicht)

```
Veranstaltung
  └── Gruppe (Zeitplan: Stand, Start, Ende)
  └── Jägerschaft
        └── Schütze (Name, Mitgliedsnr, Disziplin, DJV-Gruppe)
        └── Helfer  (Aufgabe, Status)
        └── User    (Schießobmann)
```

---

## API-Endpunkte

| Method | Pfad | Zugriff |
|--------|------|---------|
| POST | /api/auth/login | Öffentlich |
| GET | /api/auth/me | Angemeldet |
| GET/POST | /api/veranstaltungen | Admin |
| GET/POST/PATCH/DELETE | /api/gruppen | Admin |
| GET/POST | /api/jaegerschaften | Admin/Obmann |
| GET/POST/PATCH/DELETE | /api/schuetzen | Eigene Jägerschaft |
| GET/POST/PATCH/DELETE | /api/helfer | Eigene Jägerschaft |
| GET/POST | /api/ergebnisse | Eigene Jägerschaft |
