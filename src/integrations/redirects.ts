import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'
import { parse as parseYaml } from 'yaml'

import { normalizeSlug, SLUG_PATTERN } from '../utils/slug'

type Redirect = {
  source: string
  target: string
  from: string
}

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(full) : [full]
    })
}

function readFrontmatter(file: string): Record<string, unknown> {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  if (!raw.startsWith('---')) return {}

  const end = raw.indexOf('\n---', 3)
  if (end === -1) return {}

  try {
    const data = parseYaml(raw.slice(3, end))
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`${file} 的 frontmatter 无法解析：${reason}`)
  }
}

/**
 * 旧链接允许三种写法，都会被统一成路径：
 * - 123
 * - /123
 * - https://doc.gezhibuge.com/123
 */
function normalizeRedirectSource(value: string): string {
  const withoutHost = value
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
  return normalizeSlug(withoutHost)
}

function collectRedirects(contentDir: string): Redirect[] {
  const files = walk(contentDir).filter((file) => /\.(md|mdx)$/.test(file))
  const articles = files.map((file) => {
    const data = readFrontmatter(file)
    const relative = path
      .relative(contentDir, file)
      .replace(/\\/g, '/')
      .replace(/\.(md|mdx)$/, '')
    const rawSlug = typeof data.slug === 'string' ? data.slug : relative
    const slug = normalizeSlug(rawSlug)
    const sources = Array.isArray(data.redirectFrom)
      ? data.redirectFrom.filter((item): item is string => typeof item === 'string')
      : []

    return { file, slug, sources, href: `/${slug}` }
  })

  const slugSet = new Set(articles.map((article) => article.slug))
  const redirects = new Map<string, Redirect>()

  for (const article of articles) {
    for (const rawSource of article.sources) {
      const source = normalizeRedirectSource(rawSource)
      if (!source) continue
      if (source === article.slug) continue

      if (!SLUG_PATTERN.test(source)) {
        throw new Error(
          `${path.basename(article.file)} 的旧链接“${rawSource}”格式不正确。只填路径即可，例如 123、update/123，不要带查询参数或锚点。`
        )
      }

      if (slugSet.has(source)) {
        throw new Error(
          `${path.basename(article.file)} 的旧链接“${source}”已经被另一篇文章使用，不能同时作为重定向来源。`
        )
      }

      const existing = redirects.get(source)
      if (existing && existing.target !== article.href) {
        throw new Error(
          `旧链接“${source}”同时指向 ${existing.target} 和 ${article.href}，请只保留其中一处。`
        )
      }

      redirects.set(source, {
        source,
        target: article.href,
        from: path.relative(contentDir, article.file).replace(/\\/g, '/')
      })
    }
  }

  return [...redirects.values()]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderRedirectPage(redirect: Redirect, site: URL): string {
  const target = new URL(redirect.target, site)
  const location = escapeHtml(target.href)
  const label = escapeHtml(redirect.target)

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <meta http-equiv="refresh" content="0; url=${label}" />
    <link rel="canonical" href="${location}" />
    <title>页面已移动</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        display: flex;
        min-height: 100vh;
        margin: 0;
        align-items: center;
        justify-content: center;
        background: #fcfcfd;
        color: #111318;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        body { background: #0b0b10; color: #fafafa; }
      }
      main { max-width: 28rem; padding: 2rem; text-align: center; }
      h1 { margin: 0 0 0.75rem; font-size: 1.15rem; font-weight: 500; }
      p { margin: 0 0 1rem; color: #6b7280; font-size: 0.9rem; line-height: 1.7; }
      a { color: #51809a; }
    </style>
  </head>
  <body>
    <main>
      <h1>这篇文章已经换了地址</h1>
      <p>正在跳转到新的链接，如果没有自动跳转，请点击下面的地址。</p>
      <a href="${label}">${label}</a>
    </main>
    <script>
      window.location.replace(${JSON.stringify(target.href)} + window.location.search + window.location.hash)
    </script>
  </body>
</html>
`
}

/**
 * 生成旧链接跳转页和 Cloudflare `_redirects`。
 *
 * - 跳转页是纯静态 HTML，不参与 Pagefind 索引，也不会进入 sitemap。
 * - Cloudflare Pages 会优先按 `_redirects` 返回 301，比 meta refresh 更快。
 */
export default function redirectsIntegration(): AstroIntegration {
  const contentDir = fileURLToPath(new URL('../content/blog', import.meta.url))
  let site = new URL('https://doc.gezhibuge.com')

  return {
    name: 'docs-redirects',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (config.site) site = new URL(config.site)
      },
      // 先校验一次，旧链接冲突时在构建一开始就报错，不必等整站编译完。
      'astro:build:start': () => {
        collectRedirects(contentDir)
      },
      'astro:build:done': ({ dir, logger }) => {
        const redirects = collectRedirects(contentDir)
        if (!redirects.length) return

        const outDir = fileURLToPath(dir)

        for (const redirect of redirects) {
          const filePath = path.join(outDir, `${redirect.source}.html`)
          fs.mkdirSync(path.dirname(filePath), { recursive: true })
          fs.writeFileSync(filePath, renderRedirectPage(redirect, site), 'utf8')
          logger.info(`重定向 /${redirect.source} → ${redirect.target}`)
        }

        // Cloudflare Pages 的 301 规则；本地静态预览仍然使用上面的 HTML。
        const rules = [
          '# 由“旧链接”字段自动生成，请勿手动编辑',
          ...redirects.map((redirect) => `/${redirect.source} ${redirect.target} 301`)
        ]
        fs.writeFileSync(path.join(outDir, '_redirects'), `${rules.join('\n')}\n`, 'utf8')

        logger.info(`已生成 ${redirects.length} 条旧链接跳转`)
      }
    }
  }
}
