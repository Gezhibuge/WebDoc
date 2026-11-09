import type { CollectionEntry } from 'astro:content'

import { getBlogCollection } from 'astro-pure/server'

/**
 * 获取并排序博客文章。
 * 项目里同时存在 blog / pages 两个集合，这里显式收窄类型，
 * 避免 TypeScript 把两个集合的类型合并成联合类型。
 */
export async function getBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = (await getBlogCollection()) as CollectionEntry<'blog'>[]
  return posts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  ) as CollectionEntry<'blog'>[]
}
