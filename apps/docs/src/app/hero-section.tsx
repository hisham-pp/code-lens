import { ArrowRight, HardDrive, Compass, Zap } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="text-center space-y-6 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Zap className="h-3.5 w-3.5" />
        <span>Local-First Repository Intelligence Engine</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
        See your codebase <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          with absolute clarity.
        </span>
      </h1>

      <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
        Code Lense transforms software repositories into searchable, AST-structured knowledge
        graphs. Combining deterministic code analysis, Git intelligence, FTS5 lexical ranking, and
        vector similarity—all running 100% locally.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          href="/docs/installation"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <span>Installation Guide</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/docs/storage"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-sm font-medium transition-all"
        >
          <HardDrive className="h-4 w-4 text-indigo-400" />
          <span>Where It Saves</span>
        </Link>

        <Link
          href="/docs/scoping"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-sm font-medium transition-all"
        >
          <Compass className="h-4 w-4 text-purple-400" />
          <span>Repo Scoping</span>
        </Link>
      </div>
    </section>
  );
}
