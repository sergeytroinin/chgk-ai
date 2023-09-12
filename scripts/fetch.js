const fs = require('fs');
const path = require('path');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const totalPackages = process.argv[2] || 100;

if (isNaN(totalPackages)) {
  console.error('Invalid input. Enter a proper number for total packages.');
  process.exit(1);
}

const isValid = (question) => {
  let isValid = true;
  const banned = [
    'pic',
    '[',
    'раздатка',
    'раздаточный',
    'разминочный',
    'дуплет',
    '1.',
    '1)',
  ];
  banned.forEach((word) => {
    if (question.trim().includes(word)) {
      isValid = false;
    }
  });
  return isValid;
};

(async () => {
  const allData = [];

  console.time('Total fetching time');
  console.log('Fetching data...');

  const packagesResponse = await fetch(
    `http://www.db.chgk.info/packages?order%5BcreatedAt%5D=desc&page=1&itemsPerPage=${totalPackages}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const packages = (await packagesResponse.json())['hydra:member'];
  const fullPackagesResponses = await Promise.all(
    packages.map((package) =>
      fetch(`http://www.db.chgk.info/packages/${package.id}`)
    )
  );
  const fullPackages = await Promise.all(
    fullPackagesResponses.map((res) => res.json())
  );
  fullPackages.forEach((package) => {
    const tours = package.tours;
    const questions = [];
    tours.forEach((tour) => {
      tour.questions.forEach((question) => {
        if (!questions.find((q) => q.text === question.question)) {
          if (question.comments && isValid(question.question)) {
            if (question.number > 0) {
              questions.push({
                text: question.question,
                answer: question.answer,
                comment: question.comments,
              });
            }
          }
        }
      });
    });
    allData.push({
      title: package.title,
      editor: package.editors || 'N/A',
      questions,
    });
  });

  fs.writeFileSync(
    path.join(__dirname, '../data', 'parsed_data.json'),
    JSON.stringify(allData, null, 2)
  );

  console.timeEnd('Total fetching time');
})();
