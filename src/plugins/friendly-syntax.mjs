/**
 * Friendly MDX syntax.
 *
 * Markdown stays Markdown. A small set of `:::` blocks is expanded to the
 * original Astro components before MDX is compiled, so the existing JSX
 * components keep working and content authors can write less markup.
 */

const ALIASES = {
  tip: 'tip',
  提示: 'tip',
  note: 'note',
  说明: 'note',
  caution: 'caution',
  注意: 'caution',
  danger: 'danger',
  警告: 'danger',
  aside: 'note',
  download: 'download',
  下载: 'download',
  steps: 'steps',
  步骤: 'steps',
  collapse: 'collapse',
  折叠: 'collapse',
  card: 'card',
  卡片: 'card',
  spoiler: 'spoiler',
  剧透: 'spoiler',
  tabs: 'tabs',
  标签页: 'tabs',
  timeline: 'timeline',
  时间线: 'timeline'
}

const OPEN_RE = /^\s*:::\s*([A-Za-z\u4e00-\u9fa5][\w\u4e00-\u9fa5-]*)\s*(?:\[(.*?)\])?\s*$/
const CLOSE_RE = /^\s*:::\s*$/
const FENCE_RE = /^\s*(`{3,}|~{3,})/

function getFence(line) {
  const match = line.match(FENCE_RE)
  return match ? { char: match[1][0], length: match[1].length } : null
}

function isFenceClose(line, fence) {
  if (!fence) return false
  const marker = fence.char.repeat(fence.length)
  return new RegExp(`^\\s*${marker[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`).test(line)
}

function findClosing(lines, start) {
  let fence = null
  let depth = 1

  for (let index = start + 1; index < lines.length; index++) {
    const line = lines[index]
    if (fence) {
      if (isFenceClose(line, fence)) fence = null
      continue
    }

    const nextFence = getFence(line)
    if (nextFence) {
      fence = nextFence
      continue
    }

    if (CLOSE_RE.test(line)) {
      depth--
      if (depth === 0) return index
      continue
    }

    if (OPEN_RE.test(line)) depth++
  }

  return -1
}

function jsxString(value) {
  return `{${JSON.stringify(value)}}`
}

function unquote(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseConfig(body) {
  const lines = body.split('\n')
  const config = {}
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index++
      continue
    }

    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!match) break
    config[match[1]] = unquote(match[2])
    index++
  }

  while (index < lines.length && !lines[index].trim()) index++
  return { config, body: lines.slice(index).join('\n') }
}

function wrap(tag, props, body) {
  return `<${tag}${props}>\n\n${body.trim()}\n\n</${tag}>`
}

function renderAside(type, title, body) {
  const props = ` type="${type}"${title ? ` title=${jsxString(title)}` : ''}`
  return wrap('Aside', props, expandFriendlySyntax(body))
}

function renderDownload(body) {
  const { config } = parseConfig(body)
  if (!config.title || !config.href) {
    return `<Aside type="caution" title="下载块缺少配置">\n\n友好下载语法至少需要 \`title\` 和 \`href\`。\n\n</Aside>`
  }

  const attrs = [
    ` title=${jsxString(config.title)}`,
    config.note ? ` note=${jsxString(config.note)}` : '',
    config.size ? ` size=${jsxString(config.size)}` : '',
    ` href=${jsxString(config.href)}`,
    config.label ? ` label=${jsxString(config.label)}` : ''
  ].join('')

  return `<Download${attrs} />`
}

function renderSteps(body) {
  return wrap('Steps', '', expandFriendlySyntax(body))
}

function renderCollapse(title, body) {
  const props = title ? ` title=${jsxString(title)}` : ''
  return wrap('Collapse', props, expandFriendlySyntax(body))
}

function renderCard(title, body) {
  const { config, body: content } = parseConfig(body)
  const props = [
    title ? ` heading=${jsxString(title)}` : '',
    config.subheading ? ` subheading=${jsxString(config.subheading)}` : '',
    config.date ? ` date=${jsxString(config.date)}` : ''
  ].join('')
  return wrap('Card', props, expandFriendlySyntax(content))
}

function renderSpoiler(body) {
  return `<Spoiler>${expandFriendlySyntax(body).replace(/\s*\n\s*/g, ' ').trim()}</Spoiler>`
}

function renderTabs(body) {
  const lines = body.split('\n')
  const tabs = []
  let current = null

  for (const line of lines) {
    const heading = line.match(/^\s*==\s+(.+?)\s*$/)
    if (heading) {
      if (current) tabs.push(current)
      current = { label: heading[1], lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) tabs.push(current)

  if (!tabs.length) {
    return `<Aside type="caution" title="标签页缺少内容">\n\n友好标签页语法需要用 \`== 标签名\` 分隔内容。\n\n</Aside>`
  }

  return `<Tabs>\n${tabs
    .map(
      (tab) =>
        `  <TabItem label=${jsxString(tab.label)}>\n\n${expandFriendlySyntax(tab.lines.join('\n')).trim()}\n\n  </TabItem>`
    )
    .join('\n')}\n</Tabs>`
}

function renderTimeline(body) {
  const events = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf('|')
      if (index === -1) return null
      return { date: line.slice(0, index).trim(), content: line.slice(index + 1).trim() }
    })
    .filter(Boolean)

  if (!events.length) {
    return `<Aside type="caution" title="时间线缺少内容">\n\n友好时间线语法每行写 \`日期 | 内容\`。\n\n</Aside>`
  }

  return `<Timeline events={${JSON.stringify(events)}} />`
}

function renderFriendly(type, title, body) {
  switch (type) {
    case 'note':
    case 'tip':
    case 'caution':
    case 'danger':
      return renderAside(type, title, body)
    case 'download':
      return renderDownload(body)
    case 'steps':
      return renderSteps(body)
    case 'collapse':
      return renderCollapse(title, body)
    case 'card':
      return renderCard(title, body)
    case 'spoiler':
      return renderSpoiler(body)
    case 'tabs':
      return renderTabs(body)
    case 'timeline':
      return renderTimeline(body)
    default:
      return null
  }
}

export function expandFriendlySyntax(source) {
  source = source.replace(/\r\n?/g, '\n')
  if (!source.includes(':::')) return source

  const lines = source.split('\n')
  const output = []
  let fence = null

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (fence) {
      output.push(line)
      if (isFenceClose(line, fence)) fence = null
      continue
    }

    const nextFence = getFence(line)
    if (nextFence) {
      fence = nextFence
      output.push(line)
      continue
    }

    const opening = line.match(OPEN_RE)
    if (!opening) {
      output.push(line)
      continue
    }

    const type = ALIASES[opening[1].toLowerCase()]
    if (!type) {
      output.push(line)
      continue
    }

    const closing = findClosing(lines, index)
    if (closing === -1) {
      output.push(line)
      continue
    }

    const title = opening[2]?.trim() ?? ''
    const body = lines.slice(index + 1, closing).join('\n')
    const replacement = renderFriendly(type, title, body)

    if (!replacement) {
      output.push(line)
      continue
    }

    output.push(...replacement.split('\n'))
    index = closing
  }

  return output.join('\n')
}

/** @returns {import('vite').Plugin} */
export function friendlyMdx() {
  return {
    name: 'friendly-mdx',
    enforce: 'pre',
    transform(code, id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/')
      if (!cleanId.endsWith('.mdx') || !cleanId.includes('/src/content/')) return null
      const expanded = expandFriendlySyntax(code)
      return expanded === code ? null : { code: expanded, map: null }
    }
  }
}
