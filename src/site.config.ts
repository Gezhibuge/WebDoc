import type { CardListData, Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  // [Basic]
  /** 网站标题，用于浏览器标签、页头和 SEO 元信息。 */
  title: '文档库',
  /** 作者与版权署名。 */
  author: '鸽纸不鸽',
  /** 网站描述。 */
  description: '教程、笔记与更新公告',
  /** 站点图标。 */
  favicon: '/favicon/document.svg',
  /** 社交分享卡片。 */
  socialCard: '/images/social-card.png',
  /** 默认语言：简体中文。 */
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  },
  /** 首页头像。 */
  logo: {
    src: '/src/assets/avatar.png',
    alt: '鸽纸不鸽'
  },

  titleDelimiter: '|',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  head: [],
  customCss: [],

  /** 导航栏。 */
  header: {
    menu: [
      { title: '主站', link: 'https://gezhibuge.com' },
      { title: '归档', link: '/archives' },
      { title: '标签', link: '/tags' },
      { title: '关于', link: '/about' }
    ]
  },

  /** 页脚。为了界面全中文，关闭主题默认的英文 credits。 */
  footer: {
    year: `© ${new Date().getFullYear()}`,
    links: [],
    credits: false,
    social: [
      { icon: 'bilibili', label: 'B 站：鸽纸不鸽', href: 'https://space.bilibili.com/615931229' },
      { icon: 'github', label: 'GitHub：Gezhibuge/WebDoc', href: 'https://github.com/Gezhibuge/WebDoc' },
      { icon: 'email', label: '邮箱：gezhibuge@qq.com', href: 'mailto:gezhibuge@qq.com' }
    ]
  },

  // [Content]
  content: {
    externalLinks: {
      content: ' ↗',
      properties: { style: 'user-select:none' }
    },
    blogPageSize: 10,
    // 本站是文档站，不需要社交分享按钮。
    share: []
  }
}

export const integ: IntegrationUserConfig = {
  // [Links]
  links: {
    logbook: [],
    applyTip: [
      { name: '名称', val: theme.title },
      { name: '简介', val: theme.description || '' },
      { name: '链接', val: 'https://doc.gezhibuge.com/' },
      { name: '头像', val: 'https://doc.gezhibuge.com/favicon/favicon.ico' }
    ],
    cacheAvatar: false
  },
  // [Search] Pagefind 全站搜索。
  pagefind: true,
  // Quote 组件本站未使用，但配置类型要求保留该字段。
  quote: {
    server: 'https://dummyjson.com/quotes/random',
    target: `(data) => data.quote || ''`
  },
  // [Typography]
  typography: {
    class: 'prose text-base',
    blockquoteStyle: 'normal',
    inlineCodeBlockStyle: 'modern'
  },
  // [Lightbox]
  mediumZoom: {
    enable: true,
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  },
  // 关闭 Waline 评论，避免加载第三方评论服务和英文界面。
  waline: {
    enable: false,
    showMeta: false,
    emoji: [],
    additionalConfigs: {}
  }
}

export const terms: CardListData = {
  title: '站点条款',
  list: []
}

const config = { ...theme, integ } as Config
export default config
