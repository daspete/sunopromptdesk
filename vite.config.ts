import { defineConfig, loadEnv, type Plugin } from 'vite'

const siteMeta = (siteUrl: string): Plugin => ({
  name: 'site-meta',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
  generateBundle() {
    const today = new Date().toISOString().slice(0, 10)
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${siteUrl}/sitemap.xml\n` })
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source:
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>${siteUrl}/imprint.html</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.2</priority></url>\n</urlset>\n` })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  return {
  plugins: [siteMeta(siteUrl)],
  server: {
    host: true, // listen on 0.0.0.0 so the dev server is reachable from outside Docker
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
    // paths are resolved relative to the project root
    rollupOptions: { input: { main: 'index.html', imprint: 'imprint.html' } },
  },
  }
})
