interface AlertStyle {
  border: string;
  bg: string;
  text: string;
  badge: string;
}

const COLOR_MAP: Record<string, AlertStyle> = {
  NOTE: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    badge: 'Note',
  },
  TIP: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    badge: 'Tip',
  },
  IMPORTANT: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    badge: 'Important',
  },
  WARNING: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    badge: 'Warning',
  },
  CAUTION: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    badge: 'Caution',
  },
};

export function processGitHubAlerts(markdown: string): string {
  return markdown.replace(
    />\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*?)(?=\n\n|\n(?=[^>])|$)/gi,
    (_match, type: string, content: string) => {
      const alertType = type.toUpperCase();
      const cleanContent = content
        .split('\n')
        .map((line: string) => line.replace(/^>\s?/, ''))
        .join('\n')
        .trim();

      const style = COLOR_MAP[alertType] || COLOR_MAP['NOTE']!;

      return `\n\n<div class="my-6 rounded-xl border ${style.border} ${style.bg} p-4 text-sm leading-relaxed">
  <div class="flex items-center gap-2 font-semibold ${style.text} mb-2">
    <span class="uppercase tracking-wider text-xs px-2 py-0.5 rounded border ${style.border}">${style.badge}</span>
  </div>
  <div class="text-zinc-300 [&>p]:mb-0">${cleanContent}</div>
</div>\n\n`;
    },
  );
}
