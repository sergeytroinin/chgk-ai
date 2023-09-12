import type { NextFunction } from 'grammy'
import type Context from '@/models/Context'
import { findOrCreateUser, updateListOfGroups } from '@/services/user.service'
import type { Chat } from 'grammy/out/types.node'

export default async function attachUser(ctx: Context, next: NextFunction) {
  if (!ctx.from) {
    throw new Error('No from field found')
  }
  const user = await findOrCreateUser(ctx.from)
  if (!user) {
    throw new Error('User not found')
  }

  if (['group', 'supergroup'].includes(ctx.chat?.type || '')) {
    await updateListOfGroups(ctx.from.id, ctx.chat as Chat.GroupChat)
  }

  ctx.dbuser = user
  return next()
}
