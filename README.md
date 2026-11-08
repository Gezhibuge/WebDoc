# 鸽纸不鸽文档库

鸽纸不鸽网站的中文文档、教程与更新公告。

- 线上地址：<https://doc.gezhibuge.com>
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
| 自定义链接（英文） | `slug` | 只填小写字母、数字、连字符，例如 `123` |
| 标签 | `tags` | 可选，可添加多个 |
| 草稿 | `draft` | 打开后正式构建不会发布 |
| 置顶 | `pin` | 可选，列表优先显示 |
| 正文内容 | `body` | Markdown 源码 |

新建文章会保存为 `src/content/blog/<slug>.md`。文章链接是纯根路径：

```text
https://doc.gezhibuge.com/123
https://doc.gezhibuge.com/update-2026
```

> 注意：Pure 主题原生使用 `/blog/<id>`，本仓库把文章详情路由改成了根路径 `/<slug>`；`/blog` 仍然作为文章列表页保留。

## Cloudflare Pages 配置

- 框架预设：Astro
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 环境变量：`NODE_VERSION=22`
- 生产分支：`main`

绑定自定义域名 `doc.gezhibuge.com` 后，Cloudflare 会自动创建对应的 CNAME 记录，不需要手动改 DNS。

## 手动部署

Cloudflare Pages 的 Deploy Hook 需要 **HTTP POST** 请求，直接在浏览器地址栏打开（GET）不会触发构建。

拿到 Deploy Hook URL 后，可以在 PowerShell 里执行：

```powershell
curl.exe -X POST "https://你的-deploy-hook-url"
```

或者把这个地址做成浏览器书签（书签内容是一段 `javascript:`），点击书签触发 POST。本书签代码需要在你信任的网页上使用：

```javascript
javascript:fetch('https://你的-deploy-hook-url',{method:'POST',mode:'no-cors'}).then(()=>alert('已触发构建'))
```

## 目录

```text
.pages.yml                 Pages CMS 配置（中文字段标签）
astro.config.ts            Astro 配置（静态输出，无 Vercel 适配器）
src/content/blog/          文章 Markdown
src/pages/[...id].astro    文章根路径 /<slug>
src/pages/blog/            文章列表 /blog
src/i18n/zh-CN.ts          中文界面文案
src/site.config.ts         站点标题、导航、语言
public/images/             Pages CMS 图片上传目录
```
