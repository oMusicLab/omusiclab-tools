(function (global) {
  "use strict";

  var OML_LANDING_URL = "https://omusiclab-landingpage.vercel.app/";

  var EXTERNAL_ICON_SVG =
    '<svg class="oml-hub-external-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
    '<polyline points="15 3 21 3 21 9"/>' +
    '<line x1="10" y1="14" x2="21" y2="3"/>' +
    "</svg>";

  var CHORD_DIAGRAM_LEGACY_URL =
    "https://musictools.chiedimla.com/chord-diagram-generator/";

  var CHEVRON_SVG =
    '<svg class="oml-hub-disclosure-chevron" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';

  var SIDEBAR_TOGGLE_ICON =
    '<svg class="oml-hub-sidebar-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect class="oml-hub-sidebar-toggle-frame" x="3" y="4" width="18" height="16" rx="2.25"/>' +
    '<rect class="oml-hub-sidebar-toggle-fill" x="4" y="5" width="5.5" height="14" rx="1.25"/>' +
    '<path class="oml-hub-sidebar-toggle-rail" d="M9.5 4v16"/>' +
    '<g class="oml-hub-sidebar-toggle-chevron-wrap">' +
    '<path class="oml-hub-sidebar-toggle-chevron" d="M12.25 9.25 10.25 12l2 2.75"/>' +
    "</g>" +
    "</svg>";

  function initSidebarToggleIcon(btn) {
    if (!btn.querySelector(".oml-hub-sidebar-toggle-icon")) {
      btn.innerHTML = SIDEBAR_TOGGLE_ICON;
    }
  }

  function setSidebarToggleIcon(btn, collapsed) {
    initSidebarToggleIcon(btn);
    btn.classList.toggle("oml-hub-sidebar-toggle--collapsed", collapsed);
  }

  var CATEGORIES = [
    {
      label: "Practice",
      items: [
        {
          id: "metronome",
          name: "Metronome",
          href: "virtual-metronome/",
          desc: "Tempo, tap tempo, and beats per measure",
        },
        {
          id: "tuner",
          name: "Tuner",
          href: "virtual-tuner/",
          desc: "Guitar, ukulele, and violin · mic pitch & cents",
        },
      ],
    },
    {
      label: "Charts & chords",
      items: [
        {
          id: "chord-transposer",
          name: "Chord Transposer",
          href: "virtual-chord-transposer/",
          desc: "Transpose charts · OML or Open-SL detection",
        },
      ],
    },
  ];

  var LEGACY_ITEMS = [
    {
      id: "chord-diagram-v2",
      name: "Chord Diagram Generator v2",
      href: "legacy/chord-diagram-generator-v2/",
    },
    {
      id: "chord-diagram",
      name: "Chord Diagram Generator",
      href: CHORD_DIAGRAM_LEGACY_URL,
      external: true,
      legacyPath: "legacy/chord-diagram-generator/",
    },
    {
      id: "scale-generator",
      name: "Scale Generator",
      href: "legacy/scale-generator/",
    },
    {
      id: "tabs-generator-v2",
      name: "Tabs Generator v2",
      href: "legacy/tabs-generator-v2/",
    },
    {
      id: "tabs-generator",
      name: "Tabs Generator",
      href: "legacy/tabs-generator/",
    },
    {
      id: "piano",
      name: "Virtual Piano",
      href: "legacy/piano/",
    },
  ];

  function isEmbedMode() {
    return global.OMLEmbed && global.OMLEmbed.isEmbedMode();
  }

  function getScriptBase() {
    var scripts = global.document.querySelectorAll('script[src*="oml-hub.js"]');
    if (!scripts.length) return "./";
    var src = scripts[scripts.length - 1].getAttribute("src") || "";
    var resolved = new URL(src, global.location.href);
    return resolved.href.slice(0, resolved.href.lastIndexOf("shared/oml-hub.js"));
  }

  function normalizePath(pathname) {
    var p = pathname || "/";
    if (!p.endsWith("/")) {
      var slash = p.lastIndexOf("/");
      p = slash >= 0 ? p.slice(0, slash + 1) : "/";
    }
    return p;
  }

  function resolveHref(base, href) {
    return new URL(href, base).pathname;
  }

  function itemLocalPath(base, item) {
    if (item.external) {
      if (!item.legacyPath) return null;
      return normalizePath(new URL(item.legacyPath, base).pathname);
    }
    return normalizePath(resolveHref(base, item.href));
  }

  function getCurrentToolId(base) {
    var current = normalizePath(global.location.pathname);
    var homePath = normalizePath(new URL("./", base).pathname);
    if (current === homePath) return "home";

    var i;
    var j;
    var cat;
    var item;
    var path;

    for (i = 0; i < CATEGORIES.length; i++) {
      cat = CATEGORIES[i];
      for (j = 0; j < cat.items.length; j++) {
        item = cat.items[j];
        path = normalizePath(resolveHref(base, item.href));
        if (current === path || current.indexOf(path) === 0) return item.id;
      }
    }

    for (i = 0; i < LEGACY_ITEMS.length; i++) {
      item = LEGACY_ITEMS[i];
      path = itemLocalPath(base, item);
      if (path && (current === path || current.indexOf(path) === 0)) return item.id;
    }

    return null;
  }

  function isLegacyActive(base) {
    var current = normalizePath(global.location.pathname);
    var i;
    var path;
    for (i = 0; i < LEGACY_ITEMS.length; i++) {
      path = itemLocalPath(base, LEGACY_ITEMS[i]);
      if (path && (current === path || current.indexOf(path) === 0)) return true;
    }
    return false;
  }

  function el(tag, className, text) {
    var node = global.document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildNavLink(base, item, activeId) {
    var link = el("a", item.external ? "oml-hub-link oml-hub-link--external" : "oml-hub-link");
    if (item.external) {
      link.href = item.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.href = new URL(item.href, base).pathname;
    }
    link.appendChild(el("span", null, item.name));
    if (item.external) {
      link.insertAdjacentHTML("beforeend", EXTERNAL_ICON_SVG);
      link.appendChild(el("span", "oml-hub-visually-hidden", " (opens in new tab)"));
    }
    if (activeId === item.id) {
      link.setAttribute("aria-current", "page");
    }
    return link;
  }

  function buildSidebar(base, activeId) {
    var sidebar = el("aside", "oml-hub-sidebar");
    sidebar.setAttribute("aria-label", "Tools navigation");

    var head = el("div", "oml-hub-sidebar-head");
    var brandWrap = el("div", "oml-hub-sidebar-brand");
    var brand = el("a", "oml-hub-brand");
    brand.href = OML_LANDING_URL;
    brand.setAttribute("aria-label", "omusiclab tools — home");
    brand.innerHTML =
      global.OMLLogoMark && global.OMLLogoMark.svg
        ? global.OMLLogoMark.svg
        : "";
    brandWrap.appendChild(brand);
    head.appendChild(brandWrap);

    var collapseBtn = el("button", "oml-hub-icon-btn oml-hub-sidebar-toggle");
    collapseBtn.type = "button";
    collapseBtn.setAttribute("aria-label", "Collapse sidebar");
    initSidebarToggleIcon(collapseBtn);
    head.appendChild(collapseBtn);
    sidebar.appendChild(head);

    var nav = el("nav", "oml-hub-nav");
    nav.setAttribute("aria-label", "Primary");

    var homeLink = el("a", "oml-hub-link");
    homeLink.href = new URL("./", base).pathname;
    homeLink.appendChild(el("span", null, "Home"));
    if (activeId === "home") homeLink.setAttribute("aria-current", "page");
    nav.appendChild(homeLink);

    var i;
    var j;
    var section;
    var label;
    var cat;

    for (i = 0; i < CATEGORIES.length; i++) {
      cat = CATEGORIES[i];
      section = el("div", "oml-hub-section");
      label = el("p", "oml-hub-section-label", cat.label);
      section.appendChild(label);
      for (j = 0; j < cat.items.length; j++) {
        section.appendChild(buildNavLink(base, cat.items[j], activeId));
      }
      nav.appendChild(section);
    }

    var legacyOpen = isLegacyActive(base);
    var disclosure = el("div", "oml-hub-disclosure");
    var toggle = el("button", "oml-hub-nav-btn oml-hub-disclosure-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", legacyOpen ? "true" : "false");
    toggle.setAttribute("aria-controls", "oml-hub-legacy-panel");
    if (legacyOpen) toggle.classList.add("is-open");
    toggle.appendChild(el("span", null, "Legacy"));
    toggle.insertAdjacentHTML("beforeend", CHEVRON_SVG);
    if (legacyOpen) {
      var chevron = toggle.querySelector(".oml-hub-disclosure-chevron");
      if (chevron) chevron.classList.add("is-open");
    }
    disclosure.appendChild(toggle);

    var panel = el("ul", "oml-hub-disclosure-panel");
    panel.id = "oml-hub-legacy-panel";
    if (legacyOpen) panel.classList.add("is-open");
    for (i = 0; i < LEGACY_ITEMS.length; i++) {
      var li = el("li");
      li.appendChild(buildNavLink(base, LEGACY_ITEMS[i], activeId));
      panel.appendChild(li);
    }
    disclosure.appendChild(panel);
    nav.appendChild(disclosure);

    sidebar.appendChild(nav);

    toggle.addEventListener("click", function () {
      var open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var chev = toggle.querySelector(".oml-hub-disclosure-chevron");
      if (chev) chev.classList.toggle("is-open", open);
    });

    return { sidebar: sidebar, collapseBtn: collapseBtn };
  }

  function setCollapsed(shell, sidebar, collapseBtn, collapsed) {
    shell.classList.toggle("oml-hub-shell--sidebar-collapsed", collapsed);
    sidebar.setAttribute("aria-expanded", collapsed ? "false" : "true");
    collapseBtn.setAttribute(
      "aria-label",
      collapsed ? "Expand sidebar" : "Collapse sidebar"
    );
    setSidebarToggleIcon(collapseBtn, collapsed);
    try {
      global.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (e) {}
  }

  function buildWelcomeCards(base) {
    var cards = [];
    var i;
    var j;
    var cat;
    var item;
    for (i = 0; i < CATEGORIES.length; i++) {
      cat = CATEGORIES[i];
      for (j = 0; j < cat.items.length; j++) {
        item = cat.items[j];
        cards.push({
          title: item.name,
          desc: item.desc,
          href: new URL(item.href, base).pathname,
        });
      }
    }
    return cards;
  }

  function renderHomeContent(base) {
    var main = global.document.getElementById("body-container");
    if (!main || main.getAttribute("data-oml-hub-rendered") === "home") return;

    main.setAttribute("data-oml-hub-rendered", "home");
    main.innerHTML = "";

    var title = el("h1", "oml-hub-welcome-title", "Tools");
    var lead = el(
      "p",
      "oml-hub-welcome-lead",
      "Small utilities in the spirit of omusiclab.com — practice aids, chord charts, and archived legacy generators."
    );
    main.appendChild(title);
    main.appendChild(lead);

    var grid = el("div", "oml-hub-card-grid");
    var cards = buildWelcomeCards(base);
    var i;
    for (i = 0; i < cards.length; i++) {
      var card = el("a", "oml-hub-card");
      card.href = cards[i].href;
      card.appendChild(el("h2", "oml-hub-card-title", cards[i].title));
      card.appendChild(el("p", "oml-hub-card-desc", cards[i].desc));
      grid.appendChild(card);
    }
    main.appendChild(grid);
  }

  function initHub() {
    if (isEmbedMode()) return;

    var base = getScriptBase();
    var activeId = getCurrentToolId(base);
    var built = buildSidebar(base, activeId);

    var shell = el("div", "oml-hub-shell");
    shell.appendChild(built.sidebar);

    var mainCol = el("div", "oml-hub-main");
    var nodes = Array.prototype.slice.call(global.document.body.childNodes);
    var n;
    for (var i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.nodeName === "SCRIPT") continue;
      mainCol.appendChild(n);
    }
    shell.appendChild(mainCol);
    global.document.body.appendChild(shell);

    global.document.body.classList.add("oml-has-hub");
    if (activeId === "home") {
      global.document.body.classList.add("oml-hub-home");
      renderHomeContent(base);
    }

    var collapsed = false;
    try {
      collapsed = global.localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {}
    setCollapsed(shell, built.sidebar, built.collapseBtn, collapsed);

    built.collapseBtn.addEventListener("click", function () {
      setCollapsed(
        shell,
        built.sidebar,
        built.collapseBtn,
        !shell.classList.contains("oml-hub-shell--sidebar-collapsed")
      );
    });
  }

  function onReady() {
    initHub();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  global.OMLHub = {
    CATEGORIES: CATEGORIES,
    LEGACY_ITEMS: LEGACY_ITEMS,
  };
})(typeof window !== "undefined" ? window : globalThis);
