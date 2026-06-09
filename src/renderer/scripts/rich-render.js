import { marked } from "../vendor/marked.esm.js";
import renderMathInElement from "../vendor/katex/contrib/auto-render.mjs";

const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ON_EVENT_ATTR_RE = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_HREF_RE = /\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi;

const MATH_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false },
];

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeLang(lang) {
  if (typeof lang !== "string" || !lang) return "text";
  const safe = lang.replace(/[^a-zA-Z0-9+#.-]/g, "");
  return safe || "text";
}

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }) {
      const language = sanitizeLang(lang);
      const safeText = escapeHtml(text ?? "");
      return (
        `<div class="code-block">` +
        `<div class="code-block-label">${escapeHtml(language)}</div>` +
        `<pre><code class="language-${language}">${safeText}</code></pre>` +
        `</div>`
      );
    },
    html({ text }) {
      return `<pre class="msg-raw-html"><code>${escapeHtml(text ?? "")}</code></pre>`;
    },
  },
});

function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(SCRIPT_TAG_RE, "")
    .replace(ON_EVENT_ATTR_RE, "")
    .replace(JS_HREF_RE, ' $1="#"');
}

function applyMath(el) {
  renderMathInElement(el, {
    delimiters: MATH_DELIMITERS,
    throwOnError: false,
    errorColor: "#f08080",
  });
}

export function renderRichContent(el, text) {
  if (!el) return;
  try {
    const html = marked.parse(text ?? "");
    el.innerHTML = sanitizeHtml(html);
    el.classList.add("msg-prose");
    applyMath(el);
  } catch (err) {
    console.warn("[rich-render] markdown failed:", err);
    el.textContent = text ?? "";
    el.classList.remove("msg-prose");
  }
}

export function renderMathOnly(el, text) {
  if (!el) return;
  el.textContent = text ?? "";
  el.classList.remove("msg-prose");
  applyMath(el);
}
