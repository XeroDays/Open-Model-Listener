import { marked } from "../vendor/marked.esm.js";
import katex from "../vendor/katex/katex.mjs";
import renderMathInElement from "../vendor/katex/contrib/auto-render.mjs";

const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ON_EVENT_ATTR_RE = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_HREF_RE = /\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi;
const FENCE_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`]+`/g;
const MATH_PLACEHOLDER_RE = /⟦MATHBLOCK:(\d+)⟧/g;

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

function looksLikeMath(text) {
  if (!text || text.length < 2) return false;
  return /[=^\\+\-*\/(),0-9]|\\boxed|\\frac|\\sqrt|\\qquad|f'|u'|v'|\bx\b|\by\b/i.test(
    text
  );
}

function cleanMathTex(tex) {
  let t = tex.trim();
  while (/^\[\s*([\s\S]*?)\s*\]$/.test(t)) {
    t = t.replace(/^\[\s*([\s\S]*?)\s*\]$/, "$1").trim();
  }
  return t;
}

function makePlaceholder(id) {
  return `⟦MATHBLOCK:${id}⟧`;
}

function addMathBlock(blocks, tex, display = true) {
  const id = blocks.length;
  blocks.push({ tex: cleanMathTex(tex), display });
  return makePlaceholder(id);
}

function extractMathFromText(text, blocks) {
  let out = text;

  out = out.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    if (!inner.trim()) return match;
    return addMathBlock(blocks, inner, true);
  });

  out = out.replace(/\\\[([\s\S]*?)\\\]/g, (match, inner) => {
    if (!inner.trim()) return match;
    return addMathBlock(blocks, inner, true);
  });

  out = out.replace(/\\\(([\s\S]*?)\\\)/g, (match, inner) => {
    if (!inner.trim()) return match;
    return addMathBlock(blocks, inner, false);
  });

  out = out.replace(/^(\s*)\[\s*\n([\s\S]*?)\n\s*\]\s*$/gm, (match, indent, inner) => {
    const trimmed = inner.trim();
    if (!trimmed || !looksLikeMath(trimmed)) return match;
    return indent + addMathBlock(blocks, trimmed, true);
  });

  out = out.replace(/^(\s*)\[\s*([^\n\[\]]+)\s*\]\s*$/gm, (match, indent, inner) => {
    const trimmed = inner.trim();
    if (!trimmed || !looksLikeMath(trimmed)) return match;
    return indent + addMathBlock(blocks, trimmed, true);
  });

  out = out.replace(/^(\s*)\\boxed\{([^}]+)\}\s*$/gm, (match, indent, inner) => {
    return indent + addMathBlock(blocks, `\\boxed{${inner.trim()}}`, true);
  });

  return out;
}

function splitProtected(text, pattern) {
  const parts = [];
  let last = 0;
  const re = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`
  );
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ protected: false, text: text.slice(last, match.index) });
    }
    parts.push({ protected: true, text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ protected: false, text: text.slice(last) });
  }
  if (parts.length === 0) {
    parts.push({ protected: false, text });
  }
  return parts;
}

function extractMathWithProtection(text, blocks) {
  if (typeof text !== "string" || !text) return "";

  const afterFences = splitProtected(text, FENCE_RE);
  return afterFences
    .map((part) => {
      if (part.protected) return part.text;

      const afterInline = splitProtected(part.text, INLINE_CODE_RE);
      return afterInline
        .map((seg) => (seg.protected ? seg.text : extractMathFromText(seg.text, blocks)))
        .join("");
    })
    .join("");
}

function renderTexToHtml(tex, displayMode) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      errorColor: "#f08080",
    });
  } catch {
    return `<span class="msg-math-error">${escapeHtml(tex)}</span>`;
  }
}

function injectMathBlocks(html, blocks) {
  return html.replace(MATH_PLACEHOLDER_RE, (_, id) => {
    const block = blocks[Number(id)];
    if (!block) return "";
    const rendered = renderTexToHtml(block.tex, block.display);
    return block.display
      ? `<div class="msg-math-display">${rendered}</div>`
      : rendered;
  });
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
    const blocks = [];
    const processed = extractMathWithProtection(text ?? "", blocks);
    const html = marked.parse(processed);
    el.innerHTML = sanitizeHtml(injectMathBlocks(html, blocks));
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
  const blocks = [];
  const processed = extractMathWithProtection(text ?? "", blocks);
  const escaped = escapeHtml(processed).replace(/\n/g, "<br>");
  el.innerHTML = injectMathBlocks(escaped, blocks);
  el.classList.remove("msg-prose");
  applyMath(el);
}
