export async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401) {
    window.location.href = '/login'
    return
  }

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json()
    : { error: await res.text() }

  if (!res.ok) throw new Error(data.error || 'Fehler')
  return data
}
