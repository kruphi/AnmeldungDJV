import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/veranstaltungen
router.get('/', authenticate, async (req, res) => {
  const veranstaltungen = await prisma.veranstaltung.findMany({
    orderBy: { datum: 'desc' },
    include: {
      gruppen: { orderBy: { startzeit: 'asc' } },
      jaegerschaften: {
        include: {
          gruppe: true,
          _count: { select: { schuetzen: true, helfer: true } }
        }
      }
    }
  })
  res.json(veranstaltungen)
})

// GET /api/veranstaltungen/:id
router.get('/:id', authenticate, async (req, res) => {
  const v = await prisma.veranstaltung.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      gruppen: { orderBy: { startzeit: 'asc' } },
      jaegerschaften: {
        include: {
          gruppe: true,
          obmaenner: { select: { id: true, name: true, email: true } },
          _count: { select: { schuetzen: true, helfer: true } }
        }
      }
    }
  })
  if (!v) return res.status(404).json({ error: 'Nicht gefunden' })
  res.json(v)
})

// POST /api/veranstaltungen  (nur Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, datum, ort, beschreibung } = req.body
  const v = await prisma.veranstaltung.create({
    data: { name, datum: new Date(datum), ort, beschreibung }
  })
  res.status(201).json(v)
})

// PATCH /api/veranstaltungen/:id  (nur Admin)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, datum, ort, beschreibung, status } = req.body
  const v = await prisma.veranstaltung.update({
    where: { id: parseInt(req.params.id) },
    data: { name, datum: datum ? new Date(datum) : undefined, ort, beschreibung, status }
  })
  res.json(v)
})

// DELETE /api/veranstaltungen/:id  (nur Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.veranstaltung.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
