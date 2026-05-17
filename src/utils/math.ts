import katex from 'katex';

const SKIP_TAGS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA']);

function safeKatex(expr: string, display: boolean): string | null {
  try {
    return katex.renderToString(expr, {
      displayMode: display,
      throwOnError: false,
      output: 'html',
      strict: 'ignore',
      trust: false,
    });
  } catch {
    return null;
  }
}

function replaceInText(text: string): string {
  if (!text.includes('$')) return text;
  return text
    .replace(/\$\$([^$\n]+?)\$\$/g, (m, expr) => safeKatex(expr, true) || m)
    .replace(/\$([^$\n]+?)\$/g, (m, expr) => safeKatex(expr, false) || m);
}

function walk(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (!text.includes('$')) return;
    const replaced = replaceInText(text);
    if (replaced === text) return;
    const span = document.createElement('span');
    span.innerHTML = replaced;
    node.parentNode?.replaceChild(span, node);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (SKIP_TAGS.has((node as Element).tagName)) return;
  Array.from(node.childNodes).forEach(walk);
}

export function renderMath(html: string): string {
  if (!html || !html.includes('$')) return html;
  if (typeof document === 'undefined') return html;
  const container = document.createElement('div');
  container.innerHTML = html;
  walk(container);
  return container.innerHTML;
}
