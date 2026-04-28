import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/users — alle Benutzer (nur Admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, email: true, role: true,
      jaegerschaft: { select: { id: true, name: true } },
      createdAt: true,
    },
  })
  res.json(users)
})

// POST /api/users — neuen Benutzer anlegen (nur Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, email, password, role, jaegerschaftId } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, E-Mail und Passwort erforderlich' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'E-Mail bereits vergeben' })

  const VALID_ROLES = ['ADMIN', 'OBMANN']
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Ungültige Rolle. Erlaubt: ADMIN, OBMANN' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name, email, passwordHash,
      role: role || 'OBMANN',
      jaegerschaftId: jaegerschaftId || null,
    },
    select: {
      id: true, name: true, email: true, role: true,
      jaegerschaft: { select: { id: true, name: true } },
      createdAt: true,
    },
  })
  res.status(201).json(user)
})

// PATCH /api/users/:id — Benutzer bearbeiten (nur Admin)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, email, password, role, jaegerschaftId } = req.body

  const VALID_ROLES = ['ADMIN', 'OBMANN']
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Ungültige Rolle. Erlaubt: ADMIN, OBMANN' })
  }

  const data = {}
  if (name) data.name = name
  if (email) data.email = email
  if (role) data.role = role
  if ('jaegerschaftId' in req.body) data.jaegerschaftId = jaegerschaftId || null
  if (password) {
    if (password.length < 8) return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' })
    data.passwordHash = await bcrypt.hash(password, 12)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      jaegerschaft: { select: { id: true, name: true } },
      createdAt: true,
    },
  })
  res.json(user)
})

// DELETE /api/users/:id — Benutzer löschen (nur Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  // Letzten Admin nicht löschen
  const user = await prisma.user.findUnique({ where: { id } })
  if (user?.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) return res.status(400).json({ error: 'Der letzte Admin kann nicht gelöscht werden' })
  }
  await prisma.user.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
