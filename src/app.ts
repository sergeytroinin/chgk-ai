import 'module-alias/register';

import { ignoreOld, sequentialize } from 'grammy-middlewares';
import { run } from '@grammyjs/runner';
import attachUser from '@/middlewares/attachUser';
import bot from '@/helpers/bot';
import handleQuestion from './handlers/handleQuestion';

async function runApp() {
  console.log('Starting app...');
  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld(60 * 60 * 3))
    .use(attachUser);

  bot.command('question', handleQuestion);

  await bot.api.deleteMyCommands();

  bot.catch(console.error);

  await bot.init();
  run(bot);
  console.info(`Bot ${bot.botInfo.username} is up and running`);
}

void runApp();
