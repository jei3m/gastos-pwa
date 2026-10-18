import type { RowDataPacket } from 'mysql2';

export interface responseRow extends RowDataPacket {
  response: string;
}
