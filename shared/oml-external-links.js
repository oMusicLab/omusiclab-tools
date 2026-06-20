(function (global) {
  "use strict";

  var SKIP_PROTOCOLS = /^(mailto:|tel:|javascript:|#)/i;
  var cachedOrigin = null;
  var clickBound = false;

  function pageOrigin(base) {
    if (!base && cachedOrigin) return cachedOrigin;
    try {
      var root = new URL("/", base || global.location.href);
      cachedOrigin = root.origin;
      return cachedOrigin;
    } catch (e) {
      return global.location.origin;
    }
  }

  function isExternalHref(href, base) {
    if (!href || SKIP_PROTOCOLS.test(String(href).trim())) return false;
    try {
      var url = new URL(href, base || global.location.href);
      if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      return url.origin !== pageOrigin(base);
    } catch (e) {
      return false;
    }
  }

  function markExternalLink(anchor, base) {
    if (!anchor || anchor.hasAttribute("data-oml-external")) return;
    var href = anchor.getAttribute("href");
    if (!href || !isExternalHref(href, base)) return;
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
    anchor.setAttribute("data-oml-external", "1");
  }

  function upgradeExternalLinks(root, base) {
    if (!root || !root.querySelectorAll) return;
    var links = root.querySelectorAll('a[href]:not([data-oml-external])');
    var i;
    for (i = 0; i < links.length; i++) {
      markExternalLink(links[i], base);
    }
  }

  function bindExternalLinkClicks(base) {
    if (clickBound || !global.document || !global.document.body) return;
    clickBound = true;

    global.document.body.addEventListener(
      "click",
      function (event) {
        var anchor = event.target.closest("a[href]");
        if (!anchor) return;
        if (!isExternalHref(anchor.getAttribute("href"), base || global.location.href)) {
          return;
        }
        if (event.defaultPrevented) return;
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        markExternalLink(anchor, base);
        if (anchor.getAttribute("target") !== "_blank") {
          event.preventDefault();
          global.open(anchor.href, "_blank", "noopener,noreferrer");
        }
      },
      true
    );
  }

  function observeExternalLinks(root, base) {
    if (!root || root._omlExternalLinksObserved || typeof MutationObserver === "undefined") {
      return;
    }
    root._omlExternalLinksObserved = true;
    var scheduled = false;
    var observer = new MutationObserver(function (mutations) {
      var i;
      for (i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length) {
          if (!scheduled) {
            scheduled = true;
            global.requestAnimationFrame(function () {
              scheduled = false;
              upgradeExternalLinks(root, base);
            });
          }
          break;
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function shouldAutoObserve() {
    return !global.document.querySelector('script[src*="oml-hub.js"]');
  }

  function initExternalLinks(root, base, options) {
    options = options || {};
    root = root || (global.document && global.document.body);
    if (!root) return;
    pageOrigin(base);
    upgradeExternalLinks(root, base);
    bindExternalLinkClicks(base);
    if (options.observe || (options.observe !== false && shouldAutoObserve())) {
      observeExternalLinks(root, base);
    }
  }

  function initExternalLinksInDocument(doc) {
    if (!doc || !doc.body) return;
    var base = doc.baseURI || (doc.defaultView && doc.defaultView.location.href);
    initExternalLinks(doc.body, base, { observe: true });
  }

  global.OMLExternalLinks = {
    isExternalHref: isExternalHref,
    markExternalLink: markExternalLink,
    upgradeExternalLinks: upgradeExternalLinks,
    init: initExternalLinks,
    initDocument: initExternalLinksInDocument,
  };

  if (global.document) {
    function onReady() {
      initExternalLinks(global.document.body);
    }
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", onReady);
    } else {
      onReady();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
