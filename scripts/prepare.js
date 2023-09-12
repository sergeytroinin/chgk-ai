const fs = require('fs');
const path = require('path');
const writeStream = fs.createWriteStream(
  path.join(__dirname, '../data', 'fine_tuning_data.jsonl')
);

const maxQuestions = process.argv[2] || 100;

if (isNaN(maxQuestions)) {
  console.error('Invalid input. Please enter a number.');
  process.exit(1);
}

const originalData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data', 'parsed_data.json'))
);
let counter = 0;

originalData.forEach((pkg) => {
  if (counter >= maxQuestions) return;

  pkg.questions.forEach((q) => {
    if (counter >= maxQuestions) return;

    const msgObj = {
      messages: [
        {
          role: 'system',
          content:
            'The assistant is trained to generate quiz questions similar to CHGK.',
        },
        { role: 'user', content: 'Придумай мне вопрос ЧГК' },
        {
          role: 'assistant',
          content: `Question: ${q.text}\nAnswer: ${q.answer}\nComment: ${q.comment}`,
        },
      ],
    };

    writeStream.write(JSON.stringify(msgObj) + '\n');
    counter++;
  });
});

writeStream.end(() => {
  console.log(`Total questions added: ${counter}`);
});
