# 《暗香集》三语诗集

以静态 HTML、CSS 和 JavaScript 呈现中文、英文、法文诗作，部署到 GitHub Pages。诗文与中文注释数据维护在 [`site/poems.js`](site/poems.js)，界面与阅读交互分别位于 `site/index.html`、`site/styles.css` 和 `site/reader.js`。

## 本地预览

在仓库根目录运行：

```powershell
node site/preview.mjs
```

然后打开 <http://127.0.0.1:8000>。

## GitHub Pages

`.github/workflows/jekyll-gh-pages.yml` 会在推送到 `main` 后将 `site/` 作为静态产物发布。仓库的 Pages 发布来源设为 **GitHub Actions**。

## 字体

LXGW WenKai 与 Alegreya 字体文件及对应 SIL Open Font License 文本位于 `site/fonts/`。作者提供 Adobe Fonts Web Project 嵌入代码后，可在 `site/index.html` 配置；再将 `site/styles.css` 的 `--latin-title` 与 `--latin-label` 改为项目公布的字体家族名。Aaxiaolishu 网页授权尚未确认，因此未上传该字体文件，中文诗文暂用文楷与系统楷体回退。
