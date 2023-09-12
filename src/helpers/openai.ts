import env from './env';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: env.OPEN_AI_API_KEY });

// Helper: Get Latest Fine-tuned Model
const getLatestModel = () => {
  // TODO: Implement retrieving the latest fine-tuned model
  return 'ft:gpt-3.5-turbo-0613:personal:mycustomsuffix:7xz9GoMa';
};

export default async function generateQuestion() {
  const model = getLatestModel();

  if (!model) {
    console.log('No fine-tuned models available.');
    return;
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `The assistant is trained to generate quiz questions similar to What?Where?When? game.
          Generate trivia questions for a game of "What? Where? When?" These questions should be complex and open-ended, suitable for a team to discuss. 
          Cover topics like history, science, art, and geography. Questions should require deductive reasoning and not be easily answerable with a quick internet search.
          `,
      },
      { role: 'user', content: 'Придумай мне вопрос ЧГК' },
    ],
  });

  return response.choices[0].message?.content;
}
