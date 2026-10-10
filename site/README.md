# 暗香集网页

此目录即 GitHub Pages 发布的静态站点根目录；完整说明见仓库根目录的 [README.md](../README.md)。

| 文件 | 作用 |
|---|---|
| `poems.js` | 内容数据：`window.POEMS`（诗题、三语诗句、创作日期、注释、插画）与 `window.MATTER`（版权页、献词、题记、前言、后记、作者简介及页码） |
| `reader.js` | 阅读顺序、翻页、目录、深链、离线缓存注册与字体预热 |
| `styles.css` | 版式与字体角色 |
| `index.html` | 页面骨架、应用清单与 iOS 全屏 meta |
| `manifest.webmanifest` | 应用清单（`display: fullscreen`） |
| `sw.js` | 离线外壳：缓存页面骨架与字体、插画、音乐 |
| `icons/` | 印章应用图标（192 / 512 / maskable / apple-touch） |
| `fonts/`、`images/`、`audio/` | 字体、插画、背景音乐 |
| `preview.mjs` | 本地预览服务器 |

资源均使用相对路径，可部署在 GitHub Pages 项目子路径。

诗作插图放在 `images/`，并在对应的 `poems.js` 条目中设置相对路径 `image` 与无障碍描述 `imageAlt`。设置后阅读器会在该诗的三语页面之前生成独立插画页，并在图下用 Poetica Chancery IV 排一行英文题词。

## 本地预览

在仓库根目录运行：

```powershell
node site/preview.mjs
```

然后访问 <http://127.0.0.1:8000>。预览服务器按扩展名发送 MIME（含 `.webmanifest`），字体加载失败时会回退至系统字体。

## 约定

- 改动 `styles.css`、`reader.js`、`poems.js` 后，同步 `index.html` 里的 `?v=ebook-ui-N`。
- 改动页面骨架后，升一版 `sw.js` 顶部的 `CACHE`，否则老读者的离线副本不会更新。
- 字体分工见根目录 README 的「字体」一节；王汉宗中隶书繁的来源与授权说明见 `fonts/` 目录。
