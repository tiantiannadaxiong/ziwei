# 《暗香集》三語詩集

靜態 HTML、CSS 和 JavaScript 藝術書，部署在 GitHub Pages，可安裝到手機主屏離線閱讀。全書設計取意王安石《梅花》，以「凌寒獨自開」的堅韌和「為有暗香來」的含蓄呼應母親的性格。暖紙、梅枝般的棕灰墨色、牆角形細線和頁眉一朵淡梅貫穿閱讀，作為安靜的暗線；19 首詩及其原生 SVG 插圖各自保留原有意境。

題記採用《梅花》四句，前言與後記呼應母親的堅韌與溫柔。封面不放題詩，以曲折向上、疏密相間的老梅和淡淡院牆重新構圖，保留書名、譯名及作者印與簽名。詩作正文、三語譯文、注釋、日期、印章位置與紙本頁碼均保留。

新增《西蜀丞相孔明篇》按作者提供的中文七行、英文十四行及法文十四行原文收錄，保留三語落款。配「羽扇遺芳」原生 SVG：近景羽扇、書卷與孤燈，遠處蒼柏、山下祠宇和微星，延續全書的紙白、石青石綠、淺赭及共享小篆印。

新增《讚將》以繁體收錄中文六行、英文及法文各十二行，保留原有措辭、標點、分行與三語落款。配「江流英名」原生 SVG，以長江、戰馬、營旗、長刀、畫戟與溫酒呼應詩意。中文內容統一使用繁體，後續稿件按 `AGENTS.md` 的用字規則處理。

新增《狂野》三語正文各四行，中文轉為繁體，保留三語註釋與落款。配「風雨過簷」原生 SVG，以深墨屋簷、斜雨、受風吹折的秋枝、散葉與積水表現颱風過境。三語短註釋分別位於各語言頁內，不另佔紙本頁碼；英法註釋中的中文同樣使用「圓規」。

新增《長城》以繁體收錄中文四行，英法原文各四行及落款保留。配「楓間望古」原生 SVG：近處紅楓枝葉留出遠望的空隙，長城與烽臺沿青綠山脊起伏，漸次隱入薄霧與紙白。

## 閱讀與字體

封面 → 版權頁 → 獻詞 → 題記 → 前言 → 各詩（獨立插圖、中文、英文、法文）→ 後記 → 作者簡介，共 **83 個閱讀頁**。中文注釋與原詩同頁滾動，原有詩作的紙本頁碼保持不變；新增《添丁賀》中、英、法三語為 51–53 頁，《西蜀丞相孔明篇》中、英、法三語為 54–56 頁，《讚將》中、英、法三語為 57–59 頁，《狂野》中、英、法三語為 60–62 頁，《長城》中、英、法三語為 63–65 頁，後記與作者簡介順延至 66–67 頁；插圖不佔紙本頁碼。《添丁賀》按要求採用中文潤色稿及英法譯文，落款保留「23.6.19於香港寶湖」。

手機和桌面均為單頁閱讀，正文在中間紙頁滾動，頂部目錄、音樂、進度及底部翻頁按鈕常駐。支持左右滑動、方向鍵、按鈕翻頁、語言切換和深鏈接；減少動態效果設置下關閉翻頁動畫。音樂僅在窄屏嘗試自動播放，瀏覽器可能要求首次操作後才能播放。

| 用途 | 字體與字號 |
|---|---|
| 中文詩句 | 王漢宗中隸書繁（HanWang LiSu），手機 27px、桌面 29px，行高 1.8 |
| 中文詩題、封面書名 | 王漢宗中隸書繁（HanWang LiSu） |
| 中文注釋 | LXGW WenKai TC，22px，行高 1.85 |
| 英法詩句 | Alegreya，23px，行高 1.65 |
| 英法詩題 | 較大字號 Alegreya |
| 封面譯名 | Poetica Std |
| 英法語種標簽、頁眉小標題 | Poetica Roman Small Capitals |
| 插圖短英文題詞 | Poetica Chancery IV |
| 封面英文簽名 | Bickham Script Pro 3 Bold |
| 日期、輔助文字 | 至少 15px |

字體文件及授權文本位於 `site/fonts/`。Alegreya 與文楷 TC 使用 SIL Open Font License；隸書為 GPL 字體；全字庫說文解字的來源與政府資料開放授權見目錄中的 notice；其余字體由作者提供。字體失敗時回退至系統字體。

