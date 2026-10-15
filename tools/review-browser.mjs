/* Development-only browser checks. No package is shipped to the static book.
   Set PLAYWRIGHT_MODULE to an existing Playwright installation if necessary. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = resolve(process.argv[2] || 'artifacts/artbook-review');
const base = process.argv[3] || 'http://127.0.0.1:8014/';
const site = new URL('../site/', import.meta.url);
const source = { window: {} };
vm.runInNewContext(await readFile(new URL('poems.js', site), 'utf8'), source);
vm.runInNewContext(await readFile(new URL('review-data.js', site), 'utf8'), source);
vm.runInNewContext(await readFile(new URL('edition.js', site), 'utf8'), source);
const review = process.argv[4] === 'review';
const documentName = review ? 'design-review.html' : 'index.html';
const editionGlobal = review ? 'ARTBOOK_REVIEW' : 'ARTBOOK_EDITION';
const { POEMS, MATTER } = source.window;
const edition = source.window[editionGlobal];
const selected = POEMS.filter(poem => !edition.poemIds || edition.poemIds.includes(poem.id)).map(poem => review ? { ...poem, image:undefined, ...edition.artwork[poem.id] } : poem);
const artBase = review ? 'images/review/' : 'images/';
const leaves = ['cover', ...MATTER.front.map(item => item.id)];
for (const poem of selected) {
  if (poem.image) leaves.push(`${poem.id}-image`);
  leaves.push(...['zh', 'en', 'fr'].map(language => `${poem.id}-${language}`));
}
leaves.push(...MATTER.back.map(item => item.id));
const results = [];
const screenshots = [];
const errors = [];
function leafLabel(hash) {
  if (hash === 'cover') return '封面';
  const item = [...MATTER.front, ...MATTER.back].find(item => item.id === hash);
  if (item) return item.nav || item.label;
  const poem = selected.find(poem => hash.startsWith(`${poem.id}-`));
  const suffix = hash.split('-').pop();
  return `${poem.titles.zh} · ${{image:'插圖',zh:'中文',en:'English',fr:'Français'}[suffix] || suffix}`;
}
await mkdir(output, { recursive: true });
const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge', headless: true } : { headless: true });
const newContext = browser.newContext.bind(browser);
browser.newContext = async options => {
  const context = await newContext(options);
  context.setDefaultTimeout(12000);
  context.setDefaultNavigationTimeout(30000);
  return context;
};
const contexts = [];
let subpathServer;

async function open(context, hash = 'cover', origin = base) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}${documentName}#${hash}`);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(name => window[name].version, editionGlobal), edition.version);
  for (const selector of ['link[href*="styles.css"]', `script[src*="${review ? 'review-data.js' : 'edition.js'}"]`, 'script[src*="reader.js"]', 'script[src*="poems.js"]']) {
    const url = await page.locator(selector).evaluate(element => element.src || element.href);
    assert.equal(new URL(url).searchParams.get('v'), edition.version);
  }
  return page;
}
async function go(page, hash) {
  await page.evaluate(hash => { location.hash = hash; }, hash);
  await page.waitForFunction(hash => location.hash === `#${hash}` && document.querySelector('#book-page').childElementCount > 0, hash);
  // A hash assignment is synchronous; hashchange renders on the next task.
  await page.waitForFunction(hash => {
    const poemId = hash.replace(/-(?:zh|en|fr|notes|image)$/, '');
    if (hash.endsWith('-notes')) return !!document.getElementById(`notes-${poemId}`);
    if (hash.endsWith('-image')) return document.querySelector('.illustration-art')?.getAttribute('src').includes(`${poemId}.svg`);
    if (/-(zh|en|fr)$/.test(hash)) return document.querySelector('.poem-title')?.textContent === window.POEMS.find(poem => poem.id === poemId).titles[hash.slice(-2)];
    return document.querySelector('#book-page').classList.contains(hash === 'cover' ? 'cover-page' : `matter-${hash}`);
  }, hash);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { await Promise.all([...document.querySelectorAll('#book-page img')].map(img => img.decode())); });
}
async function geometry(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const info = await page.evaluate(() => {
    const rect = element => { const r = element.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
    const paper = document.querySelector('#book-page');
    return {
      height: innerHeight, width: innerWidth,
      footer: rect(document.querySelector('.page-controls')),
      toolbar: rect(document.querySelector('.book-toolbar')),
      paper: rect(paper), overflow: paper.scrollWidth - paper.clientWidth,
      buttons: [...document.querySelectorAll('button')].filter(button => button.getClientRects().length).map(button => ({ label: button.getAttribute('aria-label') || button.textContent, ...rect(button) })),
      bodySize: parseFloat(getComputedStyle(document.querySelector('.poem-body') || paper).fontSize),
      noteSize: document.querySelector('.annotation-text') && parseFloat(getComputedStyle(document.querySelector('.annotation-text')).fontSize),
      seals: document.querySelectorAll('#book-page .seal').length,
      art: paper.querySelector('.illustration-frame') && rect(paper.querySelector('.illustration-frame')),
      animation: getComputedStyle(paper).animationDuration
    };
  });
  assert.ok(info.footer.bottom <= info.height + 1, 'footer stays in viewport');
  assert.ok(info.footer.top >= info.paper.bottom - 1, 'paper ends above footer');
  assert.ok(info.toolbar.bottom <= info.paper.top + 1, 'paper begins below toolbar');
  if (info.overflow > 1) {
    await page.screenshot({path:resolve(output,'overflow-debug.png')});
    console.log(await page.locator('#book-page *').evaluateAll(elements => elements.map(element => ({tag:element.tagName, cls:element.className, width:element.getBoundingClientRect().width, left:element.getBoundingClientRect().left, scroll:element.scrollWidth, client:element.clientWidth})).filter(element=>element.scroll>element.client+1)));
  }
  assert.ok(info.overflow <= 1, `${page.url()}: no horizontal text clipping (overflow ${info.overflow}px)`);
  if (info.art) {
    assert.ok(info.art.left >= info.paper.left - 1 && info.art.right <= info.paper.right + 1, 'artwork stays inside page width');
    assert.ok(info.art.top >= info.paper.top - 1 && info.art.bottom <= info.paper.bottom + 1, 'artwork stays inside page height');
  }
  for (const button of info.buttons) {
    assert.ok(button.width >= 43.9 && button.height >= 43.9, `${button.label}: 44px touch area (${button.width} × ${button.height})`);
  }
  return info;
}
async function shot(page, name, label) {
  const filename = `${name}.png`;
  await page.screenshot({ path: resolve(output, filename), fullPage: true, animations: 'disabled' });
  screenshots.push({ filename, label });
}

try {
  for (const [width, height] of [[390,844], [430,932], [1440,900]]) {
    console.log(`Checking ${documentName}: ${leaves.length} leaves at ${width}x${height}`);
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 760, reducedMotion: 'reduce' });
    contexts.push(context);
    const page = await open(context);
    await go(page, 'cover');
    const size = `${width}x${height}`;
    for (const hash of leaves) {
      await go(page, hash);
      const info = await geometry(page);
      if (/-(?:image)$/.test(hash) || hash === 'cover') assert.equal(info.seals, 1, 'one seal per painting');
      else assert.equal(info.seals, 0);
      if (/-(?:zh|en|fr)$/.test(hash)) {
        const language = hash.slice(-2);
        const poem = selected.find(poem => hash === `${poem.id}-${language}`);
        assert.equal(await page.locator('.poem-body').textContent(), poem.verses[language], 'source verses unchanged');
        assert.equal(await page.locator('.poem-title').textContent(), poem.titles[language]);
        const meta = typeof poem.meta === 'string' ? (language === 'zh' ? poem.meta : '') : poem.meta?.[language];
        assert.equal(await page.locator('.poem-meta').evaluateAll(elements => elements[0]?.textContent || ''), meta || '', 'date and attribution unchanged');
        if (poem.masthead?.[language]) assert.equal(await page.locator('.poem-masthead').textContent(), poem.masthead[language]);
        if (language === 'zh') assert.ok(info.bodySize >= 27, 'Chinese font is never reduced to fit');
        else assert.equal(info.bodySize, 23, 'Latin body remains 23px at every viewport');
        const note = typeof poem.note === 'string' ? (language === 'zh' ? poem.note : '') : poem.note?.[language];
        if (note) {
          assert.equal(await page.locator('.annotation-text').textContent(), note);
          assert.equal(await page.locator('.annotation-text').getAttribute('lang'), language === 'zh' ? 'zh-Hant' : language);
          assert.equal(await page.locator('.annotation-folio').textContent(), String(poem.page + (typeof poem.note === 'string' ? 3 : ['zh', 'en', 'fr'].indexOf(language))).padStart(2, '0'));
          assert.equal(info.noteSize, 22);
        }
      }
    }
    // Continuous button turns must visit every leaf in both directions.
    await go(page, 'cover');
    for (const hash of leaves.slice(1)) {
      await page.locator('#next').click();
      assert.equal(new URL(page.url()).hash, `#${hash}`);
    }
    assert.equal(await page.locator('#next').isDisabled(), true);
    for (const hash of leaves.slice(0, -1).reverse()) {
      await page.locator('#previous').click();
      assert.equal(new URL(page.url()).hash, `#${hash}`);
    }
    assert.equal(await page.locator('#previous').isDisabled(), true);

    for (const hash of ['cover', ...selected.filter(poem => poem.image).map(poem => `${poem.id}-image`), 'jiaolong-zh', 'sleeping-lotus-en', 'yuanxi-stroll-fr', 'double-ninth-song-fr', 'farewell-song-zh', 'foreword']) {
      await go(page, hash);
      await shot(page, `${size}-${hash}`, `${size} · ${leafLabel(hash)}`);
    }
    await go(page, 'double-fifth-notes');
    await geometry(page);
    await shot(page, `${size}-double-fifth-notes`, `${size} · 話端午註釋深連結`);
    await page.locator('#book-page').evaluate(element => { element.scrollTop = element.scrollHeight; });
    const bottom = await page.locator('.annotation-text').evaluate(element => element.getBoundingClientRect().bottom);
    const paperBottom = await page.locator('#book-page').evaluate(element => element.getBoundingClientRect().bottom);
    assert.ok(bottom <= paperBottom + 1, 'last line of long annotation is reachable');
    await geometry(page);
    await shot(page, `${size}-notes-bottom`, `${size} · 長註釋末行`);

    await page.locator('#toc-open').click();
    assert.equal(await page.locator('#toc-dialog').evaluate(element => element.open), true);
    await geometry(page);
    await shot(page, `${size}-contents`, `${size} · 目錄`);
    await page.locator('#toc-close').click();
    await page.locator('#toc-open').click();
    await page.locator('#contents-list li').first().locator('button[lang="fr"]').click();
    assert.equal(new URL(page.url()).hash, '#jiaolong-fr');
    assert.equal(await page.locator('#toc-dialog').evaluate(element => element.open), false);
    await page.locator('.language-nav button[lang="en"]').click();
    assert.equal(new URL(page.url()).hash, '#jiaolong-en');
    await page.keyboard.press('ArrowRight');
    assert.equal(new URL(page.url()).hash, '#jiaolong-fr');
    await page.keyboard.press('ArrowLeft');
    assert.equal(new URL(page.url()).hash, '#jiaolong-en');
    assert.equal(await page.locator('#book-page').evaluate(element => getComputedStyle(element).animationName), 'none');

    // The same music control is available at every width; automatic playback
    // remains mobile-only and explicit pause must survive a page turn.
    await page.locator('#ambient-audio').evaluate(element => element.pause());
    await page.locator('#music-toggle').click();
    await page.waitForFunction(() => !document.querySelector('#ambient-audio').paused);
    assert.equal(await page.locator('#music-toggle').getAttribute('aria-pressed'), 'true');
    await page.locator('#music-toggle').click();
    await page.locator('#next').click();
    assert.equal(await page.locator('#ambient-audio').evaluate(element => element.paused), true);
    assert.equal(await page.locator('#music-toggle').getAttribute('aria-pressed'), 'false');

    // Vertical reading must not change the leaf. Synthetic horizontal pointers
    // check the handler; native touch and Safari cancellation need device QA.
    await go(page, 'double-fifth-zh');
    const hashBeforeScroll = new URL(page.url()).hash;
    await page.locator('#book-page').evaluate(element => { element.scrollTop = 300; });
    assert.equal(new URL(page.url()).hash, hashBeforeScroll);
    await page.locator('#reading').dispatchEvent('pointerdown', { pointerId:1, pointerType:'touch', clientX:300, clientY:300 });
    await page.locator('#reading').dispatchEvent('pointerup', { pointerId:1, pointerType:'touch', clientX:100, clientY:310 });
    assert.equal(new URL(page.url()).hash, '#double-fifth-en');
    // Recheck the fixed bars after resize and a landscape round-trip.
    await page.setViewportSize({ width:height, height:width });
    await geometry(page);
    await page.setViewportSize({ width, height });
    await geometry(page);
    results.push(`${size}：${leaves.length} 個閱讀頁、原文、觸控區、連續翻頁、註釋、目錄、語言、鍵盤、滑動事件、音樂、橫豎切換及減少動態效果檢查通過。`);
    await context.close();
  }

  console.log('Checking font failure, slow network and offline upgrade');
  const fallback = await browser.newContext({ viewport:{width:390,height:844}, serviceWorkers:'block' });
  contexts.push(fallback);
  await fallback.route('**/fonts/**', route => route.abort());
  const fallbackPage = await open(fallback, 'double-ninth-song-fr');
  await geometry(fallbackPage);
  await shot(fallbackPage, '390x844-font-fallback', '390×844 · 字體請求失敗');
  await go(fallbackPage, 'farewell-song-zh');
  await geometry(fallbackPage);
  await shot(fallbackPage, '390x844-chinese-fallback', '390×844 · 中文字體回退');
  results.push('字體失敗：中文與法文可使用系統字體閱讀，沒有水平溢出。');
  await fallback.close();

  const slow = await browser.newContext({ viewport:{width:390,height:844}, serviceWorkers:'block' });
  contexts.push(slow);
  const slowPage = await slow.newPage();
  const cdp = await slow.newCDPSession(slowPage);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline:false, latency:150, downloadThroughput:180*1024, uploadThroughput:80*1024 });
  await slowPage.goto(`${base}${documentName}#jiaolong-zh`, { waitUntil:'domcontentloaded' });
  await geometry(slowPage);
  // Capture the actual fallback frame without Playwright waiting for fonts.
  const slowCapture = await cdp.send('Page.captureScreenshot', {format:'png', captureBeyondViewport:false});
  await writeFile(resolve(output, '390x844-slow-loading.png'), Buffer.from(slowCapture.data, 'base64'));
  screenshots.push({filename:'390x844-slow-loading.png',label:'390×844 · 慢網初始閱讀'});
  await cdp.send('Network.emulateNetworkConditions', { offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1 });
  await slowPage.evaluate(() => document.fonts.ready);
  results.push('慢網：字體載入期間，正文與翻頁按鈕已可使用。');
  await slow.close();

  // Real worker under a project subpath. Start a temporary loopback server so
  // this context has a fresh origin and a genuine old-cache activation cycle.
  const mime = { html:'text/html', js:'text/javascript', css:'text/css', svg:'image/svg+xml', ttf:'font/ttf', otf:'font/otf', webmanifest:'application/manifest+json', png:'image/png', mp3:'audio/mpeg' };
  subpathServer = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith('/ziwei/')) return response.writeHead(404).end();
      const relative = pathname.slice('/ziwei/'.length) || 'index.html';
      const path = new URL(relative, site);
      if (!fileURLToPath(path).startsWith(fileURLToPath(site))) return response.writeHead(403).end();
      response.writeHead(200, {'Content-Type':mime[relative.split('.').pop()] || 'application/octet-stream', 'Cache-Control':'no-cache'}).end(await readFile(path));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => subpathServer.listen(0, '127.0.0.1', resolve));
  const subBase = `http://127.0.0.1:${subpathServer.address().port}/ziwei/`;
  const offline = await browser.newContext({ viewport:{width:430,height:932} });
  contexts.push(offline);
  const offlinePage = await offline.newPage();
  // Fetch the source without rendering, seed an obsolete cache before the
  // first registration, then let the actual new worker install and activate.
  await offlinePage.goto(`${subBase}${artBase}jiaolong.svg`);
  await offlinePage.evaluate(async () => {
    const cache = await caches.open('anxiangji-v44');
    await cache.put('./obsolete-review', new Response('old edition'));
    await caches.open('another-app-v1');
  });
  await offlinePage.goto(`${subBase}${documentName}#cover`);
  await offlinePage.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
  });
  assert.ok(!(await offlinePage.evaluate(() => caches.keys())).includes('anxiangji-v44'), 'old book cache is removed');
  assert.ok((await offlinePage.evaluate(() => caches.keys())).includes('another-app-v1'), 'unrelated app cache survives');
  await offlinePage.waitForFunction(() => document.documentElement.dataset.offline === 'ready', null, {timeout:30000});
  // Prewarming must make the complete edition available before visiting its leaves.
  await offlinePage.goto(`${subBase}index.html#cover`);
  await offlinePage.locator('#book-page h1').waitFor();
  await offlinePage.goto(`${subBase}${documentName}#jiaolong-zh`);
  await offlinePage.evaluate(() => document.fonts.ready);
  await offline.setOffline(true);
  await offlinePage.reload();
  assert.equal(await offlinePage.evaluate(name => window[name].version, editionGlobal), edition.version);
  for (const hash of leaves) await go(offlinePage, hash);
  await geometry(offlinePage);
  await shot(offlinePage, '430x932-offline-subpath', '430×932 · 子路徑離線閱讀');
  await offlinePage.goto(`${subBase}index.html#cover`);
  await offlinePage.locator('#book-page h1').waitFor();
  assert.equal(await offlinePage.evaluate(() => window.ARTBOOK_EDITION.version), edition.version, 'published fallback remains separate');
  await offlinePage.goto(`${subBase}design-review.html#cover`);
  assert.equal(await offlinePage.evaluate(() => window.ARTBOOK_REVIEW.version), edition.version, 'review fallback remains separate');
  await offline.setOffline(false);
  results.push(`離線：/ziwei/ 子路徑資源、舊快取移除、預熱後全部 ${leaves.length} 頁閱讀及正式版／樣板各自的離線入口檢查通過。`);
  await offline.close();

  // Render source vectors at a larger scale for genuine detail inspection.
  const artContext = await browser.newContext({ viewport:{width:1200,height:1440}, deviceScaleFactor:1 });
  contexts.push(artContext);
  const artPage = await artContext.newPage();
  console.log('Rendering artwork details and review gallery');
  const detailCrops = [
    ['cover-branch', [1000,720], [255,320,300,220]],
    ['jiaolong', [760,900], [0,565,360,280]],
    ['sleeping-lotus', [760,900], [220,345,200,180]],
    ['yuanxi-stroll', [760,900], [65,230,230,250]],
    ...(!review ? [
      ['mid-autumn',[760,900],[180,230,360,340]],
      ['double-fifth',[760,900],[60,460,330,330]],
      ['mother-son',[760,900],[40,500,400,320]],
      ['autumn-moon',[760,900],[80,210,440,320]],
      ['double-ninth-song',[760,900],[40,500,360,330]],
      ['farewell-to-green',[760,900],[120,200,370,380]],
      ['cold-clothes-festival',[760,900],[180,430,370,340]],
      ['singing-to-myself',[760,900],[180,440,370,330]],
      ['xiangjiang',[760,900],[300,470,370,330]],
      ['deep-autumn',[760,900],[30,350,380,350]],
      ['farewell-song',[760,900],[0,390,380,350]],
      ['welcoming-grandchild',[760,900],[340,390,220,250]]
    ] : [])
  ];
  for (const [name, box, crop] of detailCrops) {
    const svg = await readFile(new URL(`${artBase}${name}.svg`, site), 'utf8');
    const scale = 1200 / box[0];
    await artPage.setContent(`<style>html,body{margin:0;background:#f7f3e8}svg{display:block;width:1200px;height:${box[1]*scale}px}</style>${svg}`);
    const filename = `${name}-detail.png`;
    await artPage.screenshot({ path:resolve(output, filename), clip:{x:crop[0]*scale,y:crop[1]*scale,width:crop[2]*scale,height:crop[3]*scale} });
    screenshots.push({filename,label:`${name === 'cover-branch' ? '封面' : leafLabel(`${name}-image`)} · 原生矢量局部`});
  }
  await artPage.setViewportSize({width:1560,height:880});
  const boards = [];
  for (const hash of ['cover','jiaolong-image','sleeping-lotus-image','yuanxi-stroll-image']) {
    const png = await readFile(resolve(output, `390x844-${hash}.png`));
    boards.push(`<figure><figcaption>${leafLabel(hash)}</figcaption><img src="data:image/png;base64,${png.toString('base64')}"></figure>`);
  }
  await artPage.setContent(`<style>html,body{margin:0;background:#f7f3e8;color:#263d34}body{display:flex;width:1560px}figure{margin:0;width:390px}figcaption{height:36px;text-align:center;font:17px/36px Georgia,serif}img{display:block;width:390px;height:844px}</style>${boards.join('')}`);
  await artPage.screenshot({path:resolve(output,'overview.png')});
  screenshots.unshift({filename:'overview.png',label:'封面與三幅樣板 · 390×844 整頁並覽'});
  if (!review) {
    const allBoards = [];
    for (const hash of ['cover', ...selected.map(poem => `${poem.id}-image`)]) {
      const png = await readFile(resolve(output, `390x844-${hash}.png`));
      allBoards.push(`<figure><figcaption>${leafLabel(hash)}</figcaption><img src="data:image/png;base64,${png.toString('base64')}"></figure>`);
    }
    await artPage.setViewportSize({width:1300,height:1797});
    await artPage.setContent(`<style>html,body{margin:0;background:#f7f3e8;color:#263d34}body{display:grid;grid-template-columns:repeat(5,260px)}figure{margin:0}figcaption{height:36px;text-align:center;font:17px/36px Georgia,serif}img{display:block;width:260px;height:auto}</style>${allBoards.join('')}`);
    await artPage.screenshot({path:resolve(output,'all-artwork.png'),fullPage:true});
    screenshots.unshift({filename:'all-artwork.png',label:`封面與全部 ${selected.length} 幅插圖 · 整頁並覽`});
  }
  await artContext.close();
  assert.deepEqual(errors, [], 'no page runtime errors');
  results.push(`未發現頁面執行錯誤；${detailCrops.length} 張局部圖均由原始矢量放大渲染。`);
} catch (error) {
  errors.push(error.stack || error.message);
  throw error;
} finally {
  for (const context of contexts) await context.close().catch(() => {});
  await browser.close();
  if (subpathServer) await new Promise(resolve => subpathServer.close(resolve));
  await writeFile(resolve(output, 'checks.json'), JSON.stringify({ version:edition.version, document:documentName, leaves:leaves.length, results, errors, screenshots }, null, 2));
}

const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await writeFile(resolve(output, 'index.html'), `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>暗香集 · 詩畫評審</title><style>body{margin:0;padding:40px;background:#f7f3e8;color:#263d34;font:18px/1.7 Georgia,serif}main{max-width:1440px;margin:auto}h1{font-weight:400}p{max-width:70ch}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px}figure{margin:0}img{width:100%;max-height:800px;object-fit:contain;object-position:top;display:block}figcaption{font-size:15px;margin:12px 0 28px}a{color:inherit}code{font-size:16px}</style><main><h1>暗香集 · 詩畫${review ? '樣板' : '全書'}</h1><p>版本 <code>${edition.version}</code> · ${selected.length} 首詩、${leaves.length} 個閱讀頁。包含三種閱讀尺寸、原生矢量局部及長詩／註釋驗證。點擊圖片可查看原尺寸。</p><p>此處為桌面 Chromium 自動檢查。iPhone Safari、主屏 PWA 的前後台、地址欄和橫豎切換仍待實機複驗；滑動已檢查事件處理，真實觸控待實機評審。</p><ul>${results.map(result=>`<li>${escape(result)}</li>`).join('')}</ul><section>${screenshots.map(({filename,label})=>`<figure><a href="${filename}"><img loading="lazy" src="${filename}" alt="${escape(label)}"></a><figcaption>${escape(label)}</figcaption></figure>`).join('')}</section></main></html>`);
console.log(JSON.stringify({ version:edition.version, checks:results, screenshots:screenshots.length, output }, null, 2));
