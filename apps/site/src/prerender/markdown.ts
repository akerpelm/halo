import { JSDOM } from 'jsdom';

const ELEMENT = 1;
const TEXT = 3;

const skipped = (el: Element) =>
  el.matches('button, svg, script, style, caption, [aria-hidden="true"], [data-md-skip], .sr-only, a[aria-label^="Link to"]');

const languageFor = (label: string) => {
  const ext = label.split('.').pop() ?? '';
  return ({ tsx: 'tsx', ts: 'ts', jsx: 'jsx', js: 'js', css: 'css', sh: 'sh', md: 'md', json: 'json', html: 'html', diff: 'diff' } as Record<string, string>)[ext] ?? '';
};

function inline(node: Node, base: string): string {
  if (node.nodeType === TEXT) return (node.textContent ?? '').replace(/\s+/g, ' ');
  if (node.nodeType !== ELEMENT) return '';
  const el = node as Element;
  if (skipped(el)) return '';
  const children = () => [...el.childNodes].map((child) => inline(child, base)).join('');
  switch (el.tagName.toLowerCase()) {
    case 'code':
      return `\`${el.textContent ?? ''}\``;
    case 'kbd':
      return `<kbd>${el.textContent ?? ''}</kbd>`;
    case 'strong':
    case 'b':
      return `**${children().trim()}**`;
    case 'em':
    case 'i':
      return `*${children().trim()}*`;
    case 'br':
      return '\n';
    case 'a': {
      const href = el.getAttribute('href') ?? '';
      const text = children().trim();
      if (!href || href.startsWith('#')) return text;
      return `[${text}](${new URL(href, base).href})`;
    }
    default:
      return children();
  }
}

const cell = (el: Element, base: string) => inline(el, base).trim().replace(/\|/g, '\\|');

function table(el: Element, base: string): string {
  const rows = [...el.querySelectorAll('tr')].map((tr) => [...tr.children].filter((c) => !skipped(c)).map((c) => cell(c, base)));
  const [head, ...body] = rows;
  if (!head) return '';
  return [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...body.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

function block(node: Node, base: string): string[] {
  if (node.nodeType === TEXT) {
    const text = (node.textContent ?? '').trim();
    return text ? [text] : [];
  }
  if (node.nodeType !== ELEMENT) return [];
  const el = node as Element;
  if (skipped(el)) return [];
  const tag = el.tagName.toLowerCase();
  const text = () => inline(el, base).trim();
  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
      return [`${'#'.repeat(Number(tag[1]))} ${text()}`];
    case 'p':
      return text() ? [text()] : [];
    case 'ul':
    case 'ol':
      return [
        [...el.children]
          .filter((li) => li.tagName.toLowerCase() === 'li')
          .map((li, i) => `${tag === 'ol' ? `${i + 1}.` : '-'} ${inline(li, base).trim()}`)
          .join('\n'),
      ];
    case 'pre':
      return [`\`\`\`${el.getAttribute('data-language') ?? ''}\n${(el.textContent ?? '').replace(/\n$/, '')}\n\`\`\``];
    case 'figure': {
      const label = el.querySelector('figcaption')?.textContent?.trim() ?? '';
      const pre = el.querySelector('pre');
      if (pre) {
        pre.setAttribute('data-language', languageFor(label));
        return block(pre, base);
      }
      return [...el.childNodes].flatMap((child) => block(child, base));
    }
    case 'table':
      return [table(el, base)];
    case 'aside':
      return [
        [...el.childNodes]
          .flatMap((child) => block(child, base))
          .map((line, i) => (i === 0 ? `**${line}**` : line))
          .join('\n\n')
          .split('\n')
          .map((line) => `> ${line}`.trimEnd())
          .join('\n'),
      ];
    case 'dl':
      return [
        [...el.children]
          .map((child) => (child.tagName.toLowerCase() === 'dt' ? `**${inline(child, base).trim()}**` : `: ${inline(child, base).trim()}`))
          .join('\n'),
      ];
    default:
      return [...el.childNodes].flatMap((child) => block(child, base));
  }
}

export function htmlToMarkdown(html: string, base: string): string {
  const { document } = new JSDOM(`<body>${html}</body>`).window;
  return `${block(document.body, base).join('\n\n').replace(/\n{3,}/g, '\n\n')}\n`;
}
