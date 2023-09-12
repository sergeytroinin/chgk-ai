import prisma from '@/utils/prisma.client'
import type { User as TelegramUser } from '@grammyjs/types'
import type { Chat } from 'grammy/out/types'

export async function findOrCreateUser({
  id,
  first_name,
  last_name,
  username,
}: TelegramUser) {
  const existingUser = await prisma.user.findFirst({ where: { user_id: id } })

  if (existingUser) {
    return existingUser
  }

  const user = await prisma.user.create({
    data: {
      user_id: id,
      first_name,
      last_name,
      username,
    },
  })

  return user
}

export async function updateListOfGroups(
  user_id: number,
  chat?: Chat.GroupChat
) {
  if (!chat) {
    return
  }

  const group = await prisma.group.findFirst({ where: { group_id: chat.id } })

  if (!group) {
    await prisma.group.create({
      data: {
        group_id: chat.id,
        title: chat.title,
        users: { connect: { user_id } },
      },
    })
    return
  }

  return prisma.user.update({
    where: { user_id },
    data: { groups: { connect: { id: group.id } } },
  })
}
