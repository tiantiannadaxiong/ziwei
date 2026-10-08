(() => {
  const poems = window.POEMS;
  const page = document.querySelector("#book-page");
  const progress = document.querySelector("#reading-progress");
  const hint = document.querySelector("#swipe-hint");
  const previous = document.querySelector("#previous");
  const next = document.querySelector("#next");
  const dialog = document.querySelector("#toc-dialog");
  const languageNames = { zh: "中文", en: "English", fr: "Français" };
  const languageTags = { zh: "中文", en: "EN", fr: "FR" };
  const sequence = [{ type: "cover" }];

  poems.forEach((poem) => {
    ["zh", "en", "fr"].forEach((language) => sequence.push({ type: "poem", poem, language }));
    if (poem.note) sequence.push({ type: "note", poem, language: "zh" });
  });

  let current = 0;
  let touchStart = null;
  let animationTimer = 0;

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
    appendText("p", "cover-kicker", "三语诗集 · A TRILINGUAL COLLECTION", coverInner);
    appendText("h1", "cover-title", "暗香集", coverInner);
    appendText("p", "cover-english", "Whispers of Hidden Fragrance", coverInner);
    const branch = document.createElement("div");
    branch.className = "cover-branch";
    branch.setAttribute("aria-hidden", "true");
    branch.innerHTML = '<svg viewBox="0 0 240 150" role="presentation"><path d="M18 128C73 106 92 71 128 45c22-16 47-18 88-25M89 85c-5-21-1-37 12-49m26 10c-2-18 4-29 15-39m-48 67c-19-5-34-2-47 7m88-34c15 0 27 7 36 20"/><path class="water-line" d="M32 139c46-12 82-11 127-4m-83 12c42-8 76-7 111-1"/><circle cx="192" cy="44" r="20"/></svg>';
    coverInner.append(branch);
    const seal = appendText("span", "cover-seal", "紫薇", coverInner);
    seal.setAttribute("aria-label", "作者紫薇");
    appendText("p", "cover-author", "紫薇 · Ziwei", coverInner);
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

  function makeNote(item) {
    const { poem } = item;
    page.className = "book-page note-page";
    page.replaceChildren();
    const header = document.createElement("div");
    header.className = "page-running-head";
    appendText("span", "page-language", "中文注释", header).lang = "zh-Hans";
    appendText("span", "page-print-folio", String(poem.page + 3).padStart(2, "0"), header);
    page.append(header);
    const content = document.createElement("div");
    content.className = "note-content";
    appendText("p", "eyebrow", "NOTES · 中文注释", content);
    appendText("h1", "poem-title", poem.titles.zh, content).lang = "zh-Hans";
    appendText("p", "annotation-text", poem.note, content).lang = "zh-Hans";
    page.append(content);
  }

  function render({ animate = true } = {}) {
    const item = sequence[current];
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      page.classList.add("page-turning");
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => page.classList.remove("page-turning"), 190);
    } else page.classList.remove("page-turning");
    if (item.type === "cover") makeCover();
    else if (item.type === "poem") makePoem(item);
    else makeNote(item);

    const onCover = current === 0;
    progress.textContent = onCover ? "封面" : `${String(current).padStart(2, "0")} / ${String(sequence.length - 1).padStart(2, "0")}`;
    hint.textContent = onCover ? "左右滑动，开始阅读" : "左右滑动翻页";
    previous.disabled = onCover;
    next.disabled = current === sequence.length - 1;
    document.documentElement.lang = item.language === "en" || item.language === "fr" ? item.language : "zh-Hans";
    const poem = item.poem;
    if (poem) history.replaceState(null, "", `#${poem.id}-${item.type === "note" ? "notes" : item.language}`);
    else history.replaceState(null, "", location.pathname);
  }

  function turn(direction) {
    const target = Math.max(0, Math.min(sequence.length - 1, current + direction));
    if (target === current) return;
    current = target;
    render();
  }

  function goToPoem(id, language = "zh") {
    const target = sequence.findIndex((item) => item.type === "poem" && item.poem.id === id && item.language === language);
    if (target >= 0) {
      current = target;
      render({ animate: false });
      if (dialog.open) dialog.close();
      page.focus({ preventScroll: true });
    }
  }

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
    if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) return;
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

  const match = location.hash.slice(1).match(/^([a-z-]+)-(zh|en|fr)$/);
  if (match && poems.some((poem) => poem.id === match[1])) {
    const target = sequence.findIndex((item) => item.type === "poem" && item.poem.id === match[1] && item.language === match[2]);
    if (target >= 0) current = target;
  }
  render({ animate: false });
})();
