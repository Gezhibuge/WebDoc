/**
 * 简体中文界面文案。
 * 主题本身只提供日期本地化，没有内置 i18n 字典；这里集中维护读者可见文字，
 * 方便以后替换或增加其他语言。
 */
export const ui = {
  siteName: '文档库',
  header: {
    search: '搜索',
    darkTheme: '切换深色模式',
    menu: '打开菜单',
    themeChanged: (theme: string) => `已切换为${theme === 'dark' ? '深色' : theme === 'light' ? '浅色' : '跟随系统'}主题`
  },
  footer: {
    builtWith: '由 Astro 与 Pure 主题驱动',
    backHome: '返回首页'
  },
  blog: {
    title: '文章',
    description: '教程、笔记与更新公告',
    back: '返回',
    noPosts: '还没有文章',
    pageSummary: (current: number, count: number, total: number) =>
      `第 ${current} 页，本页 ${count} 篇，共 ${total} 篇`,
    viewArchives: '按年份查看全部文章',
    previousPosts: '← 上一页',
    nextPosts: '下一页 →',
    tags: '标签',
    viewAllTags: '查看全部标签'
  },
  archives: {
    title: '归档',
    description: '按年份浏览全部文章',
    postCount: (count: number) => `${count} 篇文章`
  },
  tags: {
    title: '标签',
    description: '按标签浏览文章',
    tagTitle: '标签',
    noTags: '还没有标签',
    previous: '← 上一页',
    next: '下一页 →'
  },
  search: {
    title: '搜索',
    description: '搜索本站文章',
    intro: '输入关键词，搜索本站的文章，或者随便输入点什么……',
    devMode: '开发模式下搜索不可用，请先执行构建',
    disabled: '搜索功能未启用'
  },
  post: {
    minutesRead: (minutes: number) => `约 ${minutes} 分钟阅读`,
    pin: '[置顶]',
    draft: '（草稿）',
    updated: '更新于',
    previous: '上一篇',
    next: '下一篇',
    copyright: '版权声明',
    author: '作者',
    publishedAt: '发布于',
    license: '未经特别说明，本文采用 CC BY-NC-SA 4.0 许可协议',
    backToBlog: '返回文章列表',
    tableOfContents: '目录',
    scrollToSection: (text: string) => `跳转到：${text}`,
    tags: '标签'
  },
  notFound: {
    title: '页面不存在',
    description: '没有找到这个页面',
    message: '抱歉，你访问的页面不存在',
    backHome: '返回首页'
  }
} as const

export default ui

