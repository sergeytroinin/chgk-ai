import { Bot } from 'grammy'
import Context from '@/models/Context'
import env from '@/helpers/env'

const bot = new Bot<Context>(env.TG_TOKEN, {
  ContextConstructor: Context,
})

export default bot
