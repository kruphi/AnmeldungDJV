import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireOwnJaegerschaft } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/schuetzen?jaegerschaftId=X
router.get('/', authenticate, async (req, res) => {
  const jaegerschaftId = parseInt(req.query.jaegerschaftId)
  if (!jaegerschaftId) return res.status(400).json({ error: 'jaegerschaftId erforderlich' })

  // Obmann darf nur eigene Jägerschaft sehen
  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const schuetzen = await prisma.schuetze.findMany({
    where: { jaegerschaftId },
    include: { ergebnisse: true },
    orderBy: { name: 'asc' }
  })
  res.json(schuetzen)
})

// POST /api/schuetzen
router.post('/', authenticate, async (req, res) => {
  const { name, mitgliedsnummer, disziplin, djvGruppe, jaegerschaftId } = req.body

  // Zugriffsprüfung
  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const s = await prisma.schuetze.create({
    data: { name, mitgliedsnummer, disziplin, djvGruppe, jaegerschaftId }
  })
  res.status(201).json(s)
})

// PATCH /api/schuetzen/:id
router.patch('/:id', authenticate, async (req, res) => {
  const schuetze = await prisma.schuetze.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!schuetze) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== schuetze.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const { name, mitgliedsnummer, disziplin, djvGruppe } = req.body
  const updated = await prisma.schuetze.update({
    where: { id: parseInt(req.params.id) },
    data: { name, mitgliedsnummer, disziplin, djvGruppe }
  })
  res.json(updated)
})

// DELETE /api/schuetzen/:id
router.delete('/:id', authenticate, async (req, res) => {
  const schuetze = await prisma.schuetze.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!schuetze) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== schuetze.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  await prisma.schuetze.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
