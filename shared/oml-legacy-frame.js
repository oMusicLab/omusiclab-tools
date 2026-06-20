(function (global) {
  "use strict";

  if (global.top !== global.self) return;

  var params = new URLSearchParams(global.location.search);
  if (params.get("oml_embed") === "1") return;

  var hubUrl;
  try {
    hubUrl = new URL("../../", global.location.href);
    global.sessionStorage.setItem("oml_last_path", global.location.pathname);
  } catch (e) {
    return;
  }

  global.location.replace(hubUrl.href);
})(typeof window !== "undefined" ? window : globalThis);
