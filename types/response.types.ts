import { RowDataPacket } from 'mysql2/promise';

export interface responseRow extends RowDataPacket {
  response: string;
}
