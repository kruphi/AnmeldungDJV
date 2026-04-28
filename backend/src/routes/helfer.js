import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  const jaegerschaftId = parseInt(req.query.jaegerschaftId)
  if (!Number.isInteger(jaegerschaftId)) return res.status(400).json({ error: 'jaegerschaftId muss eine Zahl sein' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const helfer = await prisma.helfer.findMany({
    where: { jaegerschaftId },
    include: { kategorie: true },
    orderBy: { kategorie: { name: 'asc' } },
  })
  res.json(helfer)
})

router.get('/uebersicht', authenticate, requireAdmin, async (req, res) => {
  const veranstaltungId = parseInt(req.query.veranstaltungId)
  const jaegerschaften = await prisma.jaegerschaft.findMany({
    where: { veranstaltungId },
    include: {
      helfer: { include: { kategorie: true } },
      _count: { select: { helfer: true } },
    },
    orderBy: { name: 'asc' },
  })

  const uebersicht = jaegerschaften.map(j => ({
    id: j.id,
    name: j.name,
    helferGesamt: j.helfer.length,
    bestaetigt: j.helfer.filter(h => h.status === 'BESTAETIGT').length,
    ausstehend: j.helfer.filter(h => h.status === 'AUSSTEHEND').length,
    details: j.helfer,
  }))
  res.json(uebersicht)
})

router.post('/', authenticate, async (req, res) => {
  const { name, kategorieId, jaegerschaftId } = req.body

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const h = await prisma.helfer.create({
    data: { name, kategorieId: parseInt(kategorieId), jaegerschaftId },
    include: { kategorie: true },
  })
  res.status(201).json(h)
})

router.patch('/:id', authenticate, async (req, res) => {
  const helfer = await prisma.helfer.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!helfer) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== helfer.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const { name, kategorieId, status } = req.body
  const updated = await prisma.helfer.update({
    where: { id: parseInt(req.params.id) },
    data: {
      ...(name !== undefined && { name }),
      ...(kategorieId !== undefined && { kategorieId: parseInt(kategorieId) }),
      ...(status !== undefined && { status }),
    },
    include: { kategorie: true },
  })
  res.json(updated)
})

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
