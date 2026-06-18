(function (global) {
  "use strict";

  var DEFAULT_ACCENT = "#106347";
  var RESIZE_MESSAGE = "oml-embed-resize";

  function isTruthy(value) {
    if (!value) return false;
    var v = String(value).toLowerCase();
    return v === "1" || v === "true" || v === "yes";
  }

  function parseAccent(value) {
    if (!value) return null;
    var hex = String(value).replace(/^#/, "").trim();
    if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) return null;
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map(function (c) {
          return c + c;
        })
        .join("");
    }
    return "#" + hex.toLowerCase();
  }

  function hexToRgb(hex) {
    var normalized = parseAccent(hex);
    if (!normalized) return null;
    var n = normalized.slice(1);
    return {
      r: parseInt(n.slice(0, 2), 16),
      g: parseInt(n.slice(2, 4), 16),
      b: parseInt(n.slice(4, 6), 16),
    };
  }

  function rgba(hex, alpha) {
    var rgb = hexToRgb(hex);
    if (!rgb) return null;
    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + ")";
  }

  function applyAccent(hex, root) {
    var target = root || document.documentElement;
    var color = parseAccent(hex) || DEFAULT_ACCENT;
    target.style.setProperty("--oml-accent-text", color);
    target.style.setProperty("--oml-accent-focus", rgba(color, 0.35));
    target.style.setProperty("--oml-accent-glow", rgba(color, 0.25));
    target.style.setProperty("--oml-accent-soft-bg", rgba(color, 0.06));
    target.style.setProperty("--oml-accent-ring", rgba(color, 0.45));
    target.style.setProperty("--oml-accent-meter", rgba(color, 0.2));
    target.style.setProperty("--oml-accent-meter-strong", rgba(color, 0.28));
    return color;
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function getParams(url) {
    return new URL(url || global.location.href).searchParams;
  }

  function isEmbedMode(params) {
    return isTruthy((params || getParams()).get("embed"));
  }

  function showHeaderInEmbed(params) {
    return isTruthy((params || getParams()).get("header"));
  }

  function buildEmbedUrl(opts) {
    opts = opts || {};
    var base = opts.baseUrl || global.location.href;
    var url = new URL(base, global.location.href);
    var params = new URLSearchParams();
    params.set("embed", "1");

    var accent = parseAccent(opts.accent);
    if (accent && accent !== DEFAULT_ACCENT) {
      params.set("accent", accent.replace(/^#/, ""));
    }
    if (opts.showHeader) {
      params.set("header", "1");
    }

    url.search = params.toString();
    return url.toString();
  }

  function buildIframeSnippet(opts) {
    opts = opts || {};
    var src = buildEmbedUrl(opts);
    var title =
      opts.title ||
      (global.document && global.document.title
        ? global.document.title
        : "omusiclab tool"
      ).replace(/^omusiclab\s*\|\s*/i, "");
    var iframeId = opts.iframeId || "oml-embed-frame";
    var minHeight = opts.minHeight || 420;
    var resizeScript =
      "(function(){var i=document.getElementById(\"" +
      iframeId +
      '");if(!i)return;i.style.height=' +
      minHeight +
      '+\"px\";window.addEventListener(\"message\",function(e){if(!e.data||e.data.type!==\"' +
      RESIZE_MESSAGE +
      '\")return;if(e.source!==i.contentWindow)return;var h=Number(e.data.height);if(!h||h<1)return;i.style.height=Math.ceil(h)+\"px\";});})();';

    return (
      '<div class="oml-embed-host" style="max-width:22rem;width:100%;">' +
      '<iframe id="' +
      escapeAttr(iframeId) +
      '" src="' +
      escapeAttr(src) +
      '" title="' +
      escapeAttr(title) +
      '" width="100%" style="border:0;display:block;width:100%;overflow:hidden;" scrolling="no" loading="lazy"></iframe>' +
      "</div>" +
      "<script>" +
      resizeScript +
      "</script>"
    );
  }

  function measureEmbedHeight() {
    var body = global.document && global.document.body;
    var root = global.document && global.document.documentElement;
    if (!body || !root) return 0;
    return Math.ceil(
      Math.max(
        body.scrollHeight,
        body.offsetHeight,
        root.scrollHeight,
        root.offsetHeight
      )
    );
  }

  function postEmbedHeight() {
    if (!global.parent || global.parent === global) return;
    var height = measureEmbedHeight();
    if (!height) return;
    global.parent.postMessage(
      { type: RESIZE_MESSAGE, height: height },
      "*"
    );
  }

  function startResizeReporter() {
    if (!global.parent || global.parent === global) return;

    var scheduled = false;
    function schedulePost() {
      if (scheduled) return;
      scheduled = true;
      global.requestAnimationFrame(function () {
        scheduled = false;
        postEmbedHeight();
      });
    }

    schedulePost();
    global.addEventListener("resize", schedulePost);

    if (typeof global.ResizeObserver !== "undefined" && global.document.body) {
      var observer = new global.ResizeObserver(schedulePost);
      observer.observe(global.document.body);
      if (global.document.documentElement) {
        observer.observe(global.document.documentElement);
      }
    }

    global.addEventListener("load", schedulePost);
    global.setTimeout(schedulePost, 50);
    global.setTimeout(schedulePost, 250);
  }

  function activateEmbedMode() {
    var params = getParams();
    if (!isEmbedMode(params)) return false;

    var root = document.documentElement;
    var accent = parseAccent(params.get("accent"));
    if (accent) {
      applyAccent(accent, root);
    }

    root.classList.add("oml-embed-pending");
    if (showHeaderInEmbed(params)) {
      root.classList.add("oml-embed-show-header");
    }

    function onReady() {
      document.body.classList.add("oml-embed");
      if (showHeaderInEmbed(params)) {
        document.body.classList.add("oml-embed-show-header");
      }
      root.classList.remove("oml-embed-pending");
      startResizeReporter();
    }

    if (document.body) onReady();
    else document.addEventListener("DOMContentLoaded", onReady);

    return true;
  }

  global.OMLEmbed = {
    DEFAULT_ACCENT: DEFAULT_ACCENT,
    RESIZE_MESSAGE: RESIZE_MESSAGE,
    isEmbedMode: isEmbedMode,
    showHeaderInEmbed: showHeaderInEmbed,
    parseAccent: parseAccent,
    applyAccent: applyAccent,
    buildEmbedUrl: buildEmbedUrl,
    buildIframeSnippet: buildIframeSnippet,
    measureEmbedHeight: measureEmbedHeight,
    postEmbedHeight: postEmbedHeight,
  };

  activateEmbedMode();
})(typeof window !== "undefined" ? window : globalThis);
