/**
 * 为 public/images 下的图片生成多档 WebP 变体，供文章图片 srcset 使用。
 *
 * 设计取舍：
 * - 在 astro build 之前运行，产物与源图同目录，Astro 会原样复制到 dist
 * - 变体文件被 .gitignore 忽略，不进仓库
 * - 只处理宽度大于 640px 的图片
 * - 已存在的变体跳过，重复构建不重复压缩
 */
import fs from 'node:fs'
import path from 'node:path'

const PUBLIC_DIR = 'public/images'
const WIDTHS = [640, 960, 1280]
const QUALITY = 76
const VARIANT_RE = /-(640|960|1280)\.webp$/i

let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  console.warn('[image-variants] 未安装 sharp，跳过变体生成')
  process.exit(0)
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(PUBLIC_DIR).filter(
  (file) => /\.(png|jpg|jpeg|webp)$/i.test(file) && !VARIANT_RE.test(file)
)

let created = 0
let skipped = 0
let failed = 0

await Promise.all(
  files.map(async (file) => {
    try {
      const meta = await sharp(file).metadata()
      if (!meta.width || meta.width <= WIDTHS[0]) return

      const base = file.replace(/\.(png|jpg|jpeg|webp)$/i, '')
      for (const width of WIDTHS) {
        if (meta.width < width) continue
        const target = `${base}-${width}.webp`
        if (fs.existsSync(target)) {
          skipped++
          continue
        }
        await sharp(file)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(target)
        created++
      }
    } catch (error) {
      failed++
      console.warn(`[image-variants] 跳过 ${file}: ${error.message}`)
    }
  })
)

console.log(`[image-variants] 生成 ${created} 个，跳过 ${skipped} 个，失败 ${failed} 个`)
