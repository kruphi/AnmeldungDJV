import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/jaegerschaften?veranstaltungId=X
// Admin ohne veranstaltungId: alle Jägerschaften
router.get('/', authenticate, async (req, res) => {
  const veranstaltungId = req.query.veranstaltungId ? parseInt(req.query.veranstaltungId) : undefined

  let where = {}
  if (veranstaltungId) {
    where.veranstaltungId = veranstaltungId
  }
  if (req.user.role !== 'ADMIN') {
    where.id = req.user.jaegerschaftId
    if (veranstaltungId) where.veranstaltungId = veranstaltungId
  }

  const jaegerschaften = await prisma.jaegerschaft.findMany({
    where,
    include: {
      gruppe: true,
      obmaenner: { select: { id: true, name: true, email: true } },
      _count: { select: { schuetzen: true, helfer: true } }
    },
    orderBy: { name: 'asc' }
  })
  res.json(jaegerschaften)
})

// GET /api/jaegerschaften/:id
router.get('/:id', authenticate, async (req, res) => {
  const id = parseInt(req.params.id)

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== id) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const j = await prisma.jaegerschaft.findUnique({
    where: { id },
    include: {
      gruppe: true,
      obmaenner: { select: { id: true, name: true, email: true } },
      schuetzen: { include: { ergebnisse: true }, orderBy: { name: 'asc' } },
      helfer: { orderBy: { aufgabe: 'asc' } }
    }
  })
  if (!j) return res.status(404).json({ error: 'Nicht gefunden' })
  res.json(j)
})

// POST /api/jaegerschaften  (nur Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, veranstaltungId, gruppeId } = req.body
  const j = await prisma.jaegerschaft.create({
    data: { name, veranstaltungId, gruppeId }
  })
  res.status(201).json(j)
})

// DELETE /api/jaegerschaften/:id  (nur Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.jaegerschaft.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
