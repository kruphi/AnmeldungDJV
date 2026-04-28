import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'

const router = Router()

// GET /api/setup/status — prüft ob bereits ein User existiert
router.get('/status', async (req, res) => {
  const count = await prisma.user.count()
  res.json({ setupRequired: count === 0 })
})

// POST /api/setup — legt den ersten Admin-User an (nur wenn noch kein User existiert)
router.post('/', async (req, res) => {
  const count = await prisma.user.count()
  if (count > 0) {
    return res.status(409).json({ error: 'Setup bereits abgeschlossen' })
  }

  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, E-Mail und Passwort erforderlich' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    })
    res.status(201).json(user)
  } catch (err) {
    // Race Condition: zwei gleichzeitige Setup-Requests — Unique-Constraint schlägt an
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Setup bereits abgeschlossen' })
    }
    throw err
  }
})

export default router
