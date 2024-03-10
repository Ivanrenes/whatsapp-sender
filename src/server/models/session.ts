import { Collection } from 'fireorm';

@Collection()
class Session {
  id!: string;
  qr!: string;
  startTime!: number;
  endTime!: number;
}
