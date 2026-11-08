# Astro Pure Docs

一个基于 [Astro](https://astro.build/) 和 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) 的静态文档 / 博客站点模板。

适合用来搭建教程库、产品文档、更新公告或个人笔记站。内容在浏览器里通过 [Pages CMS](https://pagescms.org/) 编辑，保存到 GitHub，再由 Cloudflare Pages 构建为纯静态网站。

## 特性

- Astro 6 静态输出，无服务端依赖
- Astro Theme Pure 的博客与文档排版
- Pages CMS 中文字段配置，直接写 Markdown
- 文章支持纯根路径和分类路径：
  - `/hello`
  - `/update/123`
  - `/guide/install`
- Pagefind 全站搜索，支持中文界面
- RSS、Sitemap、robots.txt
- 中文 UI 文案集中管理
- 适配 Cloudflare Pages，构建产物为 `dist/`

## 环境要求

- Node.js `>= 22.12.0`（推荐 Node 22 LTS）
- npm
- Git

仓库带有 `.nvmrc`，使用 nvm 时执行：

```bash
nvm use
```

## 本地开发

```bash
npm ci
npm run dev
```

开发服务器默认运行在 <http://localhost:4321>。

生产构建：

```bash
npm run build
```

构建完成后，静态文件位于 `dist/`。

## 目录结构

```text
.pages.yml                  Pages CMS 配置
astro.config.ts             Astro 配置
src/
  content/blog/             文章 Markdown / MDX
  content/pages/            单页内容（如关于页）
  i18n/zh-CN.ts             中文界面文案
  layouts/                  页面布局
  pages/                    路由
    [...id].astro           文章根路径 /<slug>
    blog/[...page].astro    文章列表 /blog
  site.config.ts            站点标题、导航、页脚、语言
  styles/                   全局样式
public/
  favicon/                  站点图标
  images/                   Pages CMS 图片上传目录
```

## 写文章

文章放在 `src/content/blog/`，支持 `.md` 和 `.mdx`。一篇典型的文章：

```md
---
title: 文章标题
description: 一句话摘要，最多 160 字
publishDate: 2026-01-01
slug: guide/install
tags:
  - 教程
draft: false
pin: false
comment: false
---

正文从这里开始。
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题，最多 60 字 |
| `description` | 是 | 摘要，最多 160 字 |
| `publishDate` | 是 | 发布日期 |
| `slug` | 否 | 自定义 URL；不填则使用文件名 |
| `tags` | 否 | 标签数组 |
| `draft` | 否 | 草稿，生产构建中隐藏 |
| `pin` | 否 | 置顶 |
| `comment` | 否 | 预留的评论开关 |

### URL 规则

`slug` 支持用 `/` 分类，但不能以 `/` 开头或结尾：

```text
slug: hello          -> /hello
slug: update/123     -> /update/123
slug: guide/install  -> /guide/install
```

只使用小写字母、数字、连字符和 `/`。不要使用 `blog`、`about`、`archives`、`tags`、`search` 作为第一段，这些是站点已有路由。

### 所有支持的格式

仓库内置了一篇完整的格式说明文章：

```text
src/content/blog/writing-guide.mdx
```

打开这篇文章即可查看文本、标题、嵌套列表、引用、代码块、表格、图片、数学公式、脚注、提示框、标签页、步骤条、折叠面板、时间线、卡片等写法。

> `.md` 支持 Markdown；`.mdx` 额外支持 Astro 组件。

## Pages CMS

Pages CMS 会根据仓库根目录的 `.pages.yml` 生成编辑后台。

1. 打开 <https://app.pagescms.org/>
2. 使用 GitHub 登录
3. 授权 Pages CMS 访问目标仓库
4. 选择仓库和 `main` 分支
5. 在“文章”或“关于页面”中编辑并保存

字段的 `name` 必须与 Astro frontmatter 保持一致，`label` 可以自由改成中文。图片上传目录配置在 `.pages.yml` 的 `media` 中，默认写入 `public/images/`，正文中用 `/images/文件名` 引用。

> Pages CMS 的集合按 `filename` 的扩展名过滤文件，因此这里拆成两个集合：`.md` 文章在“文章”，需要使用 MDX 组件的文章在“进阶文章（MDX）”。

MDX 文章已经全局注册了常用组件（`Aside`、`Tabs`、`TabItem`、`Steps`、`Collapse`、`Spoiler`、`Timeline`、`Card`、`GithubCard`、`LinkPreview`、`Quote`），在 Pages CMS 里直接写组件标签即可，不需要在正文顶部 import。

## 部署到 Cloudflare Pages

1. 在 Cloudflare Dashboard 创建 Pages 项目并连接本仓库
2. 框架预设选择 `Astro`
3. 构建命令：`npm run build`
4. 输出目录：`dist`
5. 环境变量：`NODE_VERSION=22`
6. 生产分支：`main`

首次部署完成后，在项目的 **Custom domains** 中绑定自己的域名。

### 从 Pages CMS 发布

`.pages.yml` 顶层的 `actions` 会在 Pages CMS 左侧栏添加一个 **发布上线** 按钮。点击后：

1. Pages CMS 触发 GitHub Actions 工作流 `.github/workflows/pages-cms-deploy.yml`
2. 工作流读取仓库 Secret `CLOUDFLARE_DEPLOY_HOOK`
3. 用 POST 请求触发 Cloudflare Pages 构建

配置时需要在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中添加 `CLOUDFLARE_DEPLOY_HOOK`，值为 Cloudflare Pages 的 Deploy Hook URL。

### 手动部署

如果关闭了自动部署，也可以直接使用 Cloudflare Pages 的 Deploy Hook。Deploy Hook 需要 HTTP POST：

```bash
curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID"
```

也可以把这段请求封装成脚本或 CI 步骤。Deploy Hook URL 属于敏感信息，不要提交到仓库。

### 无尾斜杠 URL

项目使用：

```ts
build: {
  format: 'file'
}
```

因此构建产物是 `hello.html` 而不是 `hello/index.html`，Cloudflare Pages 会以 `/hello` 提供页面，不会重定向到 `/hello/`。

## 自定义

- 站点标题、描述、导航、页脚：`src/site.config.ts`
- 中文界面文案：`src/i18n/zh-CN.ts`
- 全站圆角与动画：`src/assets/styles/global.css`
- 站点图标：`public/favicon/`
- 页面布局：`src/layouts/`

站点图标使用 `document.svg`，并配有 16/32/192/512 和 Apple Touch Icon。替换图标时保留文件名，或同步修改 `src/components/BaseHead.astro` 和 `site.webmanifest`。

## 技术栈

- Astro 6
- Astro Theme Pure
- UnoCSS
- Pagefind
- Pages CMS
- Cloudflare Pages

## 许可

本项目基于 Apache License 2.0 发布，详见 [LICENSE](./LICENSE)。

主题版权归 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) 作者所有。
