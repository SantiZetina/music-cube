import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'

function fetchUrl(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      resolve(res)
    }).on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.GOOGLE_API_KEY

  if (!apiKey) {
    console.warn('[drive-proxy] WARNING: GOOGLE_API_KEY not set in .env — audio will not load')
  } else {
    console.log('[drive-proxy] API key loaded OK')
  }

  return {
    plugins: [
      react(),
      {
        name: 'drive-proxy',
        configureServer(server) {
          server.middlewares.use('/api/drive-proxy', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Access-Control-Allow-Headers', 'Range')
              res.statusCode = 204
              res.end()
              return
            }

            const fileId = req.url.slice(1).split('?')[0]
            if (!fileId) { res.statusCode = 400; res.end(); return }

            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'text/plain')
              res.end('GOOGLE_API_KEY not set in .env')
              return
            }

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
          })
        }
      }
    ]
  }
})
