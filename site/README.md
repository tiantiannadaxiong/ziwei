# 暗香集網頁

本目錄是 GitHub Pages 的靜態站點根目錄，完整說明見 [倉庫 README](../README.md)。

《秋歌》三語正文各六行，中文使用繁體，共同落款為「2024.10.26於香港」，英法頁使用對應語言的日期。中、英、法三語紙本頁碼為 66–68，配 `images/autumn-song.svg`「菊岸秋聲」；入口為 `#autumn-song-image`、`#autumn-song-zh`、`#autumn-song-en`、`#autumn-song-fr`。後記與作者簡介為 69–70。

《長城》三語正文各四行，保留原稿措辭、標點與落款，中文使用繁體「2024.10.26 於香港」。中、英、法三語紙本頁碼為 63–65，配 `images/great-wall.svg`「楓間望古」；入口為 `#great-wall-image`、`#great-wall-zh`、`#great-wall-en`、`#great-wall-fr`。後記與作者簡介為 69–70。

《狂野》三語正文各四行，中文及落款使用繁體「2021.10 於香港屯門」。三語紙本頁碼為 60–62，短註釋與各語言正文同頁。`images/wild.svg`「風雨過簷」的入口為 `#wild-image`、`#wild-zh`、`#wild-en`、`#wild-fr`；`#wild-notes` 直達中文註釋。`note` 支援原有中文單一字串及三語物件，舊註釋的紙本頁碼保持不變。

《讚將》收錄繁體中文六行、英文及法文各十二行，三語紙本頁碼為 57–59 頁，配 `images/praise-generals.svg`「江流英名」；閱讀連結為 `#praise-generals-image`、`#praise-generals-zh`、`#praise-generals-en`、`#praise-generals-fr`。與《西蜀丞相孔明篇》一併統一為繁體中文及「2018.10.30 於香港寶湖」落款。

《西蜀丞相孔明篇》收錄作者提供的三語原文及落款，配 `images/kongming.svg`「羽扇遺芳」。中文、英文、法文分別為紙本 54–56 頁，後記與作者簡介為 66–67 頁；閱讀鏈接為 `#kongming-image`、`#kongming-zh`、`#kongming-en`、`#kongming-fr`。長詩在紙頁內部滾動，沿用現有字號。

正式入口 `index.html` 已採用全書新設計，共 20 首詩、20 幅詩作插圖、87 個閱讀頁。新增《添丁賀》採用中文潤色稿及英法譯文，配「春滿暖巢」原生 SVG 插圖，落款保留「23.6.19於香港寶湖」。`edition.js` 管理資源版；`poems.js` 保留詩文、譯文、日期、注釋及頁碼；`reader.js` 與 `styles.css` 同時供正式版和獨立樣板使用。

全書以王安石《梅花》為設計暗線，呼應母親安靜堅韌的性格。題記使用四句原詩，前後記承接此意；公共版式以暖紙、棕灰墨色、牆角細線和頁眉淡梅相連。各首詩的 SVG、正文與三語意境保持原樣，避免將不同季節和題材都改繪成梅花。

`design-review.html` 通過 `review-data.js` 選取六首詩和三幅插圖，共 28 頁。`review.css`、`review.js` 為舊樣板資源鏈接保留兼容。兩份應用清單提供各自的安裝入口，`sw.js` 保留各自的離線文檔。

在倉庫根目錄執行 `node site/preview.mjs`，訪問 <http://127.0.0.1:8000/>。樣板另有 `preview-review.mjs`，使用 8014 端口。全部資源為相對路徑，支持 GitHub Pages 項目子路徑。

當前資源版本為 `artbook-17`，緩存為 `anxiangji-v61`。更改資源時同步入口 URL 的版本，更改外殼時遞增 `sw.js` 的緩存名。

運行 `node tools/check-artbook.mjs` 檢查全書資源與緩存；已有 Playwright 時，運行 `node tools/review-browser.mjs artifacts/artbook-review http://127.0.0.1:8000/` 生成瀏覽器驗收記錄與截圖。詳情見 [評審記錄](design-review.md)。

插圖位於 `images/`，`image`、`imageAlt`、`sealPosition` 登記于詩作數據。頁面統一添加共享小篆印，SVG 內不重復加印。字體授權及來源見 `fonts/` 中的文本。實體 iPhone Safari 與主屏 PWA 仍待復驗。
