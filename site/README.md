# 暗香集网页

静态站点源文件位于此目录。诗题、诗句及中文注释维护在 `poems.js`，翻页与语言切换在 `reader.js`，视觉样式在 `styles.css`。资源均使用相对路径，可部署在 GitHub Pages 项目子路径。

## 本地预览

在项目根目录运行：

```powershell
node site/preview.mjs
```

然后访问 `http://127.0.0.1:8000`。字体文件随站点发布；字体加载失败时会回退至系统字体。

## GitHub Pages

`.github/workflows/jekyll-gh-pages.yml` 将 `site/` 作为静态产物发布。将 GitHub 仓库 Pages Source 设为 **GitHub Actions**，推送到 `main` 或在 Actions 页手动运行工作流即可。

## 字体

LXGW WenKai 与 Alegreya 字体文件位于 `site/fonts/`，对应 SIL Open Font License 文本也一并提供。Adobe Fonts Web Project 代码尚未提供；作者建立项目后，将官方嵌入代码添加到 `index.html` 的标记处，并把 `styles.css` 中 `--latin-title` 与 `--latin-label` 指向项目公布的 CSS 字体家族名。未确认网页授权前，不发布 Aaxiaolishu 字体文件。Poetica 若纳入网页，须按其 Adobe Web Project 官方代码加载。
