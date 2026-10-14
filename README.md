# 《暗香集》三语诗集

以静态 HTML、CSS 和 JavaScript 呈现中文、英文、法文诗作，可安装到手机主屏作为应用离线阅读，部署在 GitHub Pages。

## 文件

| 路径 | 作用 |
|---|---|
| `site/poems.js` | 内容数据：`window.POEMS`（诗题、可选三语眉题、三语诗句、创作日期、中文注释、SVG 插画路径与替代文字）与 `window.MATTER`（前后页文案与页码） |
| `site/reader.js` | 阅读顺序、翻页、目录、语言切换、深链、离线缓存注册与字体预热 |
| `site/styles.css` | 版式与字体角色 |
| `site/index.html` | 页面骨架、应用清单与 iOS 全屏 meta |
| `site/manifest.webmanifest`、`site/sw.js`、`site/icons/` | 应用清单、离线外壳、印章图标 |
| `site/fonts/`、`site/images/`、`site/audio/` | 字体、SVG 插画、背景音乐 |
| `site/preview.mjs` | 本地静态预览服务器 |

## 阅读顺序与交互

文字封面 → 版权页 → 献词 → 题记 → 前言 → 各诗（先显示插画；中文原诗后附中文注释；再读英文、法文）→ 后记 → 作者简介。当前共 14 首诗、14 幅诗作插图、63 个阅读页。诗作与注释沿用现有纸本页码 1–50；《深秋》为 44–46、《離別》为 47–50，后记、作者简介为 51–52。插画单独成阅读页，不占纸本页码；有注释的中文原诗与中文注释在同一阅读页滚动。

翻页支持左右滑动、方向键与底部按钮。顶部「目录」列出文字封面、前后页，以及十四首诗的各语种入口。地址栏 hash 可直达任意页：

- `#cover`（文字封面）
- `#jiaolong-zh`、`#jiaolong-en`、`#jiaolong-fr`、`#jiaolong-image`；其余诗作使用相同后缀，例如 `#deep-autumn-image`、`#farewell-song-zh`。十四首诗现均有插画页；有中文注释的诗作支持 `-notes`，例如 `#jiaolong-notes`、`#sleeping-lotus-notes`、`#farewell-song-notes`。
- `#colophon`、`#dedication`、`#epigraph`、`#foreword`、`#afterword`、`#about`

背景音乐只在窄屏（`max-width: 759px`）自动播放，工具栏有开关。

## 本地预览

在仓库根目录运行：

```powershell
node site/preview.mjs
```

然后打开 <http://127.0.0.1:8000>。预览服务器按扩展名发送 MIME，包含 `.webmanifest`——缺了它浏览器会直接忽略应用清单。

## 当代东方艺术书样板

正式入口仍为 `site/index.html`。新设计使用独立入口 `site/design-review.html`，复用原始诗文数据。运行：

```powershell
node site/preview-review.mjs
```

打开 <http://127.0.0.1:8014/design-review.html>。独立端口便于与旧 PWA 缓存区分，也可在原预览端口打开 `/design-review.html`。

样板共 28 个阅读页，包括全部前后页，以及按原顺序选取的《蛟龍》《話端午》《九九歌》《睡蓮》《元夕逛街》《離別》的三语诗文；其中《蛟龍》《睡蓮》《元夕逛街》有新绘制的独立 SVG。《話端午》《九九歌》《離別》用于检查长注释和长句。其余十一幅插画待样板方向确认后再绘制。

样板样式与交互位于 `review.css`、`review.js`，选篇及配图设置在 `review-data.js`。中文正文改用文楷 TC（手机 27px），英法正文 Alegreya（23px），中文注释 22px；中文诗题与封面仍用隶书。顶部和底部位于固定网格行，内容只在中间纸页内滚动。

新图位于 `site/images/review/`。`sealPosition: { x, y }` 表示印章中心在 SVG 画幅中的百分比位置，绘画内不含印章。两枚共享印使用现有小篆字体的矢量轮廓；运行 `node tools/build-review-seals.mjs` 可重新提取，无需安装依赖。字形来源与授权仍见字体目录的 notice。

静态与离线缓存回归检查：`node tools/check-artbook.mjs`。样板和正式版各自保存离线 HTML，访问样板不会替换正式版首页的离线副本。手机 Safari/PWA 的真机表现仍需在作者评审时检查。

当前评审版本为 `artbook-4`，完成内容与检查范围见 [样板评审记录](site/design-review.md)。本地已有 Playwright 时，可运行 `node tools/review-browser.mjs <截图输出目录>` 重新生成三种尺寸的整页、局部图及检查记录；该工具只用于开发检查，不属于网站运行依赖。顶部显示阅读进度，底部显示原纸本页码；中文注释读入视野时，底部同步显示注释的纸本页码。

## GitHub Pages

`.github/workflows/jekyll-gh-pages.yml` 会在推送到 `main` 后将 `site/` 作为静态产物发布。仓库的 Pages 发布来源设为 **GitHub Actions**。

改动 `styles.css`、`reader.js`、`poems.js` 后，请同步 `site/index.html` 里的 `?v=ebook-ui-N`，否则读者会拿到旧缓存。

## 字体

| 用途 | 字体 |
|---|---|
| 中文诗题、中文诗句 | 王汉宗中隶书繁（HanWang LiSu） |
| 中文注释、创作日期、目录与界面文字 | LXGW WenKai TC |
| 封面红戳「紫薇」 | 全字库说文解字（小篆风格） |
| 英、法诗句 | Alegreya（含 Italic） |
| 英、法诗题，封面英文与法文副题 | Poetica Std |
| 英、法语种标签、页眉小标题 | Poetica Roman Small Capitals |
| 插画页的短英文题词 | Poetica Chancery IV |
| 封面英文署名 | Bickham Script Pro 3 Bold |

字体文件位于 `site/fonts/`。Alegreya 与霞鹜文楷 TC 的 SIL Open Font License 文本一并提供；王汉宗中隶书繁为 GPL 字体，字体目录内附授权文本和来源说明；全字库说文解字依据政府资料开放授权使用，来源与署名信息见字体目录内的 notice；其余字体由作者提供。

## 装到手机

`site/manifest.webmanifest` 使用 `"display": "fullscreen"`，配合 iOS 的 `apple-mobile-web-app-*` meta：从主屏图标启动时没有地址栏和浏览器界面（Android 上状态栏也收起；iOS 不支持 `fullscreen`，退到 standalone，纸面借 `black-translucent` 延伸到状态栏下）。普通标签页无法隐藏地址栏，浏览器不允许页面自动全屏。

`site/sw.js` 负责离线：

- 安装时缓存页面骨架；页面与 CSS/JS 走网络优先（新版本始终能到达），离线时回退缓存。
- 字体、插画、音乐按 URL 缓存。正式阅读器在 worker 接管后预热隶书；其他字体和插画随实际使用缓存，音乐需播放后缓存。因此首次访问不等于全书资源已全部离线可用。插画放在 `site/images/`，并在 `site/poems.js` 对应诗作的 `image`、`imageAlt` 字段登记；替换插画时同步递增图片 URL 的 `v=art-N`，让 PWA 读者及时拿到新版。
- 改动页面骨架（例如 `styles.css` 的结构）时，把 `sw.js` 顶部的 `CACHE` 升一版，老读者的离线副本才会更新。

“添加到主屏幕”的操作在 Android Chrome 是菜单里的「安装应用／添加到主屏幕」，在 iOS Safari 是分享菜单里的「添加到主屏幕」。
