import { useState, useEffect } from 'react'
import { apiFetch } from '../../hooks/useApi'

// Benutzer werden direkt über die DB / Seed angelegt oder hier über einen Admin-Endpunkt
// Diese Seite zeigt die vorhandenen Nutzer und ermöglicht Rollenvergabe

export default function BenutzerPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Benutzerverwaltung</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
        Neue Schießobmänner werden per Seed-Script angelegt oder durch einen Admin-API-Endpunkt (<code>/api/admin/users</code>), den du noch ergänzen kannst. Passwörter werden mit bcrypt gehasht.
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Seed-Beispiel (backend/src/seed.js)</h2>
        <pre className="text-xs bg-gray-50 rounded-lg p-4 overflow-auto text-gray-700">{`import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.user.create({
  data: {
    email: 'obmann@hegering-xyz.de',
    passwordHash: await bcrypt.hash('StartPasswort123', 12),
    name: 'Max Mustermann',
    role: 'OBMANN',
    jaegerschaftId: 1,
  }
})`}
        </pre>
      </div>
    </div>
  )
}
