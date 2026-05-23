import https from 'https'

function fetchUrl(url, headers, depth = 0) {
  if (depth > 5) return Promise.reject(new Error('Too many redirects'))
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        resolve(fetchUrl(res.headers.location, headers, depth + 1))
      } else {
        resolve(res)
      }
    }).on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Range')
    res.statusCode = 204
    res.end()
    return
  }

  const { fileId } = req.query
  if (!fileId || !/^[\w-]+$/.test(fileId)) { res.statusCode = 400; res.end(); return }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) { res.statusCode = 500; res.end('GOOGLE_API_KEY not configured'); return }

  try {
    const headers = { 'User-Agent': 'Mozilla/5.0' }
    if (req.headers['range']) headers['Range'] = req.headers['range']

    const upstream = await fetchUrl(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`,
      headers
    )

    res.statusCode = upstream.statusCode
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      if (upstream.headers[h]) res.setHeader(h, upstream.headers[h])
    }
    upstream.pipe(res)
  } catch (e) {
    console.error('[drive-proxy]', e.message)
    if (!res.headersSent) { res.statusCode = 502; res.end() }
  }
}
