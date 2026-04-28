import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET — alle Kategorien (alle eingeloggten User dürfen lesen, für Dropdown)
router.get('/', authenticate, async (req, res) => {
  const kategorien = await prisma.mannschaftKategorie.findMany({
    orderBy: { name: 'asc' },
  })
  res.json(kategorien)
})

// POST — neue Kategorie anlegen (nur Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, nurBSchuetzen } = req.body
  const k = await prisma.mannschaftKategorie.create({
    data: { name, nurBSchuetzen: !!nurBSchuetzen },
  })
  res.status(201).json(k)
})

// PATCH — Kategorie bearbeiten (nur Admin)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, nurBSchuetzen } = req.body
  const updated = await prisma.mannschaftKategorie.update({
    where: { id },
    data: { name, nurBSchuetzen: !!nurBSchuetzen },
  })
  res.json(updated)
})

// DELETE — Kategorie löschen (nur Admin, schlägt fehl wenn noch Mannschaften zugeordnet)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  const inUse = await prisma.mannschaft.count({ where: { kategorieId: id } })
  if (inUse > 0) {
    return res.status(409).json({ error: `Diese Kategorie wird noch von ${inUse} Mannschaft(en) verwendet.` })
  }
  await prisma.mannschaftKategorie.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
