import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const isASchuetze = (s) => s.nadel === 'GOLD' || s.nadel === 'SONDERGOLD'

const include = {
  kategorie: true,
  schuetzen: {
    include: { schuetze: true },
    orderBy: { position: 'asc' },
  },
}

router.get('/', authenticate, async (req, res) => {
  if (req.user.role === 'ADMIN' && !req.query.jaegerschaftId) {
    const mannschaften = await prisma.mannschaft.findMany({
      include: { ...include, jaegerschaft: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })
    return res.json(mannschaften)
  }

  const jaegerschaftId = parseInt(req.query.jaegerschaftId)
  if (!Number.isInteger(jaegerschaftId)) return res.status(400).json({ error: 'jaegerschaftId muss eine Zahl sein' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const mannschaften = await prisma.mannschaft.findMany({
    where: { jaegerschaftId },
    include,
    orderBy: { name: 'asc' },
  })
  res.json(mannschaften)
})

router.post('/', authenticate, async (req, res) => {
  const { name, kategorieId, jaegerschaftId } = req.body

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const m = await prisma.mannschaft.create({
    data: { name, kategorieId: parseInt(kategorieId), jaegerschaftId },
    include,
  })
  res.status(201).json(m)
})

router.patch('/:id', authenticate, async (req, res) => {
  const mannschaft = await prisma.mannschaft.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!mannschaft) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== mannschaft.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const { name, kategorieId } = req.body
  const updated = await prisma.mannschaft.update({
    where: { id: parseInt(req.params.id) },
    data: { name, kategorieId: parseInt(kategorieId) },
    include,
  })
  res.json(updated)
})

router.delete('/:id', authenticate, async (req, res) => {
  const mannschaft = await prisma.mannschaft.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!mannschaft) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== mannschaft.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  await prisma.mannschaft.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

// POST /:id/schuetzen — Schütze hinzufügen (mit A/B-Validierung via Kategorie)
router.post('/:id/schuetzen', authenticate, async (req, res) => {
  const mannschaftId = parseInt(req.params.id)
  const mannschaft = await prisma.mannschaft.findUnique({
    where: { id: mannschaftId },
    include: { kategorie: true },
  })
  if (!mannschaft) return res.status(404).json({ error: 'Mannschaft nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== mannschaft.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const schuetzeId = parseInt(req.body.schuetzeId)
  const schuetze = await prisma.schuetze.findUnique({ where: { id: schuetzeId } })
  if (!schuetze) return res.status(404).json({ error: 'Schütze nicht gefunden' })

  if (mannschaft.kategorie.nurBSchuetzen && isASchuetze(schuetze)) {
    return res.status(422).json({
      error: `A-Schützen (Gold/SonderGold) können nicht in eine "${mannschaft.kategorie.name}" eingetragen werden.`
    })
  }

  const count = await prisma.mannschaftSchuetze.count({ where: { mannschaftId } })

  const entry = await prisma.mannschaftSchuetze.create({
    data: { mannschaftId, schuetzeId, position: count },
  })
  res.status(201).json(entry)
})

// DELETE /:id/schuetzen/:schuetzeId — Schütze entfernen
router.delete('/:id/schuetzen/:schuetzeId', authenticate, async (req, res) => {
  const mannschaftId = parseInt(req.params.id)
  const mannschaft = await prisma.mannschaft.findUnique({ where: { id: mannschaftId } })
  if (!mannschaft) return res.status(404).json({ error: 'Mannschaft nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== mannschaft.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  await prisma.mannschaftSchuetze.deleteMany({
    where: { mannschaftId, schuetzeId: parseInt(req.params.schuetzeId) },
  })
  res.json({ ok: true })
})

export default router
