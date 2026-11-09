import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

// 代码块和标题后的 # 锚点不进入 Pagefind 索引，避免搜索结果里出现
// 大段 Markdown 示例和孤立的 #。
export default function rehypePagefindIgnore() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      const classes = node.properties?.className
      const isAnchor = Array.isArray(classes) && classes.includes('anchor')
      if (node.tagName === 'pre' || node.tagName === 'code' || isAnchor) {
        node.properties = { ...node.properties, 'data-pagefind-ignore': '' }
      }

      if (node.tagName === 'h2' && node.properties?.id === 'footnote-label') {
        node.children = node.children.map((child) =>
          child.type === 'text' ? { ...child, value: child.value.replace('Footnotes', '脚注') } : child
        )
      }
    })
  }
}
