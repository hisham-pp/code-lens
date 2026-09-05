import type { EmbeddingProvider } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';

export async function backfillChunkEmbeddings(
  db: RepositoryDatabase,
  repositoryId: string,
  embeddingProvider: EmbeddingProvider,
  onProgress?: (completed: number, total: number) => void,
): Promise<number> {
  const countRow = db.db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM chunks c
      LEFT JOIN vectors v ON c.id = v.id
      WHERE c.repository_id = ? AND v.id IS NULL
    `,
    )
    .get(repositoryId) as { count: number };
  const total = countRow.count;
  let completed = 0;

  onProgress?.(completed, total);

  while (completed < total) {
    const missingRows = db.db
      .prepare(
        `
        SELECT c.id, c.content
        FROM chunks c
        LEFT JOIN vectors v ON c.id = v.id
        WHERE c.repository_id = ? AND v.id IS NULL
        LIMIT 50
      `,
      )
      .all(repositoryId) as Array<{ id: string; content: string }>;
    if (missingRows.length === 0) break;

    const embeddings = await embeddingProvider.embedBatch(missingRows.map((row) => row.content));
    await db.vectors.insertBatch(
      missingRows.map((row, index) => ({
        id: row.id,
        embedding: embeddings[index]!,
      })),
    );
    completed += missingRows.length;
    onProgress?.(completed, total);
  }

  return completed;
}
