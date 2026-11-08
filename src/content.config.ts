import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.toLowerCase())
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

// Define blog collection
const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Required
  schema: ({ image }) =>
    z.object({
      // Required
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: z.coerce.date(),
      // 自定义根路径。Pure 原生没有 slug 字段，这里增加可选的英文短链接。
      // 支持分类，例如：
      //   slug: 123            -> /123
      //   slug: update/123     -> /update/123
      //   slug: preview/123    -> /preview/123
      slug: z.coerce
        .string()
        .max(120)
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
          'slug 只能包含小写字母、数字、连字符和 / 分隔的分类'
        )
        .optional(),
      // Optional
      updatedDate: z.coerce.date().optional(),
      heroImage: z
        .object({
          src: image(),
          alt: z.string().optional(),
          inferSize: z.boolean().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          color: z.string().optional()
        })
        .optional(),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
      language: z.string().optional(),
      draft: z.boolean().default(false),
      pin: z.boolean().optional(),
      // Special fields
      comment: z.boolean().default(true)
    })
})

// 单页内容：目前用于“关于本站”，可在 Pages CMS 里直接编辑。
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: () =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(160)
    })
})

export const collections = { blog, pages }
