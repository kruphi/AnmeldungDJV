import 'express-async-errors'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import setupRoutes from './routes/setup.js'
import userRoutes from './routes/users.js'
import veranstaltungRoutes from './routes/veranstaltungen.js'
import jaegerschaftRoutes from './routes/jaegerschaften.js'
import schuetzeRoutes from './routes/schuetzen.js'
import gruppeRoutes from './routes/gruppen.js'
import helferRoutes from './routes/helfer.js'
import ergebnisRoutes from './routes/ergebnisse.js'
import mannschaftRoutes from './routes/mannschaften.js'
import mannschaftKategorienRoutes from './routes/mannschaft-kategorien.js'
import helferKategorienRoutes from './routes/helfer-kategorien.js'

// ─── Startup-Guard ──────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET fehlt oder zu kurz (mindestens 32 Zeichen). Generieren mit: openssl rand -hex 32')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3001

// ─── CORS muss vor Rate-Limitern stehen, damit 429-Responses CORS-Header tragen ─
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet())

// Nur Login gegen Brute-Force absichern. Ein allgemeiner Limiter funktioniert
// hinter Nginx/Docker nicht sinnvoll, weil alle Requests von derselben
// internen Docker-IP kommen und sich einen einzigen Bucket teilen würden.
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anmeldeversuche. Bitte 15 Minuten warten.' },
}))

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/setup', setupRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/veranstaltungen', veranstaltungRoutes)
app.use('/api/jaegerschaften', jaegerschaftRoutes)
app.use('/api/schuetzen', schuetzeRoutes)
app.use('/api/gruppen', gruppeRoutes)
app.use('/api/helfer', helferRoutes)
app.use('/api/ergebnisse', ergebnisRoutes)
app.use('/api/mannschaften', mannschaftRoutes)
app.use('/api/mannschaft-kategorien', mannschaftKategorienRoutes)
app.use('/api/helfer-kategorien', helferKategorienRoutes)

// ─── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  // Prisma-Fehler (P-Codes) und ungefangene Exceptions nicht nach außen leaken
  const isPrismaError = err.code?.startsWith('P')
  const isKnownError = err.status && !isPrismaError
  res.status(err.status || 500).json({
    error: isKnownError ? err.message : 'Interner Serverfehler',
  })
})

app.listen(PORT, () => console.log(`Backend läuft auf Port ${PORT}`))
