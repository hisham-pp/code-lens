import { CopyButton } from './copy-button';
import { QUICKSTART } from './install-data';

export function QuickstartSteps() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
        Quick-start — 3 commands
      </p>
      <div className="space-y-3 font-mono text-sm">
        {QUICKSTART.map(({ step, cmd, desc }) => (
          <div key={step} className="flex items-start gap-3">
            <span className="shrink-0 h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {step}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                <span className="text-emerald-400 shrink-0">$</span>
                <code className="text-zinc-200 text-xs flex-1 truncate">{cmd}</code>
                <CopyButton text={cmd} />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 pl-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
