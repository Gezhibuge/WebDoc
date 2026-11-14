import { visit } from 'unist-util-visit'

/**
 * Article images should not compete with the first viewport's HTML/CSS/fonts.
 * Keep the first image eager, lazily decode the rest.
 */
export default function rehypeImageLoading() {
  return (tree: any) => {
    let imageIndex = 0

    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'img') return

      node.properties = node.properties || {}
      const loading = node.properties.loading
      if (!loading) node.properties.loading = imageIndex === 0 ? 'eager' : 'lazy'
      if (!node.properties.decoding) node.properties.decoding = 'async'
      imageIndex++
    })
  }
}
