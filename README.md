# 文档库

教程、笔记与更新公告。

- 线上地址：<https://doc.gezhibuge.com>（Cloudflare 临时地址：<https://doc-dds.pages.dev>）
- 内容后台：Pages CMS（GitHub 登录，选择 `Gezhibuge/WebDoc` 仓库）
- 主站：<https://www.gezhibuge.com>（独立项目，不受本仓库影响）

## 技术栈

- [Astro](https://astro.build/) + [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)
- [Pages CMS](https://pagescms.org/)：在浏览器里编辑 Markdown
- GitHub：保存文章和代码
- Cloudflare Pages：静态托管，手动触发构建

## 本地开发

要求 Node.js `>= 22.12.0`（仓库内 `.nvmrc` 为 22）。

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
```

## 写文章

在 Pages CMS 中新建文章，字段如下：

| 页面上的标签 | frontmatter 字段 | 说明 |
| --- | --- | --- |
| 标题 | `title` | 最多 60 字 |
| 发布日期 | `publishDate` | 必填，格式 `YYYY-MM-DD` |
| 描述 | `description` | 最多 160 字，用于列表和 SEO |
| 自定义链接（英文） | `slug` | 支持分类，例如 `123`、`update/123`、`preview/123` |
| 标签 | `tags` | 可选，可添加多个 |
| 草稿 | `draft` | 打开后正式构建不会发布 |
| 置顶 | `pin` | 可选，列表优先显示 |
| 正文内容 | `body` | Markdown 源码 |

新建文章会保存到 `src/content/blog/` 下。文章链接完全由 `slug` 决定，是纯根路径：

```text
slug: 123          -> https://doc.gezhibuge.com/123
slug: update/123   -> https://doc.gezhibuge.com/update/123
slug: preview/123  -> https://doc.gezhibuge.com/preview/123
```

> 注意：Pure 主题原生使用 `/blog/<id>`，本仓库把文章详情路由改成了根路径 `/<slug>`；`/blog` 仍然作为文章列表页保留。`blog`、`about`、`archives`、`tags`、`search` 这些是已有页面，不要把它们作为 slug 的第一段。

## Cloudflare Pages 配置

- 框架预设：Astro
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 环境变量：`NODE_VERSION=22`
- 生产分支：`main`

绑定自定义域名 `doc.gezhibuge.com` 后，Cloudflare 会自动创建对应的 CNAME 记录，不需要手动改 DNS。

## 手动部署

Cloudflare Pages 的 Deploy Hook 需要 **HTTP POST** 请求，直接在浏览器地址栏打开（GET）不会触发构建。

桌面文件夹“文档库发布”里已经准备好：

- `发布文章.bat`：双击触发一次构建
- `发布文章.md`：操作说明
- `deploy-url.txt`：第一次使用时把 Deploy Hook URL 粘贴进去

也可以在 PowerShell 里执行：

```powershell
curl.exe -X POST "https://你的-deploy-hook-url"
```

## 编辑“关于本站”

“关于本站”的内容在 `src/content/pages/about.md`，也可以在 Pages CMS 左侧点击“关于页面”直接编辑。

## 目录

```text
.pages.yml                 Pages CMS 配置（中文字段标签）
astro.config.ts            Astro 配置（静态输出，无 Vercel 适配器）
src/content/blog/          文章 Markdown
src/content/pages/about.md 关于页面 Markdown
src/pages/[...id].astro    文章根路径 /<slug>
src/pages/blog/            文章列表 /blog
src/i18n/zh-CN.ts          中文界面文案
src/site.config.ts         站点标题、导航、语言
public/images/             Pages CMS 图片上传目录
```
