import { spawnSync } from 'node:child_process'

const result = spawnSync('npm', ['run', 'build:astro'], {
  cwd: process.cwd(),
  env: process.env,
  encoding: 'utf8',
  shell: true
})

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)

if (result.error) {
  console.error(`\n构建进程启动失败：${result.error.message}`)
  process.exit(1)
}

if (result.status !== 0) {
  const hints = []

  const location = output.match(/([^\s:]+\.mdx):(\d+):(\d+)/)
  const where = location ? `${location[1]} 第 ${location[2]} 行，第 ${location[3]} 列` : ''

  if (/Unicode escape sequence|Could not parse expression with acorn/i.test(output)) {
    hints.push(
      'MDX 表达式里有非法字符或转义。最常见的是 events={\\[ ... \\]}，应改成 events={[...]}。'
    )
  } else if (/Expected a closing tag for/i.test(output)) {
    hints.push('有组件标签没有闭合，检查对应的 <Aside>、<Tabs>、<Download> 等标签是否成对。')
  } else if (/Unexpected closing tag/i.test(output)) {
    hints.push('组件标签闭合顺序不对，检查是否多写或错写了结束标签。')
  } else if (/Could not parse|Unexpected token|Unexpected character/i.test(output)) {
    hints.push('MDX/JSX 语法无法解析，检查组件标签、花括号和表达式是否完整。')
  }

  if (
    /YAML|frontmatter|publishDate|description|invalid_type|Expected.*date|InvalidContentEntry|InvalidContentEntryDataError/i.test(
      output
    )
  ) {
    hints.push(
      'Frontmatter 字段不合法。检查 title、publishDate、description、slug、tags、draft、pin 的类型和格式。'
    )
  }

  if (/Invalid slug|slug.*(?:invalid|regex)|slug.*格式/i.test(output)) {
    hints.push('slug 只能包含小写字母、数字、连字符和 /，不能以 blog、about、archives、tags、search 开头。')
  }

  if (/slug 重复/.test(output)) {
    hints.push('有两篇文章使用了同一个 slug，修改其中一篇的自定义链接。')
  }

  console.error('\n==============================')
  console.error('构建失败，中文诊断')
  console.error('==============================')
  if (where) console.error(`出错位置：${where}`)
  if (hints.length) {
    hints.forEach((hint) => console.error(`- ${hint}`))
  } else {
    console.error('- 请查看上方第一条 [ERROR]；如果仍然看不懂，把这条错误发给 DSH 继续排查。')
  }
  console.error('提示：也可以先运行“检查格式”工作流，定位具体文件和行号。')
  console.error('==============================\n')

  process.exit(result.status)
}
