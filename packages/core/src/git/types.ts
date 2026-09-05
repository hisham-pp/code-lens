export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface GitFileChange {
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
  path: string;
  oldPath?: string;
  staged: boolean;
}
