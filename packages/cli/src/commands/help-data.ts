import { DIAG_COMMAND_DOCS } from './help-data-diag.js';
import { INDEXING_COMMAND_DOCS, type CommandDoc } from './help-data-indexing.js';
import { SEARCH_COMMAND_DOCS } from './help-data-search.js';

export type { CommandDoc } from './help-data-indexing.js';

export const COMMAND_DOCS: Record<string, CommandDoc> = {
  ...INDEXING_COMMAND_DOCS,
  ...SEARCH_COMMAND_DOCS,
  ...DIAG_COMMAND_DOCS,
};
