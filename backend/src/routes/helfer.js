import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/helfer?jaegerschaftId=X  — alle Helfer einer Jägerschaft
router.get('/', authenticate, async (req, res) => {
  const jaegerschaftId = parseInt(req.query.jaegerschaftId)
  if (!Number.isInteger(jaegerschaftId)) return res.status(400).json({ error: 'jaegerschaftId muss eine Zahl sein' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const helfer = await prisma.helfer.findMany({
    where: { jaegerschaftId },
    orderBy: { aufgabe: 'asc' }
  })
  res.json(helfer)
})

// GET /api/helfer/uebersicht?veranstaltungId=X  — Admin: alle Jägerschaften
router.get('/uebersicht', authenticate, requireAdmin, async (req, res) => {
  const veranstaltungId = parseInt(req.query.veranstaltungId)
  const jaegerschaften = await prisma.jaegerschaft.findMany({
    where: { veranstaltungId },
    include: {
      helfer: true,
      _count: { select: { helfer: true } }
    },
    orderBy: { name: 'asc' }
  })

  const uebersicht = jaegerschaften.map(j => ({
    id: j.id,
    name: j.name,
    helferGesamt: j.helfer.length,
    bestaetigt: j.helfer.filter(h => h.status === 'BESTAETIGT').length,
    ausstehend: j.helfer.filter(h => h.status === 'AUSSTEHEND').length,
    details: j.helfer
  }))

  res.json(uebersicht)
})

// POST /api/helfer
router.post('/', authenticate, async (req, res) => {
  const { name, aufgabe, jaegerschaftId } = req.body

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const h = await prisma.helfer.create({
    data: { name, aufgabe, jaegerschaftId }
  })
  res.status(201).json(h)
})

// PATCH /api/helfer/:id  (Status ändern)
router.patch('/:id', authenticate, async (req, res) => {
  const helfer = await prisma.helfer.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!helfer) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== helfer.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const { name, aufgabe, status } = req.body
  const updated = await prisma.helfer.update({
    where: { id: parseInt(req.params.id) },
    data: { name, aufgabe, status }
  })
  res.json(updated)
})

// DELETE /api/helfer/:id
router.delete('/:id', authenticate, async (req, res) => {
  const helfer = await prisma.helfer.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!helfer) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== helfer.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  await prisma.helfer.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
