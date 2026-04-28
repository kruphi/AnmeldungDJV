import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  if (req.user.role === 'ADMIN' && !req.query.jaegerschaftId) {
    const schuetzen = await prisma.schuetze.findMany({
      include: {
        jaegerschaft: { select: { id: true, name: true } },
        ergebnisse: true,
        mannschaft: { include: { mannschaft: { select: { id: true, name: true } } } },
      },
      orderBy: [{ jaegerschaft: { name: 'asc' } }, { nachname: 'asc' }],
    })
    return res.json(schuetzen)
  }

  const jaegerschaftId = parseInt(req.query.jaegerschaftId)
  if (!Number.isInteger(jaegerschaftId)) return res.status(400).json({ error: 'jaegerschaftId muss eine Zahl sein' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const schuetzen = await prisma.schuetze.findMany({
    where: { jaegerschaftId },
    include: {
      ergebnisse: true,
      mannschaft: { include: { mannschaft: { select: { id: true, name: true } } } },
    },
    orderBy: { nachname: 'asc' },
  })
  res.json(schuetzen)
})

router.post('/', authenticate, async (req, res) => {
  const { vorname, nachname, jahrgang, jungjaeger, jungjaegerSeit, dame, nadel, jaegerschaftId } = req.body

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const s = await prisma.schuetze.create({
    data: {
      vorname,
      nachname,
      jahrgang: jahrgang ? parseInt(jahrgang) : null,
      jungjaeger: !!jungjaeger,
      jungjaegerSeit: jungjaegerSeit ? parseInt(jungjaegerSeit) : null,
      dame: !!dame,
      nadel: nadel || null,
      jaegerschaftId,
    }
  })
  res.status(201).json(s)
})

router.patch('/:id', authenticate, async (req, res) => {
  const schuetze = await prisma.schuetze.findUnique({ where: { id: parseInt(req.params.id) } })
  if (!schuetze) return res.status(404).json({ error: 'Nicht gefunden' })

  if (req.user.role !== 'ADMIN' && req.user.jaegerschaftId !== schuetze.jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }

  const { vorname, nachname, jahrgang, jungjaeger, jungjaegerSeit, dame, nadel } = req.body
  const updated = await prisma.schuetze.update({
    where: { id: parseInt(req.params.id) },
    data: {
      vorname,
      nachname,
      jahrgang: jahrgang ? parseInt(jahrgang) : null,
      jungjaeger: !!jungjaeger,
      jungjaegerSeit: jungjaegerSeit ? parseInt(jungjaegerSeit) : null,
      dame: !!dame,
      nadel: nadel || null,
    }
  })
  res.json(updated)
})

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
