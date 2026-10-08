# 《暗香集》三语诗集

以静态 HTML、CSS 和 JavaScript 呈现中文、英文、法文诗作，可安装到手机主屏作为应用离线阅读，部署在 GitHub Pages。

## 文件

| 路径 | 作用 |
|---|---|
| `site/poems.js` | 内容数据：`window.POEMS`（诗题、三语诗句、创作日期、中文注释、插画）与 `window.MATTER`（前后页文案与页码） |
| `site/reader.js` | 阅读顺序、翻页、目录、语言切换、深链、离线缓存注册与字体预热 |
| `site/styles.css` | 版式与字体角色 |
| `site/index.html` | 页面骨架、应用清单与 iOS 全屏 meta |
| `site/manifest.webmanifest`、`site/sw.js`、`site/icons/` | 应用清单、离线外壳、印章图标 |
| `site/fonts/`、`site/images/`、`site/audio/` | 字体、插画、背景音乐 |
| `site/preview.mjs` | 本地静态预览服务器 |

## 阅读顺序与交互

封面 → 版权页 → 献词 → 题记 → 前言 → 每首诗（插画 → 中文 → 英文 → 法文 → 中文注释）→ 后记 → 作者简介，共 22 页；前后页页码沿用纸书（iii–v、15–16），诗页显示纸书页码。

翻页支持左右滑动、方向键与底部按钮。顶部「目录」列出封面、前后页，以及三首诗的各语种入口。地址栏 hash 可直达任意页：

- `#cover`
- `#jiaolong-zh`、`#jiaolong-en`、`#jiaolong-fr`、`#jiaolong-notes`、`#jiaolong-image`（`mid-autumn`、`double-fifth` 同理）
- `#colophon`、`#dedication`、`#epigraph`、`#foreword`、`#afterword`、`#about`

背景音乐只在窄屏（`max-width: 759px`）自动播放，工具栏有开关。

## 本地预览

在仓库根目录运行：

```powershell
node site/preview.mjs
```

然后打开 <http://127.0.0.1:8000>。预览服务器按扩展名发送 MIME，包含 `.webmanifest`——缺了它浏览器会直接忽略应用清单。

## GitHub Pages

`.github/workflows/jekyll-gh-pages.yml` 会在推送到 `main` 后将 `site/` 作为静态产物发布。仓库的 Pages 发布来源设为 **GitHub Actions**。

改动 `styles.css`、`reader.js`、`poems.js` 后，请同步 `site/index.html` 里的 `?v=ebook-ui-N`，否则读者会拿到旧缓存。

## 字体

| 用途 | 字体 |
|---|---|
| 中文诗题、中文诗句 | Aaxiaolishu |
| 中文注释、创作日期、目录与界面文字 | LXGW WenKai |
| 英、法诗句 | Alegreya（含 Italic） |
| 英、法诗题，封面英文与法文副题 | Poetica Std |
| 英、法语种标签、页眉小标题 | Poetica Roman Small Capitals |
| 插画页的短英文题词 | Poetica Chancery IV |
| 封面英文署名 | Bickham Script Pro 3 Bold |

字体文件位于 `site/fonts/`，Alegreya 与文楷的 SIL Open Font License 文本一并提供，其余字体由作者提供。

**阿霞小隶书务必用仓库内这份。** 原始文件在 OS/2（版本 3 却置了 fsSelection bit 8）、`gasp`（版本 0）、`vhea`（`0x00010001`）三处不符合 OpenType 规范，Chrome 的 OTS 校验会整份拒收并静默回退到文楷；仓库内是只改了这三个字段与相关校验和的修正版，FreeType 渲染结果与原文件逐像素一致。若要用系统里那份（`%LOCALAPPDATA%\Microsoft\Windows\Fonts\Aa小隶书.ttf`），只取字形、保留修正版的元数据。它用 `?v=2` 单独破缓存。

## 装到手机

`site/manifest.webmanifest` 使用 `"display": "fullscreen"`，配合 iOS 的 `apple-mobile-web-app-*` meta：从主屏图标启动时没有地址栏和浏览器界面（Android 上状态栏也收起；iOS 不支持 `fullscreen`，退到 standalone，纸面借 `black-translucent` 延伸到状态栏下）。普通标签页无法隐藏地址栏，浏览器不允许页面自动全屏。

`site/sw.js` 负责离线：

- 安装时缓存页面骨架；页面与 CSS/JS 走网络优先（新版本始终能到达），离线时回退缓存。
- 字体、插画、音乐按 URL 永久缓存。worker 接管页面的瞬间会把 8 个 `@font-face` 文件预热进缓存，因此**访问一次即可离线阅读**（约 21.8 MB 字体）；插画在首次浏览到那张时才缓存。
- 改动页面骨架（例如 `styles.css` 的结构）时，把 `sw.js` 顶部的 `CACHE` 升一版，老读者的离线副本才会更新。

“添加到主屏幕”的操作在 Android Chrome 是菜单里的「安装应用／添加到主屏幕」，在 iOS Safari 是分享菜单里的「添加到主屏幕」。
