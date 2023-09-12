import generateQuestion from '@/helpers/openai';
import type Context from '@/models/Context';

export default async function handleQuestion(ctx: Context) {
  // We don't want to save it for now. The quality is totally off
  const question = await generateQuestion();
  await ctx.reply(question as string);
}
