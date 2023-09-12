import type Context from '@/models/Context';

export default async function handleMessage(ctx: Context) {
  console.log(ctx.message);
  await ctx.reply('👋');
}