封面只呈現一枚「紫薇」印，插圖各一枚「暗香集」印。印文由現有小篆字體提取為共享矢量輪廓，頁面統一呈現。`sealPosition: { x, y }` 表示印章中心在畫幅中的百分比位置。繪畫不嵌入位圖，不依賴外部圖片、字體或持續運行的復雜濾鏡。

## 文件

| 路徑 | 作用 |
|---|---|
| `site/poems.js` | `window.POEMS` 與 `window.MATTER`：原始內容、頁碼、插圖和印位 |
| `site/edition.js` | 正式版封面、資源版本與共享印章路徑 |
| `site/reader.js`、`site/styles.css` | 兩個入口共用的閱讀交互與版式 |
| `site/index.html` | 全書正式入口 |
| `site/design-review.html`、`site/review-data.js` | 六首詩、三幅插圖的獨立樣板入口，共 28 頁 |
| `site/review.js`、`site/review.css` | 已保存的舊樣板資源鏈接的兼容入口 |
| `site/manifest.webmanifest`、`site/review.webmanifest` | 全書與樣板的安裝入口 |
| `site/sw.js`、`site/icons/` | 離線緩存與應用圖標 |
| `site/fonts/`、`site/images/`、`site/audio/` | 本地字體、SVG 與背景音樂 |
| `tools/build-review-seals.mjs` | 從現有小篆字體重新提取樣板共享印章 |
| `tools/check-artbook.mjs` | 全書資源、版本、矢量及離線緩存回歸檢查 |
| `tools/review-browser.mjs` | 開發用瀏覽器驗收與截圖圖集，默認檢查正式版 |

## 本地預覽與驗收

在倉庫根目錄執行 `node site/preview.mjs`，打開 <http://127.0.0.1:8000/>。獨立樣板可執行 `node site/preview-review.mjs`，打開 <http://127.0.0.1:8014/design-review.html>；獨立端口可區分舊 PWA 緩存。預覽服務器提供正確的字體、SVG 和應用清單 MIME 類型。

深鏈接示例：`#cover`、`#jiaolong-image`、`#jiaolong-zh`、`#jiaolong-en`、`#jiaolong-fr`、`#double-fifth-notes`、`#farewell-song-zh`、`#afterword`、`#about`。有注釋的詩支持 `-notes` 鏈接。

```powershell
node tools/check-artbook.mjs
node tools/review-browser.mjs artifacts/artbook-review http://127.0.0.1:8000/
# 檢查獨立樣板：
node tools/review-browser.mjs artifacts/artbook-sample http://127.0.0.1:8000/ review
```

瀏覽器工具需已有 Playwright，必要時通過 `PLAYWRIGHT_MODULE` 指向已有包，Windows 使用已安裝的 Edge；僅用于開發，網站沒有新增運行依賴。輸出目錄包含整頁截圖、繪畫局部、`index.html` 圖集和 `checks.json` 驗收記錄；`artifacts/` 不納入版本管理。當前資源版為 `artbook-16`，離線緩存為 `anxiangji-v60`；檢查結果和實體設備待復驗範圍見 [評審記錄](site/design-review.md)。

## 發布與離線

`.github/workflows/jekyll-gh-pages.yml` 在推送到 `main` 後將 `site/` 發布為靜態 GitHub Pages，Pages 來源需設為 **GitHub Actions**。資源均為相對路徑，支持項目子路徑。更改樣式、腳本或圖片時同步對應 URL 的資源版本；更改頁面外殼時遞增 `sw.js` 中的 `CACHE`。

頁面、腳本與樣式網絡優先，字體、圖片、音樂按 URL 緩存。首次加載在 worker 接管後預熱全書字體與插圖，全部下載成功後才具有完整離線資源；慢網、下載失敗或存儲不足時可能僅部分可用。音樂需播放後緩存。正式版和樣板各自保留離線文檔；升級只清理《暗香集》的舊緩存。返回前臺時檢查頁面資源版本，發現新版後保留當前深鏈接刷新。

Android 使用菜單中的「安裝應用／添加到主屏幕」；iOS Safari 使用分享菜單中的「添加到主屏幕」。應用清單採用 fullscreen，iOS 回退至 standalone。沿用已有 iPhone 高度處理；Safari 和主屏 PWA 的前後臺恢復、地址欄變化及橫豎切換仍需實體 iPhone 復驗。
