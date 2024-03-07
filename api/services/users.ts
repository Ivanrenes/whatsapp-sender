import { prisma } from '../db/prisma';

export class UsersService {
  async findFirst() {
    return await prisma.user.findFirst();
  }
}
