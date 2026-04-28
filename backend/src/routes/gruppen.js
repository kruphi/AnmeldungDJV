import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

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
  const parsedStart = new Date(startzeit)
  const parsedEnd = new Date(endzeit)
  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    return res.status(400).json({ error: 'Ungültige Zeitangaben' })
  }
  const g = await prisma.gruppe.create({
    data: { name, stand, startzeit: parsedStart, endzeit: parsedEnd, veranstaltungId }
  })
  res.status(201).json(g)
})

// PATCH /api/gruppen/:id  (nur Admin)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, stand, startzeit, endzeit } = req.body
  let parsedStart, parsedEnd
  if (startzeit) {
    parsedStart = new Date(startzeit)
    if (isNaN(parsedStart.getTime())) return res.status(400).json({ error: 'Ungültige Startzeit' })
  }
  if (endzeit) {
    parsedEnd = new Date(endzeit)
    if (isNaN(parsedEnd.getTime())) return res.status(400).json({ error: 'Ungültige Endzeit' })
  }
  const g = await prisma.gruppe.update({
    where: { id: parseInt(req.params.id) },
    data: { name, stand, startzeit: parsedStart, endzeit: parsedEnd }
  })
  res.json(g)
})

// PATCH /api/gruppen/:id/zuweisung  (Jägerschaft zu Gruppe zuweisen)
router.patch('/:id/zuweisung', authenticate, requireAdmin, async (req, res) => {
  const gruppeId = parseInt(req.params.id)
  const { jaegerschaftId } = req.body

  const [gruppe, jaegerschaft] = await Promise.all([
    prisma.gruppe.findUnique({ where: { id: gruppeId } }),
    prisma.jaegerschaft.findUnique({ where: { id: jaegerschaftId } }),
  ])
  if (!gruppe) return res.status(404).json({ error: 'Gruppe nicht gefunden' })
  if (!jaegerschaft) return res.status(404).json({ error: 'Jägerschaft nicht gefunden' })
  if (gruppe.veranstaltungId !== jaegerschaft.veranstaltungId) {
    return res.status(400).json({ error: 'Gruppe und Jägerschaft gehören nicht zur selben Veranstaltung' })
  }

  const j = await prisma.jaegerschaft.update({
    where: { id: jaegerschaftId },
    data: { gruppeId }
  })
  res.json(j)
})

// DELETE /api/gruppen/:id  (nur Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.gruppe.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
