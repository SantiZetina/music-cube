import https from 'https'

function fetchUrl(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => resolve(res)).on('error', reject)
  })
}

export default async function handler(req, res) {
  const { id } = req.query
  const apiKey = process.env.GOOGLE_API_KEY

  if (!id || !/^[\w-]+$/.test(id)) {
    res.status(400).end('Invalid file ID')
    return
  }

  if (!apiKey) {
    res.status(500).setHeader('Content-Type', 'text/plain').end('GOOGLE_API_KEY not configured')
    return
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Range')
    res.status(204).end()
    return
  }

  try {
    const headers = { 'User-Agent': 'Mozilla/5.0' }
    if (req.headers['range']) headers['Range'] = req.headers['range']

    const upstream = await fetchUrl(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`,
      headers
    )

    res.status(upstream.statusCode)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      if (upstream.headers[h]) res.setHeader(h, upstream.headers[h])
    }
    upstream.pipe(res)
  } catch (e) {
    if (!res.headersSent) res.status(502).end()
  }
}
