import { Context as BaseContext } from 'grammy';
import type { User } from '@prisma/client';

class Context extends BaseContext {
  dbuser!: User;
}

export default Context;
