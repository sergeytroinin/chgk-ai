const puppeteer = require('puppeteer');
const fs = require('fs');

// We need to parse 20 pages of packages
// It's and arbitrary number, but I don't think we need properly handle end of the pagination
const totalPages = process.argv[2] || 19;

if (isNaN(totalPages)) {
  console.error('Invalid input. Enter a number for total pages.');
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let allData = [];

  console.time('Total parsing time');
  console.log('Parsing data...');

  for (let i = 0; i <= totalPages; i++) {
    await page.goto(
      `https://db.chgk.info/search/tours/from_2018-01-01?page=${i}`
    );

    // Get all the links and titles for packages
    const packageLinks = await page.$$eval(
      '#main > div.box > div > dl > dt > a',
      (links) =>
        links.map((link) => ({
          href: link.href,
          title: link.textContent.trim(),
        }))
    );

    for (const link of packageLinks) {
      // Skip packages with specific words in the title
      // We want to skip tours published separately to avoid duplicates
      // It won't catch all of them, but it's fine here
      if (
        link.title.split(/\s+/).some((word) => /^тур$|^разминка$/i.test(word))
      ) {
        console.log(`Skipping package ${link.title}`);
        continue;
      }

      await page.goto(link.href);

      console.log(`Parsing package ${link.title}`);

      let editor = 'N/A'; // Some packages has weird structure for editors. Not worth parsing

      try {
        await page.$eval('#main > div.editor', (el) => el.textContent.trim());
      } catch (e) {
        console.log(`No editor found for package ${link.title}`);
      }

      const questions = await page.$$eval('#main > div.question', (divs) => {
        // REMINDER: Won't work outside the $$eval scope
        const cleanString = (str) => {
          if (typeof str !== 'string') {
            console.warn(`cleanString received non-string value: ${str}`);
            return str;
          }
          return str.replace(/\n/g, ' ').replace(/"/g, "'");
        };

        return divs
          .map((div) => {
            // Check all the conditions under which we don't want to parse the question
            // Use <br/> as a heuristic to filter out questions with multiple subquestions and instructions for narrator
            const brs = div.querySelectorAll('br');
            const comment = div
              .querySelector('.Comments')
              ?.nextSibling?.textContent.trim();
            if (
              div.querySelector('.razdatka') ||
              div.querySelector('img') ||
              !comment ||
              brs.length > 0
            )
              return null;

            return {
              text: cleanString(
                div.querySelector('.Question')?.nextSibling?.textContent.trim()
              ),
              answer: cleanString(
                div.querySelector('.Answer')?.nextSibling?.textContent.trim()
              ),
              comment: cleanString(comment),
            };
          })
          .filter((q) => q !== null);
      });

      allData.push({
        title: link.title,
        editor,
        questions,
      });
    }
  }

  // Clenup before saving the data to the file
  // Remove duplicates that we didn't catch earlier
  const uniqueQuestions = new Set();

  allData.forEach((package) => {
    package.questions = package.questions.filter((question) => {
      const questionString = JSON.stringify(question);
      if (uniqueQuestions.has(questionString)) {
        return false;
      } else {
        uniqueQuestions.add(questionString);
        return true;
      }
    });
  });

  fs.writeFileSync('parsed_data.json', JSON.stringify(allData, null, 2));

  console.timeEnd('Total parsing time');

  await browser.close();
})();
