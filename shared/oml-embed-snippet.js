(function () {
  "use strict";

  if (!window.OMLEmbed || window.OMLEmbed.isEmbedMode()) return;

  var BASE_HEIGHTS = {
    "virtual-metronome": 420,
    "virtual-tuner": 540,
    "virtual-chord-transposer": 700,
  };

  var HEADER_EXTRA = 70;

  function toolSlug() {
    var parts = location.pathname.replace(/\/+$/, "").split("/");
    return parts[parts.length - 1] || "virtual-metronome";
  }

  function toolTitle() {
    var heading = document.querySelector(".tool-title");
    if (heading && heading.textContent) return heading.textContent.trim();
    return document.title.replace(/^omusiclab\s*\|\s*/i, "").trim();
  }

  function iframeId(slug) {
    return "oml-embed-" + slug.replace(/[^a-z0-9-]/gi, "-");
  }

  function initialHeight(slug, showHeader) {
    var height = BASE_HEIGHTS[slug] || 520;
    if (showHeader) height += HEADER_EXTRA;
    return height;
  }

  function updateSnippet(root) {
    var accentInput = root.querySelector("#oml-embed-accent");
    var headerInput = root.querySelector("#oml-embed-header");
    var code = root.querySelector("#oml-embed-code");
    if (!code) return;

    var slug = toolSlug();
    var showHeader = headerInput ? headerInput.checked : false;

    code.value = window.OMLEmbed.buildIframeSnippet({
      baseUrl: location.origin + location.pathname,
      title: toolTitle(),
      iframeId: iframeId(slug),
      minHeight: initialHeight(slug, showHeader),
      accent: accentInput ? accentInput.value : window.OMLEmbed.DEFAULT_ACCENT,
      showHeader: showHeader,
    });
  }

  function copySnippet(root, copyBtn) {
    var code = root.querySelector("#oml-embed-code");
    if (!code) return;
    var text = code.value;

    function onCopied() {
      copyBtn.textContent = "Copied!";
      setTimeout(function () {
        copyBtn.textContent = "Copy embed code";
      }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onCopied);
      return;
    }
    code.focus();
    code.select();
    try {
      document.execCommand("copy");
      onCopied();
    } catch (e) {}
  }

  function buildDialog() {
    var dialog = document.createElement("dialog");
    dialog.className = "oml-embed-dialog";
    dialog.id = "oml-embed-dialog";
    dialog.setAttribute("aria-labelledby", "oml-embed-heading");
    dialog.innerHTML =
      '<div class="oml-embed-panel">' +
      '  <div class="oml-embed-dialog-header">' +
      '    <h2 id="oml-embed-heading" class="oml-embed-heading">Embed this tool</h2>' +
      '    <button type="button" class="oml-embed-close" aria-label="Close">×</button>' +
      "  </div>" +
      '  <p class="oml-embed-lead">Paste this code on your site. The iframe height adjusts automatically (no scrollbars). The footer is always included.</p>' +
      '  <div class="oml-embed-options">' +
      '    <label class="oml-embed-option">' +
      '      <span class="oml-embed-option-label">Accent color</span>' +
      '      <input type="color" id="oml-embed-accent" value="' +
      window.OMLEmbed.DEFAULT_ACCENT +
      '" />' +
      "    </label>" +
      '    <label class="oml-embed-option oml-embed-checkbox">' +
      '      <input type="checkbox" id="oml-embed-header" />' +
      "      <span>Show header</span>" +
      "    </label>" +
      "  </div>" +
      '  <label class="oml-embed-code-label" for="oml-embed-code">Embed code</label>' +
      '  <textarea id="oml-embed-code" class="oml-embed-code" readonly rows="1" spellcheck="false"></textarea>' +
      '  <button type="button" class="oml-embed-copy" id="oml-embed-copy">Copy embed code</button>' +
      "</div>";

    var panel = dialog.querySelector(".oml-embed-panel");
    var accentInput = dialog.querySelector("#oml-embed-accent");
    var headerInput = dialog.querySelector("#oml-embed-header");
    var copyBtn = dialog.querySelector("#oml-embed-copy");
    var closeBtn = dialog.querySelector(".oml-embed-close");

    accentInput.addEventListener("input", function () {
      updateSnippet(panel);
    });
    headerInput.addEventListener("change", function () {
      updateSnippet(panel);
    });
    copyBtn.addEventListener("click", function () {
      copySnippet(panel, copyBtn);
    });
    closeBtn.addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      closeBtn.blur();
    });

    updateSnippet(panel);
    return dialog;
  }

  function mountTrigger(footer, dialog) {
    var paragraph = footer.querySelector("p");
    if (!paragraph) return;

    var separator = document.createElement("span");
    separator.className = "oml-embed-footer-sep";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = " · ";

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "oml-embed-open";
    trigger.textContent = "Add to your site";
    trigger.addEventListener("click", function () {
      updateSnippet(dialog.querySelector(".oml-embed-panel"));
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    });

    paragraph.appendChild(separator);
    paragraph.appendChild(trigger);
  }

  function mount() {
    var footer = document.querySelector("footer");
    if (!footer) return;

    var dialog = buildDialog();
    document.body.appendChild(dialog);
    mountTrigger(footer, dialog);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
