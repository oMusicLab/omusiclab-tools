(function (global) {
  "use strict";

  var OML_LANDING_URL = "https://omusiclab-landingpage.vercel.app/";
  var STORAGE_KEY = "oml-hub-sidebar-collapsed";
  var HISTORY_STATE_KEY = "omlPath";

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

  var MENU_ICON_SVG =
    '<svg class="oml-hub-menu-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  var SHARED_STYLE_MARKERS = ["omusiclab-theme.css", "oml-hub.css"];
  var SHARED_SCRIPT_MARKERS = [
    "oml-logo-mark.js",
    "oml-hub.js",
    "oml-embed.js",
    "oml-embed-snippet.js",
  ];

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

  var MOBILE_TABS = [
    { id: "home", label: "Home", href: "./" },
    { id: "metronome", label: "Metronome", href: "virtual-metronome/" },
    { id: "tuner", label: "Tuner", href: "virtual-tuner/" },
    { id: "chord-transposer", label: "Chords", href: "virtual-chord-transposer/" },
    { id: "more", label: "More", action: "menu" },
  ];

  var router = null;

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

  function getToolIdForPath(base, pathname) {
    var current = normalizePath(pathname);
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

  function getCurrentToolId(base) {
    return getToolIdForPath(base, global.location.pathname);
  }

  function getToolLabel(id) {
    if (id === "home") return "Tools";
    var i;
    var j;
    for (i = 0; i < CATEGORIES.length; i++) {
      for (j = 0; j < CATEGORIES[i].items.length; j++) {
        if (CATEGORIES[i].items[j].id === id) return CATEGORIES[i].items[j].name;
      }
    }
    for (i = 0; i < LEGACY_ITEMS.length; i++) {
      if (LEGACY_ITEMS[i].id === id) return LEGACY_ITEMS[i].name;
    }
    return "Tools";
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

  function isSpaPath(base, pathname) {
    var current = normalizePath(pathname);
    var homePath = normalizePath(new URL("./", base).pathname);
    if (current === homePath) return true;

    var i;
    var j;
    var path;
    for (i = 0; i < CATEGORIES.length; i++) {
      for (j = 0; j < CATEGORIES[i].items.length; j++) {
        path = normalizePath(resolveHref(base, CATEGORIES[i].items[j].href));
        if (current === path || current.indexOf(path) === 0) return true;
      }
    }
    return false;
  }

  function isSharedAsset(href, markers) {
    var i;
    for (i = 0; i < markers.length; i++) {
      if (href.indexOf(markers[i]) !== -1) return true;
    }
    return false;
  }

  function el(tag, className, text) {
    var node = global.document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function initSidebarToggleIcon(btn) {
    if (!btn.querySelector(".oml-hub-sidebar-toggle-icon")) {
      btn.innerHTML = SIDEBAR_TOGGLE_ICON;
    }
  }

  function setSidebarToggleIcon(btn, collapsed) {
    initSidebarToggleIcon(btn);
    btn.classList.toggle("oml-hub-sidebar-toggle--collapsed", collapsed);
  }

  function buildNavLink(base, item, activeId) {
    var link = el("a", item.external ? "oml-hub-link oml-hub-link--external" : "oml-hub-link");
    link.href = item.external
      ? item.href
      : new URL(item.href, base).pathname;
    if (item.external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.setAttribute("data-oml-nav", item.id);
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

    var closeBtn = el("button", "oml-hub-icon-btn oml-hub-drawer-close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.innerHTML = "&times;";
    head.appendChild(closeBtn);

    sidebar.appendChild(head);

    var nav = el("nav", "oml-hub-nav");
    nav.setAttribute("aria-label", "Primary");

    var homeLink = el("a", "oml-hub-link");
    homeLink.href = new URL("./", base).pathname;
    homeLink.setAttribute("data-oml-nav", "home");
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

    return { sidebar: sidebar, collapseBtn: collapseBtn, closeBtn: closeBtn };
  }

  function buildMobileHeader(activeId) {
    var header = el("header", "oml-hub-mobile-header");
    var menuBtn = el("button", "oml-hub-icon-btn oml-hub-menu-btn");
    menuBtn.type = "button";
    menuBtn.setAttribute("aria-label", "Open tools menu");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-controls", "oml-hub-sidebar");
    menuBtn.innerHTML = MENU_ICON_SVG;

    var title = el("h1", "oml-hub-mobile-title", getToolLabel(activeId || "home"));

    header.appendChild(menuBtn);
    header.appendChild(title);
    return { header: header, menuBtn: menuBtn, titleEl: title };
  }

  function buildBottomNav(base, activeId) {
    var nav = el("nav", "oml-hub-bottom-nav");
    nav.setAttribute("aria-label", "Quick navigation");
    var i;
    var tab;
    var btn;

    for (i = 0; i < MOBILE_TABS.length; i++) {
      tab = MOBILE_TABS[i];
      btn = el("button", "oml-hub-bottom-tab");
      btn.type = "button";
      btn.setAttribute("data-oml-tab", tab.id);
      if (tab.action === "menu") {
        btn.setAttribute("aria-label", "More tools");
      } else {
        btn.setAttribute("data-oml-nav", tab.id);
        if (activeId === tab.id) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-current", "page");
        }
      }
      btn.appendChild(el("span", "oml-hub-bottom-tab-label", tab.label));
      nav.appendChild(btn);
    }

    return nav;
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

  function setMobileNavOpen(shell, menuBtn, open) {
    shell.classList.toggle("oml-hub-shell--nav-open", open);
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    global.document.body.classList.toggle("oml-hub-nav-open", open);
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
          id: item.id,
          href: new URL(item.href, base).pathname,
        });
      }
    }
    return cards;
  }

  function renderHomeContent(base) {
    var main = global.document.getElementById("body-container");
    if (!main) return;

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
      card.setAttribute("data-oml-nav", cards[i].id);
      card.appendChild(el("h2", "oml-hub-card-title", cards[i].title));
      card.appendChild(el("p", "oml-hub-card-desc", cards[i].desc));
      grid.appendChild(card);
    }
    main.appendChild(grid);
  }

  function clearToolAssets() {
    global.document
      .querySelectorAll("[data-oml-tool-script]")
      .forEach(function (node) {
        node.parentNode.removeChild(node);
      });
    global.document
      .querySelectorAll("[data-oml-tool-style]")
      .forEach(function (node) {
        node.parentNode.removeChild(node);
      });
  }

  function syncBodyClasses(fromDoc, isHome) {
    var body = global.document.body;
    var preserved = ["oml-has-hub"];
    if (isHome) preserved.push("oml-hub-home");

    var remove = [];
    var i;
    for (i = 0; i < body.classList.length; i++) {
      if (preserved.indexOf(body.classList[i]) === -1) remove.push(body.classList[i]);
    }
    remove.forEach(function (name) {
      body.classList.remove(name);
    });

    if (fromDoc && fromDoc.body) {
      Array.prototype.forEach.call(fromDoc.body.classList, function (name) {
        if (name.indexOf("oml-embed") === 0) return;
        body.classList.add(name);
      });
    }

    body.classList.toggle("oml-hub-home", !!isHome);
  }

  function loadToolStyles(doc, base) {
    var links = doc.querySelectorAll('link[rel="stylesheet"]');
    var i;
    var href;
    var link;
    for (i = 0; i < links.length; i++) {
      href = links[i].getAttribute("href") || "";
      if (isSharedAsset(href, SHARED_STYLE_MARKERS)) continue;
      link = global.document.createElement("link");
      link.rel = "stylesheet";
      link.href = new URL(href, base).href;
      link.setAttribute("data-oml-tool-style", "1");
      global.document.head.appendChild(link);
    }
  }

  function loadScriptsSequential(srcs) {
    return srcs.reduce(function (chain, src) {
      return chain.then(function () {
        return new global.Promise(function (resolve, reject) {
          var script = global.document.createElement("script");
          script.src = src;
          script.setAttribute("data-oml-tool-script", "1");
          script.onload = resolve;
          script.onerror = reject;
          global.document.body.appendChild(script);
        });
      });
    }, global.Promise.resolve());
  }

  function collectToolScripts(doc, pageUrl) {
    var scripts = doc.querySelectorAll("script[src]");
    var out = [];
    var i;
    var src;
    for (i = 0; i < scripts.length; i++) {
      src = scripts[i].getAttribute("src") || "";
      if (isSharedAsset(src, SHARED_SCRIPT_MARKERS)) continue;
      out.push(new URL(src, pageUrl).href);
    }
    return out;
  }

  function updateActiveNav(activeId, ctx) {
    var links = global.document.querySelectorAll("[data-oml-nav]");
    var i;
    for (i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("data-oml-nav");
      var active = id === activeId;
      links[i].toggleAttribute("aria-current", active);
    }

    var tabs = global.document.querySelectorAll(".oml-hub-bottom-tab[data-oml-tab]");
    for (i = 0; i < tabs.length; i++) {
      var tabId = tabs[i].getAttribute("data-oml-tab");
      if (tabId === "more") continue;
      var tabActive = tabId === activeId;
      tabs[i].classList.toggle("is-active", tabActive);
      tabs[i].toggleAttribute("aria-current", tabActive);
    }

    if (ctx && ctx.titleEl) {
      ctx.titleEl.textContent = getToolLabel(activeId || "home");
    }
  }

  function createRouter(base, ctx) {
    var loading = false;
    var currentPath = normalizePath(global.location.pathname);

    function canonicalPath(pathname) {
      return normalizePath(pathname);
    }

    function navigate(pathname, options) {
      options = options || {};
      var path = canonicalPath(pathname);
      var homePath = canonicalPath(new URL("./", base).pathname);

      if (!isSpaPath(base, path)) {
        global.location.href = new URL(pathname, base).href;
        return global.Promise.resolve();
      }

      if (path === currentPath && !options.force) {
        setMobileNavOpen(ctx.shell, ctx.menuBtn, false);
        return global.Promise.resolve();
      }

      if (loading) return global.Promise.resolve();
      loading = true;
      ctx.shell.classList.add("oml-hub-shell--loading");

      var activeId = getToolIdForPath(base, path) || "home";
      var task = path === homePath ? showHome() : loadToolPage(path);

      return task
        .then(function () {
          currentPath = path;

          if (!options.fromHistory) {
            var url = new URL(path, base);
            global.history.pushState(
              { omlPath: path },
              "",
              url.pathname + url.search + url.hash
            );
          }

          updateActiveNav(activeId, ctx);
          setMobileNavOpen(ctx.shell, ctx.menuBtn, false);
          global.scrollTo(0, 0);
        })
        .catch(function () {
          global.location.href = new URL(pathname, base).href;
        })
        .then(function () {
          loading = false;
          ctx.shell.classList.remove("oml-hub-shell--loading");
        });
    }

    function showHome() {
      clearToolAssets();
      syncBodyClasses(null, true);
      renderHomeContent(base);
      global.document.title = "omusiclab tools";

      var footer = global.document.querySelector(".oml-hub-main footer p");
      if (footer) {
        footer.innerHTML =
          'Part of <a href="https://omusiclab-landingpage.vercel.app/">omusiclab</a>';
      }
      return global.Promise.resolve();
    }

    function loadToolPage(path) {
      var fetchUrl = new URL(path, base).href;
      return global
        .fetch(fetchUrl, { credentials: "same-origin" })
        .then(function (res) {
          if (!res.ok) throw new Error("fetch failed");
          return res.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          var main = doc.getElementById("body-container");
          if (!main) throw new Error("missing body-container");

          clearToolAssets();
          syncBodyClasses(doc, false);
          loadToolStyles(doc, fetchUrl);

          var target = global.document.getElementById("body-container");
          target.className = main.className;
          target.innerHTML = main.innerHTML;
          target.removeAttribute("data-oml-hub-rendered");

          var fetchedFooter = doc.querySelector("footer");
          var liveFooter = global.document.querySelector(".oml-hub-main footer");
          if (fetchedFooter && liveFooter) {
            liveFooter.innerHTML = fetchedFooter.innerHTML;
          }

          if (doc.title) global.document.title = doc.title;

          var scripts = collectToolScripts(doc, fetchUrl);
          return loadScriptsSequential(scripts);
        });
    }

    function onPopState(event) {
      var path =
        (event.state && event.state[HISTORY_STATE_KEY]) ||
        global.location.pathname;
      navigate(path, { fromHistory: true, force: true });
    }

    function onNavClick(event) {
      var link = event.target.closest("[data-oml-nav]");
      if (!link || link.classList.contains("oml-hub-link--external")) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      var id = link.getAttribute("data-oml-nav");
      var href = link.getAttribute("href");
      if (!href && id === "home") href = new URL("./", base).pathname;
      if (!href) return;

      var path = canonicalPath(new URL(href, base).pathname);
      if (!isSpaPath(base, path)) return;

      event.preventDefault();
      navigate(path);
    }

    global.addEventListener("popstate", onPopState);
    ctx.shell.addEventListener("click", onNavClick);

    global.history.replaceState(
      { omlPath: currentPath },
      "",
      global.location.pathname + global.location.search + global.location.hash
    );

    return {
      navigate: navigate,
    };
  }

  function ensurePwaMeta(base) {
    var head = global.document.head;
    if (!head) return;

    if (!head.querySelector('link[rel="manifest"]')) {
      var manifest = global.document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = new URL("manifest.webmanifest", base).pathname;
      head.appendChild(manifest);
    }

    var metas = [
      { name: "theme-color", content: "#106347" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "OML Tools" },
    ];
    var i;
    for (i = 0; i < metas.length; i++) {
      if (!head.querySelector('meta[name="' + metas[i].name + '"]')) {
        var meta = global.document.createElement("meta");
        meta.name = metas[i].name;
        meta.content = metas[i].content;
        head.appendChild(meta);
      }
    }

    if (!head.querySelector('link[rel="apple-touch-icon"]')) {
      var touch = global.document.createElement("link");
      touch.rel = "apple-touch-icon";
      touch.href = new URL("shared/favicon.svg", base).pathname;
      head.appendChild(touch);
    }
  }

  function registerServiceWorker(base) {
    if (!("serviceWorker" in global.navigator)) return;
    var swUrl = new URL("sw.js", base).href;
    global.addEventListener("load", function () {
      global.navigator.serviceWorker.register(swUrl).catch(function () {});
    });
  }

  function initHub() {
    if (isEmbedMode()) return;

    var base = getScriptBase();
    var activeId = getCurrentToolId(base) || "home";
    var built = buildSidebar(base, activeId);
    var mobile = buildMobileHeader(activeId);
    var bottomNav = buildBottomNav(base, activeId);
    var backdrop = el("button", "oml-hub-drawer-backdrop");
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "Close menu");

    var shell = el("div", "oml-hub-shell");
    shell.appendChild(backdrop);
    shell.appendChild(mobile.header);
    shell.appendChild(built.sidebar);
    built.sidebar.id = "oml-hub-sidebar";

    var mainCol = el("div", "oml-hub-main");
    var nodes = Array.prototype.slice.call(global.document.body.childNodes);
    var n;
    for (var i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.nodeName === "SCRIPT") continue;
      mainCol.appendChild(n);
    }
    shell.appendChild(mainCol);
    shell.appendChild(bottomNav);
    global.document.body.appendChild(shell);

    global.document.body.classList.add("oml-has-hub");
    if (activeId === "home") {
      global.document.body.classList.add("oml-hub-home");
      renderHomeContent(base);
    }

    var ctx = {
      shell: shell,
      menuBtn: mobile.menuBtn,
      titleEl: mobile.titleEl,
    };

    router = createRouter(base, ctx);

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

    function openDrawer() {
      setMobileNavOpen(shell, mobile.menuBtn, true);
    }

    function closeDrawer() {
      setMobileNavOpen(shell, mobile.menuBtn, false);
    }

    mobile.menuBtn.addEventListener("click", openDrawer);
    built.closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    bottomNav.addEventListener("click", function (event) {
      var tab = event.target.closest(".oml-hub-bottom-tab");
      if (!tab) return;
      if (tab.getAttribute("data-oml-tab") === "more") {
        openDrawer();
        return;
      }
      var tabId = tab.getAttribute("data-oml-tab");
      if (!tabId || tabId === "more") return;
      var link = shell.querySelector('[data-oml-nav="' + tabId + '"]');
      if (link) link.click();
    });

    ensurePwaMeta(base);
    registerServiceWorker(base);
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
    navigate: function (path) {
      if (router) return router.navigate(path);
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
