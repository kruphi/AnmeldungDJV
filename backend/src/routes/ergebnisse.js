import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/ergebnisse?jaegerschaftId=X
router.get('/', authenticate, async (req, res) => {
  const jaegerschaftId = parseInt(req.query.jaegerschaftId)
  if (!Number.isInteger(jaegerschaftId)) return res.status(400).json({ error: 'jaegerschaftId muss eine Zahl sein' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const ergebnisse = await prisma.ergebnis.findMany({
    where: { schuetze: { jaegerschaftId } },
    include: { schuetze: { select: { id: true, name: true, disziplin: true } } },
    orderBy: { punkte: 'desc' }
  })
  res.json(ergebnisse)
})

// GET /api/ergebnisse/rangliste?veranstaltungId=X  (Admin: Gesamtrangliste)
router.get('/rangliste', authenticate, requireAdmin, async (req, res) => {
  const veranstaltungId = parseInt(req.query.veranstaltungId)

  const ergebnisse = await prisma.ergebnis.findMany({
    where: { schuetze: { jaegerschaft: { veranstaltungId } } },
    include: {
      schuetze: {
        include: {
          jaegerschaft: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { punkte: 'desc' }
  })
  res.json(ergebnisse)
})

// POST /api/ergebnisse
router.post('/', authenticate, async (req, res) => {
  const { schuetzeId, punkte, disziplin, notizen } = req.body

  const schuetze = await prisma.schuetze.findUnique({ where: { id: schuetzeId } })
  if (!schuetze) return res.status(404).json({ error: 'Schütze nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== schuetze.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const e = await prisma.ergebnis.create({
    data: { schuetzeId, punkte: parseInt(punkte), disziplin, notizen }
  })
  res.status(201).json(e)
})

// DELETE /api/ergebnisse/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.ergebnis.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

export default router
