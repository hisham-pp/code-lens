import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { DocsShell } from '../components/docs-shell';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Code Lense — Local-First Repository Intelligence',
  description:
    'Comprehensive documentation and developer manual for Code Lense, the local-first repository intelligence engine.',
  keywords: [
    'code search',
    'repository intelligence',
    'ast parser',
    'semantic search',
    'sqlite wal',
    'developer tools',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="min-h-screen bg-zinc-950 font-sans antialiased">
        <DocsShell>{children}</DocsShell>
      </body>
    </html>
  );
}
