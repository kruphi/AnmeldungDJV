import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  const kategorien = await prisma.helferKategorie.findMany({ orderBy: { name: 'asc' } })
  res.json(kategorien)
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const k = await prisma.helferKategorie.create({ data: { name: req.body.name } })
  res.status(201).json(k)
})

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const updated = await prisma.helferKategorie.update({
    where: { id: parseInt(req.params.id) },
    data: { name: req.body.name },
  })
  res.json(updated)
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  const inUse = await prisma.helfer.count({ where: { kategorieId: id } })
  if (inUse > 0) {
    return res.status(409).json({ error: `Diese Kategorie wird noch von ${inUse} Helfer(n) verwendet.` })
  }
  await prisma.helferKategorie.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
