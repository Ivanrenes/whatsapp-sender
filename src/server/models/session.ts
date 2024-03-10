import { BaseModel } from '@/models/base-model';
import { Collection, getRepository } from 'fireorm';

@Collection()
export class Session extends BaseModel {
  id!: string;
  uid!: string;
}

export const sessionRepository = getRepository(Session);
