(() => {
  const poems = window.POEMS;
  const labels = { zh: "中文", en: "ENGLISH", fr: "FRANÇAIS" };
  let index = 0;
  let language = "zh";
  const $ = (selector) => document.querySelector(selector);
  const list = $("#contents-list");

  poems.forEach((poem, i) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.index = i;
    const number = document.createElement("span");
    number.textContent = String(i + 1).padStart(2, "0");
    button.append(number, document.createTextNode(poem.titles.zh));
    button.addEventListener("click", () => show(i));
    item.append(button);
    list.append(item);
  });

  function show(nextIndex, animate = true) {
    index = Math.max(0, Math.min(poems.length - 1, nextIndex));
    const poem = poems[index];
    const reader = $(".reader");
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reader.classList.add("turning");
      window.setTimeout(() => reader.classList.remove("turning"), 130);
    }
    $("#poem-title").textContent = poem.titles[language];
    $("#poem-title").lang = language === "zh" ? "zh-Hans" : language;
    $("#poem-body").textContent = poem.verses[language];
    $("#poem-body").lang = language === "zh" ? "zh-Hans" : language;
    $("#language-label").textContent = labels[language];
    $("#language-label").lang = language === "zh" ? "zh-Hans" : language;
    $("#folio").textContent = String(poem.page).padStart(2, "0");
    $("#position").textContent = `${String(index + 1).padStart(2, "0")} / ${String(poems.length).padStart(2, "0")}`;
    $("#poem-meta").textContent = language === "zh" ? (poem.meta || "") : "";
    const note = $("#annotation");
    note.hidden = language !== "zh" || !poem.note;
    note.open = false;
    $("#annotation-text").textContent = poem.note || "";
    document.querySelector(".poem-page").dataset.showNote = String(language === "zh" && Boolean(poem.note));
    document.documentElement.lang = language === "zh" ? "zh-Hans" : language;
    $("#previous").disabled = index === 0;
    $("#next").disabled = index === poems.length - 1;
    document.querySelectorAll(".contents button").forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-language]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === language)));
    history.replaceState(null, "", `#${poem.id}-${language}`);
  }

  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => { language = button.dataset.language; show(index); }));
  const searchInput = $("#search-input");
  const searchResults = $("#search-results");
  function search() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    searchResults.replaceChildren();
    if (!query) return;
    const matches = [];
    poems.forEach((poem, poemIndex) => {
      for (const code of ["zh", "en", "fr"]) {
        if (`${poem.titles[code]} ${poem.verses[code]} ${code === "zh" ? poem.note || "" : ""}`.toLocaleLowerCase().includes(query)) {
          matches.push({ poemIndex, code, title: poem.titles[code] });
        }
      }
    });
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = "未找到相关诗句";
      searchResults.append(empty);
      return;
    }
    matches.forEach(({ poemIndex, code, title }) => {
      const button = document.createElement("button");
      button.type = "button";
      const languageName = { zh: "中文", en: "English", fr: "Français" }[code];
      const languageTag = document.createElement("span");
      languageTag.textContent = `${languageName} · `;
      button.append(languageTag, document.createTextNode(title));
      button.addEventListener("click", () => {
        language = code;
        searchResults.replaceChildren();
        searchInput.value = "";
        show(poemIndex);
      });
      searchResults.append(button);
    });
  }
  $("#search-form").addEventListener("submit", (event) => { event.preventDefault(); search(); searchResults.querySelector("button")?.focus(); });
  searchInput.addEventListener("input", search);
  $("#previous").addEventListener("click", () => show(index - 1));
  $("#next").addEventListener("click", () => show(index + 1));
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  const hash = location.hash.slice(1).match(/^([a-z-]+)-(zh|en|fr)$/);
  if (hash) {
    const found = poems.findIndex((poem) => poem.id === hash[1]);
    if (found >= 0) index = found;
    language = hash[2];
  }
  show(index, false);
})();
