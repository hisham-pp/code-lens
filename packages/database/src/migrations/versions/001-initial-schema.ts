import type { SQLiteDatabase } from '../../connection/index.js';
import type { Migration } from '../types.js';
import { AUX_TABLES_SQL, DROP_ALL_SQL } from './schema-aux-sql.js';
import { TABLES_SQL } from './schema-sql.js';

export const migration001InitialSchema: Migration = {
  version: 1,
  name: '001-initial-schema',
  up: (db: SQLiteDatabase) => {
    db.exec(TABLES_SQL);
    db.exec(AUX_TABLES_SQL);
  },
  down: (db: SQLiteDatabase) => {
    db.exec(DROP_ALL_SQL);
  },
};
