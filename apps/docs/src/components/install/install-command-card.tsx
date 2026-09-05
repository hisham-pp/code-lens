import { CopyButton } from './copy-button';

interface InstallCommandCardProps {
  label: string;
  command: string;
  badge: string;
  badgeClass: string;
  note: string;
}

export function InstallCommandCard({
  label,
  command,
  badge,
  badgeClass,
  note,
}: InstallCommandCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        <code className={`text-xs font-mono px-2 py-0.5 rounded-md border ${badgeClass}`}>
          {badge}
        </code>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
        <span className="text-emerald-400 font-mono text-sm shrink-0">$</span>
        <code className="text-zinc-200 font-mono text-xs flex-1 truncate">{command}</code>
        <CopyButton text={command} />
      </div>
      <p className="text-xs text-zinc-500">{note}</p>
    </div>
  );
}
