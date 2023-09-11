const fs = require('fs');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const configFile = '.fine-tune-config.json';

// Helper: Read Config
const readConfig = () => {
  if (fs.existsSync(configFile)) {
    return JSON.parse(fs.readFileSync(configFile));
  }
  return {};
};

// Helper: Get Latest Fine-tuned Model
const getLatestModel = (config) => {
  let latestModel = null;
  let latestTime = null;

  for (const hash in config) {
    const entry = config[hash];
    if (entry.status === 'succeeded') {
      const startTime = new Date(entry.startedAt);
      if (!latestTime || startTime > latestTime) {
        latestTime = startTime;
        latestModel = entry.model;
      }
    }
  }
  return latestModel;
};

async function main() {
  const config = readConfig();
  const model = getLatestModel(config);

  if (!model) {
    console.log('No fine-tuned models available.');
    return;
  }

  const response = await openai.createCompletion(model, {
    messages: [
      {
        role: 'system',
        content:
          'The assistant is trained to generate quiz questions similar to CHGK.',
      },
      { role: 'user', content: 'Придумай мне вопрос ЧГК' },
    ],
  });

  console.log(`Model: ${model}`);
  console.log(`Response: ${response.choices[0].message?.content}`);
}

main().catch((err) => console.error(err));
