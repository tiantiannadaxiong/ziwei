# 暗香集网页

本目录是 GitHub Pages 的静态站点根目录，完整说明见 [仓库 README](../README.md)。

正式入口 `index.html` 已采用全书新设计，共 15 首诗、15 幅诗作插图、67 个阅读页。新增《添丁賀》采用中文润色稿及英法译文，配「春滿暖巢」原生 SVG 插图，落款保留「23.6.19於香港寶湖」。`edition.js` 管理资源版；`poems.js` 保留诗文、译文、日期、注释及页码；`reader.js` 与 `styles.css` 同时供正式版和独立样板使用。

`design-review.html` 通过 `review-data.js` 选取六首诗和三幅插图，共 28 页。`review.css`、`review.js` 为旧样板资源链接保留兼容。两份应用清单提供各自的安装入口，`sw.js` 保留各自的离线文档。

在仓库根目录执行 `node site/preview.mjs`，访问 <http://127.0.0.1:8000/>。样板另有 `preview-review.mjs`，使用 8014 端口。全部资源为相对路径，支持 GitHub Pages 项目子路径。

当前资源版本为 `artbook-9`，缓存为 `anxiangji-v53`。更改资源时同步入口 URL 的版本，更改外壳时递增 `sw.js` 的缓存名。

运行 `node tools/check-artbook.mjs` 检查全书资源与缓存；已有 Playwright 时，运行 `node tools/review-browser.mjs artifacts/artbook-review http://127.0.0.1:8000/` 生成浏览器验收记录与截图。详情见 [评审记录](design-review.md)。

插图位于 `images/`，`image`、`imageAlt`、`sealPosition` 登记于诗作数据。页面统一添加共享小篆印，SVG 内不重复加印。字体授权及来源见 `fonts/` 中的文本。实体 iPhone Safari 与主屏 PWA 仍待复验。
