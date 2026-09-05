import { TEXT_EMERALD, TEXT_EMERALD_BOLD, TEXT_WHITE } from '../lib/docs-constants';

export function TerminalPreview() {
  return (
    <section className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="text-xs font-mono text-zinc-400">code-lense terminal session</div>
          <div className="w-12" />
        </div>
        <div className="p-6 font-mono text-xs sm:text-sm text-zinc-300 space-y-4 overflow-x-auto leading-relaxed">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className={TEXT_EMERALD_BOLD}>$</span>
            <span className={TEXT_WHITE}>code-lense doctor</span>
          </div>
          <div className="text-zinc-400 pl-4 border-l-2 border-indigo-500/30 space-y-1">
            <div>
              <span className={TEXT_EMERALD}>✔</span> Node.js Version: v22.13.5 (Supported:
              &gt;=20.0.0)
            </div>
            <div>
              <span className={TEXT_EMERALD}>✔</span> SQLite Database: Engine OK (Driver:
              node:sqlite)
            </div>
            <div>
              <span className={TEXT_EMERALD}>✔</span> Storage Directory: ~/.code-lense (Read/Write
              OK)
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 pt-2">
            <span className={TEXT_EMERALD_BOLD}>$</span>
            <span className={TEXT_WHITE}>code-lense index</span>
          </div>
          <div className="text-zinc-400 pl-4 border-l-2 border-emerald-500/30 space-y-1">
            <div>
              <span className={TEXT_EMERALD}>✔</span> Initial Index: 500 files, 2,000 symbols, 2,000
              chunks (540 ms)
            </div>
            <div className="text-indigo-400 font-semibold">Throughput: 925 files/sec</div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 pt-2">
            <span className={TEXT_EMERALD_BOLD}>$</span>
            <span className={TEXT_WHITE}>
              code-lense search &quot;UserService&quot; --mode hybrid
            </span>
          </div>
          <div className="text-zinc-400 pl-4 border-l-2 border-purple-500/30 space-y-1">
            <div>[0.984] src/services/user.service.ts:L24 (class UserService)</div>
            <div>[0.871] src/controllers/user.controller.ts:L12 (imports UserService)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
