# 《暗香集》三语诗集

静态 HTML、CSS 和 JavaScript 艺术书，部署在 GitHub Pages，可安装到手机主屏离线阅读。全书设计取意王安石《梅花》，以「凌寒独自开」的坚韧和「为有暗香来」的含蓄呼应母亲的性格。暖纸、梅枝般的棕灰墨色、墙角形细线和页眉一朵淡梅贯穿阅读，作为安静的暗线；15 首诗及其原生 SVG 插图各自保留原有意境。

题记采用《梅花》四句，前言与后记呼应母亲的坚韧与温柔。封面不放题诗，以曲折向上、疏密相间的老梅和淡淡院墙重新构图，保留书名、译名及作者印与签名。诗作正文、三语译文、注释、日期、印章位置与纸本页码均保留。

## 阅读与字体

封面 → 版权页 → 献词 → 题记 → 前言 → 各诗（独立插图、中文、英文、法文）→ 后记 → 作者简介，共 **67 个阅读页**。中文注释与原诗同页滚动，原有诗作的纸本页码保持不变；新增《添丁賀》中、英、法三语为 51–53 页，后记与作者简介顺延至 54–55 页；插图不占纸本页码。《添丁賀》按要求采用中文润色稿及英法译文，落款保留「23.6.19於香港寶湖」。

手机和桌面均为单页阅读，正文在中间纸页滚动，顶部目录、音乐、进度及底部翻页按钮常驻。支持左右滑动、方向键、按钮翻页、语言切换和深链接；减少动态效果设置下关闭翻页动画。音乐仅在窄屏尝试自动播放，浏览器可能要求首次操作后才能播放。

| 用途 | 字体与字号 |
|---|---|
| 中文诗句 | 王汉宗中隶书繁（HanWang LiSu），手机 27px、桌面 29px，行高 1.8 |
| 中文诗题、封面书名 | 王汉宗中隶书繁（HanWang LiSu） |
| 中文注释 | LXGW WenKai TC，22px，行高 1.85 |
| 英法诗句 | Alegreya，23px，行高 1.65 |
| 英法诗题 | 较大字号 Alegreya |
| 封面译名 | Poetica Std |
| 英法语种标签、页眉小标题 | Poetica Roman Small Capitals |
| 插图短英文题词 | Poetica Chancery IV |
| 封面英文签名 | Bickham Script Pro 3 Bold |
| 日期、辅助文字 | 至少 15px |

字体文件及授权文本位于 `site/fonts/`。Alegreya 与文楷 TC 使用 SIL Open Font License；隶书为 GPL 字体；全字库说文解字的来源与政府资料开放授权见目录中的 notice；其余字体由作者提供。字体失败时回退至系统字体。

封面只呈现一枚「紫薇」印，插图各一枚「暗香集」印。印文由现有小篆字体提取为共享矢量轮廓，页面统一呈现。`sealPosition: { x, y }` 表示印章中心在画幅中的百分比位置。绘画不嵌入位图，不依赖外部图片、字体或持续运行的复杂滤镜。

## 文件

| 路径 | 作用 |
|---|---|
| `site/poems.js` | `window.POEMS` 与 `window.MATTER`：原始内容、页码、插图和印位 |
| `site/edition.js` | 正式版封面、资源版本与共享印章路径 |
| `site/reader.js`、`site/styles.css` | 两个入口共用的阅读交互与版式 |
| `site/index.html` | 全书正式入口 |
| `site/design-review.html`、`site/review-data.js` | 六首诗、三幅插图的独立样板入口，共 28 页 |
| `site/review.js`、`site/review.css` | 已保存的旧样板资源链接的兼容入口 |
| `site/manifest.webmanifest`、`site/review.webmanifest` | 全书与样板的安装入口 |
| `site/sw.js`、`site/icons/` | 离线缓存与应用图标 |
| `site/fonts/`、`site/images/`、`site/audio/` | 本地字体、SVG 与背景音乐 |
| `tools/build-review-seals.mjs` | 从现有小篆字体重新提取样板共享印章 |
| `tools/check-artbook.mjs` | 全书资源、版本、矢量及离线缓存回归检查 |
| `tools/review-browser.mjs` | 开发用浏览器验收与截图图集，默认检查正式版 |

## 本地预览与验收

在仓库根目录执行 `node site/preview.mjs`，打开 <http://127.0.0.1:8000/>。独立样板可执行 `node site/preview-review.mjs`，打开 <http://127.0.0.1:8014/design-review.html>；独立端口可区分旧 PWA 缓存。预览服务器提供正确的字体、SVG 和应用清单 MIME 类型。

深链接示例：`#cover`、`#jiaolong-image`、`#jiaolong-zh`、`#jiaolong-en`、`#jiaolong-fr`、`#double-fifth-notes`、`#farewell-song-zh`、`#afterword`、`#about`。有注释的诗支持 `-notes` 链接。

```powershell
node tools/check-artbook.mjs
node tools/review-browser.mjs artifacts/artbook-review http://127.0.0.1:8000/
# 检查独立样板：
node tools/review-browser.mjs artifacts/artbook-sample http://127.0.0.1:8000/ review
```

浏览器工具需已有 Playwright，必要时通过 `PLAYWRIGHT_MODULE` 指向已有包，Windows 使用已安装的 Edge；仅用于开发，网站没有新增运行依赖。输出目录包含整页截图、绘画局部、`index.html` 图集和 `checks.json` 验收记录；`artifacts/` 不纳入版本管理。当前资源版为 `artbook-12`，离线缓存为 `anxiangji-v56`；检查结果和实体设备待复验范围见 [评审记录](site/design-review.md)。

## 发布与离线

`.github/workflows/jekyll-gh-pages.yml` 在推送到 `main` 后将 `site/` 发布为静态 GitHub Pages，Pages 来源需设为 **GitHub Actions**。资源均为相对路径，支持项目子路径。更改样式、脚本或图片时同步对应 URL 的资源版本；更改页面外壳时递增 `sw.js` 中的 `CACHE`。

页面、脚本与样式网络优先，字体、图片、音乐按 URL 缓存。首次加载在 worker 接管后预热全书字体与插图，全部下载成功后才具有完整离线资源；慢网、下载失败或存储不足时可能仅部分可用。音乐需播放后缓存。正式版和样板各自保留离线文档；升级只清理《暗香集》的旧缓存。返回前台时检查页面资源版本，发现新版后保留当前深链接刷新。

Android 使用菜单中的「安装应用／添加到主屏幕」；iOS Safari 使用分享菜单中的「添加到主屏幕」。应用清单采用 fullscreen，iOS 回退至 standalone。沿用已有 iPhone 高度处理；Safari 和主屏 PWA 的前后台恢复、地址栏变化及横竖切换仍需实体 iPhone 复验。
