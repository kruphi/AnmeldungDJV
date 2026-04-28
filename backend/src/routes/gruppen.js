// routes/gruppen.js
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/gruppen?veranstaltungId=X
router.get('/', authenticate, async (req, res) => {
  const veranstaltungId = parseInt(req.query.veranstaltungId)
  const gruppen = await prisma.gruppe.findMany({
    where: { veranstaltungId },
    include: {
      jaegerschaften: {
        select: { id: true, name: true }
      }
    },
    orderBy: { startzeit: 'asc' }
  })
  res.json(gruppen)
})

// POST /api/gruppen  (nur Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, stand, startzeit, endzeit, veranstaltungId } = req.body
  const g = await prisma.gruppe.create({
    data: { name, stand, startzeit: new Date(startzeit), endzeit: new Date(endzeit), veranstaltungId }
  })
  res.status(201).json(g)
})

// PATCH /api/gruppen/:id  (nur Admin)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, stand, startzeit, endzeit } = req.body
  const g = await prisma.gruppe.update({
    where: { id: parseInt(req.params.id) },
    data: {
      name, stand,
      startzeit: startzeit ? new Date(startzeit) : undefined,
      endzeit: endzeit ? new Date(endzeit) : undefined
    }
  })
  res.json(g)
})

// PATCH /api/gruppen/:id/zuweisung  (Jägerschaft zu Gruppe zuweisen)
router.patch('/:id/zuweisung', authenticate, requireAdmin, async (req, res) => {
  const { jaegerschaftId } = req.body
  const j = await prisma.jaegerschaft.update({
    where: { id: jaegerschaftId },
    data: { gruppeId: parseInt(req.params.id) }
  })
  res.json(j)
})

// DELETE /api/gruppen/:id  (nur Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.gruppe.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
