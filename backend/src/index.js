import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import veranstaltungRoutes from './routes/veranstaltungen.js'
import jaegerschaftRoutes from './routes/jaegerschaften.js'
import schuetzeRoutes from './routes/schuetzen.js'
import gruppeRoutes from './routes/gruppen.js'
import helferRoutes from './routes/helfer.js'
import ergebnisRoutes from './routes/ergebnisse.js'

const app = express()
const PORT = process.env.PORT || 3001

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet())
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}))

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/veranstaltungen', veranstaltungRoutes)
app.use('/api/jaegerschaften', jaegerschaftRoutes)
app.use('/api/schuetzen', schuetzeRoutes)
app.use('/api/gruppen', gruppeRoutes)
app.use('/api/helfer', helferRoutes)
app.use('/api/ergebnisse', ergebnisRoutes)

// ─── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || 'Interner Serverfehler'
  })
})

app.listen(PORT, () => console.log(`Backend läuft auf Port ${PORT}`))
