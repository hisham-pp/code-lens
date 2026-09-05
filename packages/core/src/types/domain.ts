export type SymbolType =
  | 'function'
  | 'class'
  | 'method'
  | 'interface'
  | 'type'
  | 'enum'
  | 'variable'
  | 'constant'
  | 'component'
  | 'hook'
  | 'api_route'
  | 'decorator'
  | 'module';

export interface FileInfo {
  id?: number;
  path: string;
  relativePath: string;
  language: string;
  extension: string;
  size: number;
  hash: string;
  isBinary: boolean;
  isGenerated: boolean;
  isMinified: boolean;
  isVendor: boolean;
  mtimeMs: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface CodeSymbol {
  id: string;
  fileId?: number;
  filePath: string;
  name: string;
  type: SymbolType;
  parentId?: string;
  startLine: number;
  endLine: number;
  startByte: number;
  endByte: number;
  signature?: string;
  docComment?: string;
  metadata?: Record<string, unknown>;
}

export interface CodeChunk {
  id: string;
  fileId?: number;
  filePath: string;
  symbolId?: string;
  symbolName?: string;
  parentSymbolId?: string;
  startLine: number;
  endLine: number;
  startByte: number;
  endByte: number;
  chunkType: 'symbol' | 'block' | 'file';
  content: string;
  hash: string;
  language: string;
}

export interface Dependency {
  id?: number;
  sourceFilePath: string;
  targetPath?: string;
  specifier: string;
  importedSymbols: string[];
  isDynamic: boolean;
  isTypeOnly: boolean;
}

export type GraphRelation =
  'imports' | 'exports' | 'calls' | 'extends' | 'implements' | 'references' | 'contains';

export interface GraphEdge {
  id?: number;
  sourceId: string;
  targetId: string;
  relation: GraphRelation;
  metadata?: Record<string, unknown>;
}
