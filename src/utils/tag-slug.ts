/**
 * 标签 URL 工具。
 *
 * 标签名本身是给人看的中文（例如“教程”），但地址栏里希望是简短英文：
 * - /tags/教程 → /tags/guide
 * - 未登记的标签 → 用拼音给出的备用短名，保证也是纯 ASCII
 *
 * 需要新增标签时，在这里补一条映射即可；没补也不会出错，
 * 只是地址会变成自动生成的拼音。
 */

/** 常用标签的英文短名，比拼音更短也更好读 */
const TAG_SLUGS: Record<string, string> = {
  教程: 'guide',
  公告: 'notice',
  说明: 'notes',
  虚幻引擎: 'unreal-engine',
  游戏开发: 'gamedev',
  汉化: 'localization',
  插件: 'plugin',
  工具: 'tools',
  更新: 'update',
  技术: 'tech',
  随笔: 'essay',
  日记: 'diary'
}

/** 单个汉字的拼音首字母 + 全拼兜底表（只覆盖本站出现过的字，缺失时按字符码生成） */
const PINYIN: Record<string, string> = {
  教: 'jiao',
  程: 'cheng',
  公: 'gong',
  告: 'gao',
  说: 'shuo',
  明: 'ming',
  虚: 'xu',
  幻: 'huan',
  引: 'yin',
  擎: 'qing',
  游: 'you',
  戏: 'xi',
  开: 'kai',
  发: 'fa',
  汉: 'han',
  化: 'hua',
  插: 'cha',
  件: 'jian',
  工: 'gong',
  具: 'ju',
  更: 'geng',
  新: 'xin',
  技: 'ji',
  术: 'shu',
  随: 'sui',
  笔: 'bi',
  日: 'ri',
  记: 'ji'
}

function fallbackSlug(tag: string): string {
  // 连续的 ASCII 字母数字要作为一个整体保留，否则 Renpy 会变成 r-e-n-p-y
  const parts: string[] = []
  for (const chunk of tag.match(/[A-Za-z0-9]+|./gu) ?? []) {
    if (/^[A-Za-z0-9]+$/.test(chunk)) {
      parts.push(chunk.toLowerCase())
      continue
    }
    parts.push(PINYIN[chunk] ?? `u${chunk.codePointAt(0)!.toString(16)}`)
  }
  return parts.join('-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '') || 'tag'
}

/** 标签 → URL 片段 */
export function tagToSlug(tag: string): string {
  const known = TAG_SLUGS[tag]
  if (known) return known
  return fallbackSlug(tag)
}

/** 标签页地址 */
export function tagHref(tag: string): string {
  return `/tags/${tagToSlug(tag)}`
}

/** URL 片段 → 标签（大小写不敏感，方便手输） */
export function slugToTag(slug: string, tags: Iterable<string>): string | undefined {
  const target = slug.toLowerCase()
  for (const tag of tags) {
    if (tagToSlug(tag).toLowerCase() === target) return tag
  }
  return undefined
}
