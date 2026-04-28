import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Nicht angemeldet' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Ungültige Sitzung' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Nur für Kreisschießwart' })
  }
  next()
}

// Schießobmann darf nur seine eigene Jägerschaft bearbeiten
export function requireOwnJaegerschaft(req, res, next) {
  if (req.user?.role === 'ADMIN') return next()

  const jaegerschaftId = parseInt(req.params.jaegerschaftId || req.body.jaegerschaftId)
  if (req.user?.jaegerschaftId !== jaegerschaftId) {
    return res.status(403).json({ error: 'Kein Zugriff auf diese Jägerschaft' })
  }
  next()
}
