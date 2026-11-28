import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'
import { visit } from 'unist-util-visit'

type ImageSize = { width: number; height: number }

const sizeCache = new Map<string, ImageSize | null>()
const WIDTHS = [640, 960, 1280]

async function readLocalImageSize(src: string): Promise<ImageSize | null> {
  if (!src.startsWith('/images/')) return null

  const clean = decodeURIComponent(src.split(/[?#]/)[0])
  if (sizeCache.has(clean)) return sizeCache.get(clean) ?? null

  const file = path.join(process.cwd(), 'public', clean.replace(/^\//, ''))
  if (!fs.existsSync(file)) {
    sizeCache.set(clean, null)
    return null
  }

  try {
    const meta = await sharp(file).metadata()
    if (!meta.width || !meta.height) {
      sizeCache.set(clean, null)
      return null
    }
    const size = { width: meta.width, height: meta.height }
    sizeCache.set(clean, size)
    return size
  } catch {
    sizeCache.set(clean, null)
    return null
  }
}

/**
 * 给文章图片补上真实宽高与响应式 srcset。
 *
 * - 宽高避免懒加载图片撑高页面，修复目录跳转偏移
 * - srcset 让移动端只下载需要的尺寸，变体由 scripts/image-variants.mjs 提前生成
 * - 第一张图提前加载，其余懒加载
 */
export default function rehypeImageLoading() {
  return async (tree: any) => {
    const images: any[] = []

    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img') images.push(node)
    })

    let imageIndex = 0
    for (const node of images) {
      node.properties = node.properties || {}
      if (!node.properties.loading) node.properties.loading = imageIndex === 0 ? 'eager' : 'lazy'
      if (!node.properties.decoding) node.properties.decoding = 'async'

      const src = typeof node.properties.src === 'string' ? node.properties.src : ''
      if (src && !node.properties.width && !node.properties.height) {
        const size = await readLocalImageSize(src)
        if (size) {
          node.properties.width = size.width
          node.properties.height = size.height

          if (!node.properties.srcset && src.startsWith('/images/')) {
            const ext = path.extname(src)
            const base = src.slice(0, -ext.length)
            const variants = WIDTHS.filter((width) => {
              if (size.width < width) return false
              const file = path.join(
                process.cwd(),
                'public',
                `${decodeURIComponent(base)}-${width}.webp`.replace(/^\//, '')
              )
              return fs.existsSync(file)
            })

            if (variants.length) {
              node.properties.srcset = variants
                .map((width) => `${base}-${width}.webp ${width}w`)
                .join(', ')
              node.properties.sizes = '(max-width: 860px) 100vw, 760px'
            }
          }
        }
      }

      imageIndex++
    }
  }
}
