import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' })

  const user = await prisma.user.findUnique({
    where: { email },
    include: { jaegerschaft: { select: { id: true, name: true } } }
  })
  if (!user) return res.status(401).json({ error: 'Ungültige Anmeldedaten' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Ungültige Anmeldedaten' })

  const token = jwt.sign(
    { id: user.id, role: user.role, jaegerschaftId: user.jaegerschaftId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('token', token, COOKIE_OPTIONS)
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    jaegerschaft: user.jaegerschaft,
  })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS)
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      jaegerschaft: { select: { id: true, name: true } }
    }
  })
  if (!user) return res.status(401).json({ error: 'Benutzer nicht gefunden' })
  res.json(user)
})
