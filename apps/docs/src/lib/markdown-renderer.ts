import hljs from 'highlight.js';
import { Marked } from 'marked';
import { type HeadingItem } from './docs-meta';

export function createMarkedParser(headings: HeadingItem[]): Marked {
  const marked = new Marked({
    gfm: true,
    breaks: true,
  });

  marked.use({
    renderer: {
      heading({ text, depth }: { text: string; depth: number }) {
        const plainText = text.replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        const id = plainText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        if (depth >= 2 && depth <= 3) {
          headings.push({ id, text: plainText, level: depth });
        }

        return `<h${depth} id="${id}" class="group scroll-mt-24">
          <a href="#${id}" class="no-underline hover:text-indigo-400 transition-colors">${text}</a>
        </h${depth}>`;
      },
      code({ text, lang }: { text: string; lang?: string }) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
        const highlighted = hljs.getLanguage(language)
          ? hljs.highlight(text, { language, ignoreIllegals: true }).value
          : text;

        return `<div class="relative group my-6 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/50 text-xs text-zinc-400 font-mono">
            <span>${language}</span>
            <button class="copy-btn hover:text-zinc-200 transition-colors" data-code="${encodeURIComponent(text)}">Copy</button>
          </div>
          <pre class="p-4 overflow-x-auto text-sm leading-relaxed text-zinc-200 font-mono"><code class="language-${language}">${highlighted}</code></pre>
        </div>`;
      },
      table(token: { header: Array<{ text: string }>; rows: Array<Array<{ text: string }>> }) {
        const headerHtml = token.header
          .map(
            (th) =>
              `<th class="border-b border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left font-semibold text-zinc-200">${th.text}</th>`,
          )
          .join('');
        const rowsHtml = token.rows
          .map(
            (row) =>
              `<tr class="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">${row
                .map((cell) => `<td class="px-4 py-3 text-zinc-300 align-top">${cell.text}</td>`)
                .join('')}</tr>`,
          )
          .join('');

        return `<div class="my-6 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/50">
          <table class="w-full text-left text-sm">${headerHtml ? `<thead><tr>${headerHtml}</tr></thead>` : ''}<tbody>${rowsHtml}</tbody></table>
        </div>`;
      },
    },
  });

  return marked;
}
