(() => {
  'use strict';
  const edition = window.ARTBOOK_EDITION || window.ARTBOOK_REVIEW;
  const poems = window.POEMS.filter(poem => !edition.poemIds || edition.poemIds.includes(poem.id)).map(poem => edition.artwork ? {
    ...poem, image: undefined, artworkHasSeal: false, ...edition.artwork[poem.id]
  } : { ...poem });
  const matter = window.MATTER;
  const page = document.querySelector('#book-page');
  const stage = document.querySelector('#reading');
  const dialog = document.querySelector('#toc-dialog');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const progress = document.querySelector('#reading-progress');
  const pageFolio = document.querySelector('#page-folio');
  const hint = document.querySelector('#swipe-hint');
  const audio = document.querySelector('#ambient-audio');
  const music = document.querySelector('#music-toggle');
  const mobile = matchMedia('(max-width: 759px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const languages = { zh: '繁體中文', en: 'English', fr: 'Français' };
  const tags = { zh: '中', en: 'EN', fr: 'FR' };
  const langTag = code => code === 'zh' ? 'zh-Hant' : code;
  const sequence = [{ type: 'cover', hash: 'cover' }];
  matter.front.forEach(item => sequence.push({ type: 'matter', item, hash: item.id }));
  poems.forEach(poem => {
    if (poem.image) sequence.push({ type: 'illustration', poem, hash: `${poem.id}-image` });
    for (const language of ['zh', 'en', 'fr']) sequence.push({ type: 'poem', poem, language, hash: `${poem.id}-${language}` });
  });
  matter.back.forEach(item => sequence.push({ type: 'matter', item, hash: item.id }));
  let current = 0;
  let animationTimer = 0;
  let userPausedMusic = false;
  let renderEpoch = 0;
  const artworkSizer = new ResizeObserver(entries => {
    for (const { target: well } of entries) {
      const frame = well.querySelector('.illustration-frame');
      if (!frame) continue;
      const width = Math.max(0, Math.min(well.clientWidth, well.clientHeight * 760 / 900));
      frame.style.width = `${width}px`;
      frame.style.height = `${width * 900 / 760}px`;
    }
  });

  function node(tag, className, text, parent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    if (parent) parent.append(element);
    return element;
  }

  function seal(name, className, parent) {
    const image = node('img', `seal ${className}`, undefined, parent);
    image.src = `${edition.sealBase || './images/'}seal-${name}.svg?v=${edition.version}`;
    image.alt = name === 'ziwei' ? '紫薇小篆印' : '暗香集小篆印';
    image.width = name === 'ziwei' ? 44 : 38;
    image.height = name === 'ziwei' ? 56 : 68;
    return image;
  }

  function makeCover() {
    page.className = 'book-page cover-page';
    const titling = node('div', 'cover-titling', undefined, page);
    node('p', 'cover-kicker', '紫薇 · 三語詩集', titling);
    node('h1', 'cover-title', '暗香集', titling);
    node('p', 'cover-english', 'Whispers of Hidden Fragrance', titling).lang = 'en';
    node('p', 'cover-french', 'Parfums secrets', titling).lang = 'fr';
    const plate = node('figure', 'cover-plate', undefined, page);
    const image = node('img', '', undefined, plate);
    image.src = edition.cover;
    image.alt = '暖白院牆轉角前，幾枝梅迎寒綻放，粉白花瓣與珊瑚花苞映著杏金冬光。';
    image.decoding = 'async';
    const author = node('div', 'cover-author', undefined, page);
    const epigraph = node('p', 'cover-epigraph', undefined, author);
    for (const line of ['牆角數枝梅，', '凌寒獨自開。', '遙知不是雪，', '為有暗香來。']) {
      node('span', 'cover-verse', line, epigraph);
    }
    const signature = node('div', 'author-signature', undefined, author);
    seal('ziwei', 'author-seal', signature);
    node('p', 'signature', 'Ziwei', signature).lang = 'en';
  }

  function languageNav(poem, language, parent) {
    const nav = node('nav', 'language-nav', undefined, parent);
    nav.setAttribute('aria-label', '同一首詩的語言版本');
    for (const code of ['zh', 'en', 'fr']) {
      const button = node('button', '', tags[code], nav);
      button.type = 'button';
      button.lang = langTag(code);
      button.setAttribute('aria-current', String(code === language));
      button.setAttribute('aria-label', `${languages[code]}：${poem.titles[code]}`);
      button.addEventListener('click', () => go(`${poem.id}-${code}`));
    }
  }

  function makePoem({ poem, language }) {
    page.className = `book-page poem-page lang-${language}`;
    page.lang = langTag(language);
    const running = node('div', 'page-running-head', undefined, page);
    const languageAndFolio = node('div', '', undefined, running);
    node('span', 'page-language', languages[language], languageAndFolio);
    const folio = node('span', 'page-print-folio', ` · ${String(poem.page + ['zh', 'en', 'fr'].indexOf(language)).padStart(2, '0')}`, languageAndFolio);
    folio.setAttribute('aria-label', `紙本第 ${poem.page + ['zh', 'en', 'fr'].indexOf(language)} 頁`);
    languageNav(poem, language, running);
    const content = node('div', 'poem-content', undefined, page);
    const heading = node('header', 'poem-heading', undefined, content);
    if (poem.masthead?.[language]) node('p', 'poem-masthead', poem.masthead[language], heading);
    node('h1', 'poem-title', poem.titles[language], heading).lang = langTag(language);
    const body = node('p', 'poem-body', undefined, content);
    body.lang = langTag(language);
    // Keep the author's line breaks as real text; a hanging continuation only
    // affects naturally wrapped lines, not the words or stanza structure.
    poem.verses[language].split('\n').forEach((line, index, lines) => {
      node('span', `verse-line${line ? '' : ' stanza-space'}`, line, body);
      if (index < lines.length - 1) body.append(document.createTextNode('\n'));
    });
    const meta = typeof poem.meta === 'string' ? (language === 'zh' ? poem.meta : '') : poem.meta?.[language];
    if (meta) node('p', 'poem-meta', meta, content).lang = langTag(language);
    if (language === 'zh' && poem.note) {
      const notes = node('section', 'annotation-section', undefined, content);
      notes.id = `notes-${poem.id}`;
      notes.setAttribute('aria-labelledby', `${notes.id}-title`);
      const header = node('header', 'annotation-header', undefined, notes);
      node('h2', 'annotation-title', '中文註釋', header).id = `${notes.id}-title`;
      node('span', 'annotation-folio', String(poem.page + 3).padStart(2, '0'), header);
      node('p', 'annotation-text', poem.note, notes).lang = 'zh-Hant';
    }
  }

  function makeIllustration({ poem }) {
    page.className = 'book-page illustration-page';
    node('div', 'illustration-heading', '插圖', page);
    node('h1', 'illustration-title', poem.titles.zh, page);
    const figure = node('figure', 'illustration-figure', undefined, page);
    const well = node('div', 'illustration-well', undefined, figure);
    const frame = node('div', 'illustration-frame', undefined, well);
    const image = node('img', 'illustration-art', undefined, frame);
    image.src = poem.image;
    image.alt = poem.imageAlt;
    image.width = 760;
    image.height = 900;
    image.decoding = 'async';
    const stamp = seal('anxiangji', 'illustration-seal', frame);
    const position = poem.sealPosition || { x: 86, y: 84 };
    stamp.style.setProperty('--seal-x', `${position.x}%`);
    stamp.style.setProperty('--seal-y', `${position.y}%`);
    artworkSizer.observe(well);
    node('figcaption', 'illustration-epigraph', poem.titles.en, figure).lang = 'en';
  }

  function makeMatter({ item }) {
    page.className = `book-page matter-page matter-${item.id}`;
    if (item.folio) {
      const header = node('div', 'page-running-head', undefined, page);
      node('span', '', '暗香集', header);
      node('span', 'page-print-folio', item.folio, header);
    }
    const content = node('div', 'matter-content', undefined, page);
    if (item.label) {
      node('p', 'matter-index', item.folio || '', content);
      node('h1', 'matter-title', item.label, content);
    }
    node('p', 'matter-text', item.body, content);
  }

  function render({ animate = false, direction = 1, notes = false } = {}) {
    const epoch = ++renderEpoch;
    clearTimeout(animationTimer);
    artworkSizer.disconnect();
    page.replaceChildren();
    page.removeAttribute('lang');
    const entry = sequence[current];
    if (entry.type === 'cover') makeCover();
    else if (entry.type === 'poem') makePoem(entry);
    else if (entry.type === 'illustration') makeIllustration(entry);
    else makeMatter(entry);
    page.scrollTop = 0;
    if (animate && !reducedMotion.matches) {
      const className = direction < 0 ? 'page-turn-backward' : 'page-turn-forward';
      page.classList.add(className);
      animationTimer = setTimeout(() => page.classList.remove(className), 220);
    }
    previous.disabled = current === 0;
    next.disabled = current === sequence.length - 1;
    progress.textContent = current === 0 ? '開卷' : `${String(current).padStart(2, '0')} / ${sequence.length - 1}`;
    progress.style.fontFamily = current === 0 ? 'var(--support)' : '';
    const folio = entry.type === 'poem'
      ? entry.poem.page + ['zh', 'en', 'fr'].indexOf(entry.language)
      : entry.item?.folio;
    pageFolio.textContent = entry.type === 'cover' ? '封面'
      : entry.type === 'illustration' ? `${entry.poem.titles.zh} · 插圖`
      : folio ? `第 ${folio} 頁` : '版權';
    hint.textContent = current === 0 ? '左右滑動，開始閱讀' : '左右滑動翻頁';
    document.documentElement.lang = entry.language ? langTag(entry.language) : 'zh-Hant';
    history.replaceState(null, '', `#${notes ? `${entry.poem.id}-notes` : entry.hash}`);
    if (notes) {
      const alignNotes = () => {
        if (renderEpoch !== epoch) return;
        const annotation = page.querySelector('.annotation-section');
        if (annotation) {
          page.scrollTop += annotation.getBoundingClientRect().top - page.getBoundingClientRect().top - 24;
          pageFolio.textContent = `第 ${entry.poem.page + 3} 頁 · 中文註釋`;
        }
      };
      alignNotes();
      document.fonts?.ready.then(alignNotes);
    }
    const upcoming = sequence[current + 1];
    if (upcoming?.type === 'illustration') {
      const preload = new Image();
      preload.src = upcoming.poem.image;
    }
  }

  function go(hash, focus = true) {
    const notes = hash.endsWith('-notes');
    const targetHash = notes ? hash.replace(/-notes$/, '-zh') : hash;
    const target = sequence.findIndex(entry => entry.hash === targetHash);
    current = target >= 0 ? target : 0;
    if (dialog.open) dialog.close();
    render({ notes: notes && target >= 0 });
    if (focus) page.focus({ preventScroll: true });
  }

  function turn(direction) {
    const target = Math.max(0, Math.min(sequence.length - 1, current + direction));
    if (target === current) return;
    current = target;
    render({ animate: true, direction });
  }

  page.addEventListener('scroll', () => {
    const entry = sequence[current];
    if (entry.type !== 'poem' || entry.language !== 'zh' || !entry.poem.note) return;
    const annotation = page.querySelector('.annotation-section');
    const readingNotes = annotation.getBoundingClientRect().top < page.getBoundingClientRect().top + page.clientHeight * .45;
    pageFolio.textContent = readingNotes ? `第 ${entry.poem.page + 3} 頁 · 中文註釋` : `第 ${entry.poem.page} 頁`;
  }, { passive: true });

  function contentsButton(text, parent, hash, className = '') {
    const button = node('button', className, text, parent);
    button.type = 'button';
    button.addEventListener('click', () => go(hash));
    return button;
  }
  const matterList = document.querySelector('#matter-list');
  contentsButton('封面', matterList, 'cover');
  [...matter.front, ...matter.back].forEach(item => contentsButton(item.nav || item.label, matterList, item.id));
  const contents = document.querySelector('#contents-list');
  for (const poem of poems) {
    const item = node('li', '', undefined, contents);
    contentsButton(poem.titles.zh, item, `${poem.id}-zh`, 'toc-title-button');
    const links = node('div', 'toc-links', undefined, item);
    for (const language of ['zh', 'en', 'fr']) {
      contentsButton(languages[language], links, `${poem.id}-${language}`).lang = langTag(language);
    }
    if (poem.image) contentsButton('插圖', links, `${poem.id}-image`, 'toc-art');
  }
  document.querySelector('#toc-open').addEventListener('click', () => dialog.showModal());
  document.querySelector('#toc-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  document.addEventListener('keydown', event => {
    if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      turn(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  addEventListener('hashchange', () => go(location.hash.slice(1), false));

  // Single-finger horizontal page turns coexist with native vertical reading.
  // Multi-touch never turns a page; Safari pinch gestures remain disabled.
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(type, event => event.preventDefault(), { passive: false });
  const pointers = new Set();
  let touchStart = null;
  stage.addEventListener('pointerdown', event => {
    pointers.add(event.pointerId);
    if (pointers.size > 1 || event.target.closest('button,a') || (event.pointerType === 'mouse' && event.button !== 0)) {
      touchStart = null;
      return;
    }
    touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  stage.addEventListener('pointerup', event => {
    pointers.delete(event.pointerId);
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3 && !getSelection()?.toString()) turn(dx < 0 ? 1 : -1);
    touchStart = null;
  });
  for (const type of ['pointercancel', 'lostpointercapture']) stage.addEventListener(type, event => {
    pointers.delete(event.pointerId);
    touchStart = null;
  });

  function updateMusic() {
    const playing = !audio.paused && !audio.ended;
    music.setAttribute('aria-pressed', String(playing));
    music.setAttribute('aria-label', playing ? '暫停背景音樂' : '播放背景音樂');
  }
  async function playMusic(manual = false) {
    if ((!manual && !mobile.matches) || userPausedMusic) return;
    try { await audio.play(); } catch { /* Retry on the first reader interaction. */ }
    updateMusic();
  }
  audio.volume = .32;
  audio.addEventListener('play', updateMusic);
  audio.addEventListener('pause', updateMusic);
  music.addEventListener('click', () => {
    userPausedMusic = !audio.paused;
    if (userPausedMusic) audio.pause();
    else playMusic(true);
    updateMusic();
  });
  document.addEventListener('pointerdown', event => {
    if (audio.paused && !event.target.closest('#music-toggle')) playMusic();
  }, { passive: true });
  mobile.addEventListener('change', () => {
    if (!mobile.matches) audio.pause();
    else playMusic();
    updateMusic();
  });
  updateMusic();
  playMusic();

  go(location.hash.slice(1) || 'cover', false);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').then(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
      await document.fonts?.ready;
      // The first document can load its fonts before the worker takes control.
      // Request them once through the active worker, along with all plates, so
      // a complete downloaded edition is readable without visiting every leaf.
      document.documentElement.dataset.offline = 'preparing';
      const resources = [
        edition.cover, ...poems.map(poem => poem.image).filter(Boolean),
        ...['ziwei', 'anxiangji'].map(name => `${edition.sealBase || './images/'}seal-${name}.svg?v=${edition.version}`),
        './fonts/LXGWWenKaiTC-Regular.ttf', './fonts/HanWangLiSuMedium-TC.ttf?v=1',
        './fonts/Alegreya-Regular.otf', './fonts/Alegreya-Italic.otf',
        './fonts/PoeticaStd.otf', './fonts/Poetica-RomanSmallCaps.otf',
        './fonts/Poetica Chancery IV Regular.otf', './fonts/Bickham Script Pro 3 Bold.otf'
      ];
      const loaded = await Promise.allSettled(resources.map(async url => {
        const response = await fetch(url, { priority: 'low' });
        if (!response.ok) throw new Error('Resource unavailable');
      }));
      document.documentElement.dataset.offline = loaded.every(result => result.status === 'fulfilled') ? 'ready' : 'partial';
    }).catch(() => { document.documentElement.dataset.offline = 'partial'; });
  }

  // Preserve the current deep link when a newer edition has been deployed.
  let checking = false;
  async function checkEdition() {
    if (checking || !navigator.onLine) return;
    checking = true;
    try {
      const response = await fetch(edition.document || './index.html', { cache: 'no-store' });
      if (!response.ok) return;
      const latest = new DOMParser().parseFromString(await response.text(), 'text/html');
      for (const selector of ['link[href*="styles.css"]', 'script[src*="poems.js"]', 'script[src*="edition.js"]', 'script[src*="review-data.js"]', 'script[src*="reader.js"]']) {
        const live = document.querySelector(selector);
        const fresh = latest.querySelector(selector);
        if (live && fresh && (live.getAttribute('src') || live.getAttribute('href')) !== (fresh.getAttribute('src') || fresh.getAttribute('href'))) {
          location.reload();
          return;
        }
      }
    } catch { /* Preserve offline reading. */ }
    finally { checking = false; }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkEdition(); });
  addEventListener('pageshow', event => { if (event.persisted) checkEdition(); });
})();
