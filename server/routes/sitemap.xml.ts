import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const pages = [
    { loc: 'https://cleand.laundry/', lastmod: '2026-06-03', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://cleand.laundry/orders', lastmod: '2026-06-03', changefreq: 'daily', priority: '0.8' },
    { loc: 'https://cleand.laundry/history', lastmod: '2026-06-03', changefreq: 'weekly', priority: '0.6' },
    { loc: 'https://cleand.laundry/customers', lastmod: '2026-06-03', changefreq: 'weekly', priority: '0.6' },
    { loc: 'https://cleand.laundry/reports', lastmod: '2026-06-03', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://cleand.laundry/expenses', lastmod: '2026-06-03', changefreq: 'daily', priority: '0.7' },
    { loc: 'https://cleand.laundry/blog', lastmod: '2026-06-03', changefreq: 'weekly', priority: '0.8' }
  ]

  // Add dummy dynamic blog entries to demonstrate dynamic URL parsing
  const dynamicBlogs = [
    '5-laundry-hacks-for-stubborn-stains',
    'how-to-optimize-laundry-shop-overhead-expenses',
    'difference-between-steam-ironing-and-washing'
  ]

  dynamicBlogs.forEach(slug => {
    pages.push({
      loc: `https://cleand.laundry/blog/${slug}`,
      lastmod: '2026-06-03',
      changefreq: 'monthly',
      priority: '0.5'
    })
  })

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  pages.forEach(p => {
    xml += '  <url>\n'
    xml += `    <loc>${p.loc}</loc>\n`
    xml += `    <lastmod>${p.lastmod}</lastmod>\n`
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`
    xml += `    <priority>${p.priority}</priority>\n`
    xml += '  </url>\n'
  })

  xml += '</urlset>'

  // Set header to XML
  event.node.res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  return xml
})
