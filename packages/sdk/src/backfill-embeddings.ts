import type { EmbeddingProvider } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';

export async function backfillChunkEmbeddings(
  db: RepositoryDatabase,
  repositoryId: string,
  embeddingProvider: EmbeddingProvider,
): Promise<number> {
  const missingChunkStmt = db.db.prepare(`
    SELECT c.id, c.content
    FROM chunks c
    LEFT JOIN vectors v ON c.id = v.id
    WHERE c.repository_id = ? AND v.id IS NULL
    LIMIT 500
  `);

  const missingRows = missingChunkStmt.all(repositoryId) as Array<{
    id: string;
    content: string;
  }>;
  if (missingRows.length === 0) return 0;

  const texts = missingRows.map((r) => r.content);
  const embeddings = await embeddingProvider.embedBatch(texts);
  await db.vectors.insertBatch(
    missingRows.map((r, i) => ({
      id: r.id,
      embedding: embeddings[i]!,
    })),
  );
  return missingRows.length;
}
