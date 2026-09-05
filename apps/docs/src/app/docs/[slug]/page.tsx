import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '../../../components/sidebar';
import { TableOfContents } from '../../../components/table-of-contents';
import { getAllDocItems, getDocPageData } from '../../../lib/docs';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const docs = getAllDocItems();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocPageData(slug);
  if (!doc) {
    return { title: 'Page Not Found — Code Lense Docs' };
  }
  return {
    title: `${doc.title} — Code Lense Docs`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getDocPageData(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex w-full gap-8">
      <Sidebar />
      <main className="flex-1 min-w-0 py-8 max-w-4xl">
        <nav className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-6">
          <Link href="/docs/overview" className="hover:text-zinc-300 transition-colors">
            Docs
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-zinc-400">{data.category}</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-indigo-400">{data.title}</span>
        </nav>

        <article className="prose-lens" dangerouslySetInnerHTML={{ __html: data.htmlContent }} />

        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          {data.prev ? (
            <Link
              href={`/docs/${data.prev.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 text-indigo-400 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                  Previous
                </div>
                <div className="font-semibold text-xs">{data.prev.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {data.next ? (
            <Link
              href={`/docs/${data.next.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all w-full sm:w-auto justify-end"
            >
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                  Next
                </div>
                <div className="font-semibold text-xs">{data.next.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
      <TableOfContents headings={data.headings} />
    </div>
  );
}
