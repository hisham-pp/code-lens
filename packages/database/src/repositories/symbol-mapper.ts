import type { CodeSymbol } from '@code-lense/core';
import { COL_METADATA_JSON } from './constants.js';

export function mapRowToSymbol(row: Record<string, unknown>): CodeSymbol {
  let metadata: Record<string, unknown> | undefined;
  if (row[COL_METADATA_JSON]) {
    try {
      metadata = JSON.parse(String(row[COL_METADATA_JSON]));
    } catch {
      // ignore
    }
  }

  return {
    id: String(row['id']),
    fileId: Number(row['file_id']),
    filePath: String(row['file_path'] || ''),
    name: String(row['name']),
    type: row['type'] as CodeSymbol['type'],
    parentId: row['parent_id'] ? String(row['parent_id']) : undefined,
    startLine: Number(row['start_line']),
    endLine: Number(row['end_line']),
    startByte: Number(row['start_byte'] || 0),
    endByte: Number(row['end_byte'] || 0),
    signature: row['signature'] ? String(row['signature']) : undefined,
    docComment: row['doc_comment'] ? String(row['doc_comment']) : undefined,
    metadata,
  };
}
