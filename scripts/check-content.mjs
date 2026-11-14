import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contentRoot = path.join(root, 'src/content/blog')
const publicRoot = path.join(root, 'public')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(contentRoot).filter((file) => /\.(md|mdx)$/.test(file))
const failures = []

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  let inFence = false
  let fenceMarker = ''

  lines.forEach((line, index) => {
    const fence = line.match(/^\s*(`{3,})/)
    if (fence) {
      if (!inFence) {
        inFence = true
        fenceMarker = fence[1]
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false
        fenceMarker = ''
      }
      return
    }

    if (inFence) return

    const refs = []
    for (const match of line.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)) refs.push(match[1])
    for (const match of line.matchAll(/<(?:img|a|Download)\b[^>]*\b(?:src|href)=['"](\/[^'"]+)/g))
      refs.push(match[1])

    for (const raw of refs) {
      const clean = raw.split(/[?#]/)[0]
      if (!clean.startsWith('/images/') && !clean.startsWith('/files/')) continue
      const diskPath = path.join(publicRoot, clean.replace(/^\//, ''))
      if (!fs.existsSync(diskPath)) {
        failures.push(`${path.relative(root, file)}:${index + 1} 找不到 ${clean}`)
      }
    }
  })
}

if (failures.length) {
  console.error('站内资源检查失败：')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`站内资源检查通过：${files.length} 篇文章`)
