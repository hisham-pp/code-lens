'use client';

import { ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { InstallCommandCard } from './install-command-card';
import { INSTALL_CMD, SDK_CMD, type Manager } from './install-data';
import { InstallManagerTabs } from './install-manager-tabs';
import { QuickstartSteps } from './quickstart-steps';

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

      <InstallManagerTabs manager={manager} onManagerChange={setManager} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InstallCommandCard
          label="CLI — global"
          command={INSTALL_CMD[manager]}
          badge="code-lense"
          badgeClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
          note="Then run code-lense init in any repository."
        />
        <InstallCommandCard
          label="SDK — for apps"
          command={SDK_CMD[manager]}
          badge="@code-lense/sdk"
          badgeClass="text-purple-400 bg-purple-500/10 border-purple-500/20"
          note="TypeScript-first API for AI agents and IDE plugins."
        />
      </div>

      <QuickstartSteps />

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
