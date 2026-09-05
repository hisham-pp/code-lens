import { ArrowRight, HardDrive, Compass, Terminal } from 'lucide-react';
import Link from 'next/link';
import { CARD_CONTAINER, ICON_MD, ICON_SM, CARD_TITLE, CARD_DESC } from '../lib/docs-constants';

export function FeatureGrid() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <div className={CARD_CONTAINER}>
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <HardDrive className={ICON_MD} />
        </div>
        <h3 className={CARD_TITLE}>External Storage</h3>
        <p className={CARD_DESC}>
          Kept cleanly in{' '}
          <code className="text-indigo-300 font-mono text-xs">
            ~/.code-lense/repositories/&lt;repo-id&gt;/index.db
          </code>
          . Zero project pollution, zero git accidents, full SQLite WAL performance.
        </p>
        <Link
          href="/docs/storage"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-2 font-medium"
        >
          Storage Details <ArrowRight className={ICON_SM} />
        </Link>
      </div>

      <div className={CARD_CONTAINER}>
        <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Compass className={ICON_MD} />
        </div>
        <h3 className={CARD_TITLE}>Deterministic Scoping</h3>
        <p className={CARD_DESC}>
          Path-hashed IDs (<code className="text-purple-300 font-mono text-xs">name-hash8</code>)
          prevent collisions across projects sharing directory names. Native Bit workspace and
          monorepo isolation.
        </p>
        <Link
          href="/docs/scoping"
          className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 pt-2 font-medium"
        >
          Scoping Details <ArrowRight className={ICON_SM} />
        </Link>
      </div>

      <div className={CARD_CONTAINER}>
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Terminal className={ICON_MD} />
        </div>
        <h3 className={CARD_TITLE}>12 CLI Commands & SDK</h3>
        <p className={CARD_DESC}>
          Interactive search, diagnostics, symbol tree inspector, dependency graph analysis, and
          programmatic TypeScript SDK ready for AI agents.
        </p>
        <Link
          href="/docs/cli"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 pt-2 font-medium"
        >
          CLI Manual <ArrowRight className={ICON_SM} />
        </Link>
      </div>
    </section>
  );
}
