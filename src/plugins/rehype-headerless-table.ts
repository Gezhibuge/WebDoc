import { visit } from 'unist-util-visit'

function textContent(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.value || ''
  if (!node.children) return ''
  return node.children.map(textContent).join('')
}

/**
 * 允许用空表头写无头表格：
 *
 * | | |
 * | --- | --- |
 * | 名称 | 说明 |
 *
 * GFM 需要一行表头来识别表格；这里检测到表头全为空时移除 thead。
 */
export default function rehypeHeaderlessTable() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'table' || !Array.isArray(node.children)) return

      const headerIndex = node.children.findIndex(
        (child: any) => child.type === 'element' && child.tagName === 'thead'
      )
      if (headerIndex === -1) return

      const header = node.children[headerIndex]
      const headerRows = header.children.filter(
        (child: any) => child.type === 'element' && child.tagName === 'tr'
      )
      if (!headerRows.length) return

      const cells = headerRows.flatMap((row: any) =>
        row.children.filter((child: any) => child.type === 'element')
      )
      const isHeaderless =
        cells.length > 0 && cells.every((cell: any) => textContent(cell).trim() === '')

      if (isHeaderless) node.children.splice(headerIndex, 1)
    })
  }
}
