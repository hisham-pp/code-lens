'use client';

import { ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CopyButton } from './copy-button';

const MANAGERS = ['npm', 'pnpm', 'yarn'] as const;
type Manager = (typeof MANAGERS)[number];

const INSTALL_CMD: Record<Manager, string> = {
  npm: 'npm install -g code-lense',
  pnpm: 'pnpm add -g code-lense',
  yarn: 'yarn global add code-lense',
};

const SDK_CMD: Record<Manager, string> = {
  npm: 'npm install @code-lense/sdk',
  pnpm: 'pnpm add @code-lense/sdk',
  yarn: 'yarn add @code-lense/sdk',
};

const QUICKSTART = [
  { step: '1', cmd: 'code-lense init', desc: 'Create config & ignore rules' },
  { step: '2', cmd: 'code-lense index', desc: 'Scan files, extract symbols, populate SQLite' },
  { step: '3', cmd: 'code-lense search "UserService" --mode hybrid', desc: 'BM25 + vector search' },
] as const;

export function InstallSection() {
  const [manager, setManager] = useState<Manager>('npm');
  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Package className="h-3.5 w-3.5" />
          <span>Now on npm</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Get started in seconds</h2>
        <p className="text-zinc-400 text-sm">
          Install the CLI globally or embed the SDK in your app.
        </p>
      </div>

      <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit mx-auto">
        {MANAGERS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setManager(m);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${manager === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            [
              'CLI — global',
              INSTALL_CMD[manager],
              'code-lense',
              'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              'Then run code-lense init in any repository.',
            ],
            [
              'SDK — for apps',
              SDK_CMD[manager],
              '@code-lense/sdk',
              'text-purple-400 bg-purple-500/10 border-purple-500/20',
              'TypeScript-first API for AI agents and IDE plugins.',
            ],
          ] as const
        ).map(([label, cmd, badge, badgeClass, note]) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-3"
          >
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
              <code className="text-zinc-200 font-mono text-xs flex-1 truncate">{cmd}</code>
              <CopyButton text={cmd} />
            </div>
            <p className="text-xs text-zinc-500">{note}</p>
          </div>
        ))}
      </div>

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

      <div className="text-center">
        <Link
          href="/docs/installation"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Full installation guide & options <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
