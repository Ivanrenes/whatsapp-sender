import { getUnixTime } from 'date-fns';

export class BaseModel {
  id!: string;
  createdAt: number = getUnixTime(new Date());
  updatedAt: number = getUnixTime(new Date());
  archived: boolean = false;
}
