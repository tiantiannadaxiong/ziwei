(() => {
  const poems = window.POEMS;
  const matter = window.MATTER ?? { front: [], back: [] };
  const page = document.querySelector("#book-page");
  const progress = document.querySelector("#reading-progress");
  const hint = document.querySelector("#swipe-hint");
  const previous = document.querySelector("#previous");
  const next = document.querySelector("#next");
  const dialog = document.querySelector("#toc-dialog");
  const ambientAudio = document.querySelector("#ambient-audio");
  const musicToggle = document.querySelector("#music-toggle");
  const mobileViewport = window.matchMedia("(max-width: 759px)");
  const languageNames = { zh: "中文", en: "English", fr: "Français" };
  const languageTags = { zh: "中文", en: "EN", fr: "FR" };
  const sequence = [{ type: "cover" }];

  matter.front.forEach((item) => sequence.push({ type: "matter", item }));
  poems.forEach((poem) => {
    if (poem.image) sequence.push({ type: "illustration", poem });
    ["zh", "en", "fr"].forEach((language) => sequence.push({ type: "poem", poem, language }));
  });
  matter.back.forEach((item) => sequence.push({ type: "matter", item }));

  let current = 0;
  let touchStart = null;
  let animationTimer = 0;
  let userPausedMusic = false;

  function updateMusicControl() {
    const playing = !ambientAudio.paused && !ambientAudio.ended;
    musicToggle.hidden = !mobileViewport.matches;
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
    musicToggle.title = playing ? "暂停背景音乐" : "播放背景音乐";
    musicToggle.firstElementChild.textContent = playing ? "♫" : "♪";
  }

  async function playAmbientMusic() {
    if (!mobileViewport.matches) return false;
    try {
      await ambientAudio.play();
      updateMusicControl();
      return true;
    } catch {
      updateMusicControl();
      return false;
    }
  }

  ambientAudio.volume = 0.32;
  ambientAudio.addEventListener("play", updateMusicControl);
  ambientAudio.addEventListener("pause", updateMusicControl);
  musicToggle.addEventListener("click", () => {
    if (ambientAudio.paused) {
      userPausedMusic = false;
      playAmbientMusic();
    } else {
      userPausedMusic = true;
      ambientAudio.pause();
      updateMusicControl();
    }
  });
  mobileViewport.addEventListener("change", (event) => {
    updateMusicControl();
    if (event.matches && !userPausedMusic) playAmbientMusic();
    else if (!event.matches) ambientAudio.pause();
  });
  document.addEventListener("pointerdown", (event) => {
    if (mobileViewport.matches && !userPausedMusic && ambientAudio.paused && !event.target.closest("#music-toggle")) playAmbientMusic();
  }, { capture: true });
  updateMusicControl();
  if (mobileViewport.matches) playAmbientMusic();

  const appendText = (tag, className, value, parent = page) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    parent.append(node);
    return node;
  };

  function makeCover() {
    page.className = "book-page cover-page";
    page.replaceChildren();
    const coverInner = document.createElement("div");
    coverInner.className = "cover-inner";
    const coverArt = document.createElement("img");
    coverArt.className = "cover-art";
    coverArt.src = "./images/cover.png?v=2";
    coverArt.alt = "月色下的梅枝、远山与水纹水墨画";
    coverArt.decoding = "async";
    coverArt.loading = "eager";
    coverInner.append(coverArt);
    appendText("h1", "visually-hidden", "暗香集", coverInner);
    appendText("p", "visually-hidden", "作者：紫薇", coverInner);
    page.append(coverInner);
  }

  function makePoem(item) {
    const { poem, language } = item;
    page.className = `book-page poem-page lang-${language}`;
    page.replaceChildren();
    const header = document.createElement("div");
    header.className = "page-running-head";
    appendText("span", "page-language", languageNames[language], header).lang = language === "zh" ? "zh-Hans" : language;
    appendText("span", "page-print-folio", String(poem.page + ["zh", "en", "fr"].indexOf(language)).padStart(2, "0"), header);
    page.append(header);
    const content = document.createElement("div");
    content.className = "poem-content";
    appendText("h1", "poem-title", poem.titles[language], content).lang = language === "zh" ? "zh-Hans" : language;
    const rule = document.createElement("div");
    rule.className = "title-rule";
    rule.setAttribute("aria-hidden", "true");
    content.append(rule);
    appendText("p", "poem-body", poem.verses[language], content).lang = language === "zh" ? "zh-Hans" : language;
    if (language === "zh" && poem.meta) appendText("p", "poem-meta", poem.meta, content);
    if (language === "zh" && poem.note) {
      const annotation = document.createElement("section");
      annotation.className = "annotation-section";
      annotation.id = `notes-${poem.id}`;
      const annotationHeader = document.createElement("div");
      annotationHeader.className = "annotation-header";
      const annotationTitle = appendText("h2", "annotation-title", "中文注释", annotationHeader);
      annotationTitle.id = `${annotation.id}-title`;
      annotationTitle.lang = "zh-Hans";
      annotation.setAttribute("aria-labelledby", annotationTitle.id);
      appendText("span", "annotation-folio", String(poem.page + 3).padStart(2, "0"), annotationHeader);
      annotation.append(annotationHeader);
      appendText("p", "annotation-text", poem.note, annotation).lang = "zh-Hans";
      content.append(annotation);
    }
    page.append(content);
    const languageNav = document.createElement("nav");
    languageNav.className = "page-languages";
    languageNav.setAttribute("aria-label", "同一首诗的其他语言版本");
    ["zh", "en", "fr"].forEach((code) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = languageTags[code];
      button.lang = code === "zh" ? "zh-Hans" : code;
      button.setAttribute("aria-label", `${languageNames[code]}：${poem.titles[code]}`);
      button.setAttribute("aria-current", String(code === language));
      button.addEventListener("click", () => goToPoem(poem.id, code));
      languageNav.append(button);
    });
    page.append(languageNav);
  }

  function makeIllustration(item) {
    const { poem } = item;
    page.className = "book-page illustration-page";
    page.replaceChildren();
    const header = document.createElement("div");
    header.className = "page-running-head illustration-heading";
    appendText("span", "page-language", "插画", header).lang = "zh-Hans";
    appendText("span", "illustration-mark", "ILLUSTRATION", header);
    page.append(header);

    const figure = document.createElement("figure");
    figure.className = "illustration-figure";
    const image = document.createElement("img");
    image.className = "illustration-art";
    image.src = poem.image;
    image.alt = poem.imageAlt || poem.titles.zh;
    image.decoding = "async";
    image.loading = "eager";
    figure.append(image);
    appendText("p", "illustration-epigraph", poem.titles.en, figure).lang = "en";
    appendText("figcaption", "illustration-caption", poem.titles.zh, figure).lang = "zh-Hans";
    page.append(figure);
  }

  function makeMatter(item) {
    page.className = `book-page matter-page matter-${item.id}`;
    page.replaceChildren();
    if (item.folio) {
      const header = document.createElement("div");
      header.className = "page-running-head";
      appendText("span", "page-language", item.label || "", header).lang = "zh-Hans";
      appendText("span", "page-print-folio", item.folio, header);
      page.append(header);
    }
    const content = document.createElement("div");
    content.className = "matter-content";
    if (item.label) {
      const mark = document.createElement("span");
      mark.className = "matter-mark";
      mark.setAttribute("aria-hidden", "true");
      content.append(mark);
      appendText("h1", "matter-title", item.label, content).lang = "zh-Hans";
      const rule = document.createElement("div");
      rule.className = "matter-rule";
      rule.setAttribute("aria-hidden", "true");
      content.append(rule);
    }
    appendText("p", "matter-text", item.body, content).lang = "zh-Hans";
    page.append(content);
  }

  function render({ animate = true, direction = 1 } = {}) {
    const item = sequence[current];
    window.clearTimeout(animationTimer);
    page.scrollTop = 0;
    page.classList.remove("page-turning-forward", "page-turning-backward");
    if (item.type === "cover") makeCover();
    else if (item.type === "matter") makeMatter(item.item);
    else if (item.type === "illustration") makeIllustration(item);
    else if (item.type === "poem") makePoem(item);
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const turnClass = direction < 0 ? "page-turning-backward" : "page-turning-forward";
      page.classList.add(turnClass);
      animationTimer = window.setTimeout(() => page.classList.remove(turnClass), 320);
    }

    const onCover = current === 0;
    progress.textContent = onCover ? "封面" : `${String(current).padStart(2, "0")} / ${String(sequence.length - 1).padStart(2, "0")}`;
    hint.textContent = onCover ? "左右滑动，开始阅读" : "左右滑动翻页";
    previous.disabled = onCover;
    next.disabled = current === sequence.length - 1;
    document.documentElement.lang = item.language === "en" || item.language === "fr" ? item.language : "zh-Hans";
    const poem = item.poem;
    if (poem) {
      const suffix = item.type === "illustration" ? "image" : item.language;
      history.replaceState(null, "", `#${poem.id}-${suffix}`);
    }
    else if (item.type === "matter") history.replaceState(null, "", `#${item.item.id}`);
    else history.replaceState(null, "", "#cover");
  }

  function turn(direction) {
    const target = Math.max(0, Math.min(sequence.length - 1, current + direction));
    if (target === current) return;
    current = target;
    render({ direction });
  }

  function showPage(target) {
    if (target < 0 || target >= sequence.length) return;
    current = target;
    render({ animate: false });
    if (dialog.open) dialog.close();
    page.focus({ preventScroll: true });
  }

  function goToPoem(id, language = "zh") {
    showPage(sequence.findIndex((item) => item.type === "poem" && item.poem.id === id && item.language === language));
  }

  function goToMatter(id) {
    showPage(sequence.findIndex((item) => item.type === "matter" && item.item.id === id));
  }

  // The title page doubles as the cover, so it opens the contents list.
  const matterList = document.querySelector("#matter-list");
  const coverEntry = document.createElement("button");
  coverEntry.type = "button";
  coverEntry.textContent = "封面";
  coverEntry.lang = "zh-Hans";
  coverEntry.addEventListener("click", () => showPage(sequence.findIndex((item) => item.type === "cover")));
  matterList.append(coverEntry);

  [...matter.front, ...matter.back].forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = entry.nav || entry.label;
    button.lang = "zh-Hans";
    button.addEventListener("click", () => goToMatter(entry.id));
    matterList.append(button);
  });

  poems.forEach((poem) => {
    const item = document.createElement("li");
    const title = document.createElement("p");
    title.className = "toc-poem-title";
    title.textContent = poem.titles.zh;
    item.append(title);
    const links = document.createElement("div");
    links.className = "toc-languages";
    ["zh", "en", "fr"].forEach((language) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = languageNames[language];
      button.lang = language === "zh" ? "zh-Hans" : language;
      button.addEventListener("click", () => goToPoem(poem.id, language));
      links.append(button);
    });
    item.append(links);
    document.querySelector("#contents-list").append(item);
  });

  document.querySelector("#toc-open").addEventListener("click", () => dialog.showModal());
  document.querySelector("#toc-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  previous.addEventListener("click", () => turn(-1));
  next.addEventListener("click", () => turn(1));
  document.addEventListener("keydown", (event) => {
    if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (event.key === "ArrowLeft") turn(-1);
    if (event.key === "ArrowRight") turn(1);
    if (event.key === "Escape" && dialog.open) dialog.close();
  });
  const stage = document.querySelector("#reading");
  stage.addEventListener("pointerdown", (event) => { touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; });
  stage.addEventListener("pointerup", (event) => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) turn(dx < 0 ? 1 : -1);
    touchStart = null;
  });
  stage.addEventListener("pointercancel", () => { touchStart = null; });

  const hash = location.hash.slice(1);
  const matterTarget = sequence.findIndex((item) => item.type === "matter" && item.item.id === hash);
  const match = hash.match(/^([a-z-]+)-(zh|en|fr|notes|image)$/);
  if (hash === "cover") {
    current = 0;
  } else if (matterTarget >= 0) {
    current = matterTarget;
  } else if (match && poems.some((poem) => poem.id === match[1])) {
    const target = sequence.findIndex((item) => {
      if (!item.poem || item.poem.id !== match[1]) return false;
      if (match[2] === "image") return item.type === "illustration";
      if (match[2] === "notes") return item.type === "poem" && item.language === "zh";
      return item.type === "poem" && item.language === match[2];
    });
    if (target >= 0) current = target;
  }
  render({ animate: false });
  if (match?.[2] === "notes") {
    page.querySelector(`#notes-${match[1]}`)?.scrollIntoView({ block: "start" });
    history.replaceState(null, "", `#${match[1]}-notes`);
  }

  // Copy every declared @font-face into the offline cache. By the time the
  // worker controls the page these files are already in the HTTP cache, so this
  // usually moves bytes rather than downloading them again.
  async function warmFontCache() {
    const urls = new Set();
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        if (typeof CSSFontFaceRule !== "function" || !(rule instanceof CSSFontFaceRule)) continue;
        for (const match of rule.style.src.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
          urls.add(new URL(match[1], sheet.href).href);
        }
      }
    }
    await Promise.all([...urls].map((url) => fetch(url, { cache: "force-cache" }).catch(() => {})));
  }

  // Register the offline shell; failures are fine, the reader works online anyway.
  // Register the offline shell; failures are fine, the reader works online anyway.
  // The warm-up waits for control rather than `ready`, which only settles once
  // the page is already being served by an active worker.
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
    if (navigator.serviceWorker.controller) warmFontCache();
    else navigator.serviceWorker.addEventListener("controllerchange", () => warmFontCache(), { once: true });
  }

  // Mobile PWAs can resume an old document from memory without navigating.
  // Compare the deployed asset URLs on return and reload only when the edition
  // changed; the current reading page is preserved in the URL hash.
  let wasHidden = false;
  let updateCheckInProgress = false;
  async function checkForNewEdition() {
    if (!navigator.onLine || updateCheckInProgress) return;
    updateCheckInProgress = true;
    try {
      const response = await fetch("./index.html", { cache: "no-store" });
      if (!response.ok) return;
      const latestDocument = new DOMParser().parseFromString(await response.text(), "text/html");
      const assetSelectors = [
        'link[rel="stylesheet"][href*="styles.css"]',
        'script[src*="poems.js"]',
        'script[src*="reader.js"]'
      ];
      const deployedAssets = assetSelectors.map((selector) => latestDocument.querySelector(selector)?.getAttribute("href")
        ?? latestDocument.querySelector(selector)?.getAttribute("src") ?? "");
      const loadedAssets = assetSelectors.map((selector) => document.querySelector(selector)?.getAttribute("href")
        ?? document.querySelector(selector)?.getAttribute("src") ?? "");
      if (deployedAssets.some((asset, index) => asset !== loadedAssets[index])) location.reload();
    } catch {
      // Keep the current reading session if the network is unavailable.
    } finally {
      updateCheckInProgress = false;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      wasHidden = true;
    } else if (wasHidden) {
      wasHidden = false;
      checkForNewEdition();
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) checkForNewEdition();
  });
})();
