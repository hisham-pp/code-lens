import { NextResponse } from 'next/server';
import { searchDocs } from '../../../lib/docs';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  if (process.env.DOCS_OUTPUT === 'export') {
    return NextResponse.json({ results: [] });
  }
  const q = new URL(request.url).searchParams.get('q') || '';
  const results = searchDocs(q);
  return NextResponse.json({ results });
}
