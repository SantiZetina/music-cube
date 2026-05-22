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

function readText(res) {
  return new Promise(resolve => {
    let body = ''
    res.setEncoding('utf8')
    res.on('data', c => body += c)
    res.on('end', () => resolve(body))
  })
}

async function getDriveStream(fileId, rangeHeader) {
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

  const res0 = await fetchUrl(
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
    { 'User-Agent': UA }
  )

  const isHtml = (res0.headers['content-type'] || '').includes('text/html')
  if (!isHtml) {
    res0.resume()
    return fetchUrl(
      `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
      { 'User-Agent': UA, ...(rangeHeader ? { Range: rangeHeader } : {}) }
    )
  }

  const cookies = (res0.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')
  const html = await readText(res0)

  const uuidMatch = html.match(/[?&]uuid=([^&"'\s]+)/)
  const uuid = uuidMatch ? uuidMatch[1] : ''

  const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t${uuid ? `&uuid=${uuid}` : ''}`
  return fetchUrl(downloadUrl, {
    'User-Agent': UA,
    ...(cookies ? { Cookie: cookies } : {}),
    ...(rangeHeader ? { Range: rangeHeader } : {}),
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
  if (!fileId) { res.statusCode = 400; res.end(); return }

  try {
    const upstream = await getDriveStream(fileId, req.headers['range'])
    if (!upstream) { res.statusCode = 502; res.end(); return }

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
