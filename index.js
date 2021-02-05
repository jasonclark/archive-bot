const inquirer = require('inquirer');
const fs = require('fs');
const slugify = require('slugify');
const puppeteer = require('puppeteer');

const questions = [
  {
    type: 'list',
    name: 'type',
    message: 'What type of thing are you archiving?',
    choices: [
      'Article', 'Book', 'Course', 
      'CreativeWork', 'Dataset', 'MediaObject', 
      'Movie', 'MusicRecording', 'Photograph', 
      'SoftwareApplication', 'WebPage', 'WebSite'
    ],
  },
  {
    type: 'input',
    name: 'title',
    message: 'What is the title?',
  },
  {
    type: 'input',
    name: 'link',
    message: 'What is the url?',
  },
  {
    type: 'checkbox',
    name: 'tags',
    message: 'Would you like me to add any tags?',
    choices: [
      { name: '_todo' },
      { name: '_toread' },
      { name: 'archive' },
      { name: 'library' },
      { name: 'metadata' },
      { name: 'design' },
      { name: 'ux' },
      { name: 'business' },
    ],
  },
  {
    type: 'input',
    name: 'description',
    message: 'How about a description?',
  },
];

const confirm = [
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Does this look right?',
  },
];

function askQuestions() {

  console.log('👻  Boo! Hello! Found something you want me to archive?\n');

  inquirer.prompt(questions).then((answers) => {

    const type = answers.type;
    const title = answers.title;
    const link = answers.link;
    const tags = answers.tags;
    const timestamp = new Date();
    const description = answers.description;
    
    const jsonValues = {  
      '@context': 'https://schema.org',
      '@type': type,
      name: title,
      url: link,  
      keywords: tags,
      dateCreated: timestamp, 
      description  
    };
    const jsonData = JSON.stringify(jsonValues, null, 2);

    const markdownData = `-----\n# title: "${title}"\n* type: "${type}"\n* link: "[${link}](${link})"\n* tags: [${tags}]\n* timestamp: "${timestamp}"\n-----\n> ${description}\n`;

    console.log('\n👻  All done! Here is what I\'ve written down:\n');
    console.log(markdownData);

    inquirer.prompt(confirm).then(answers => {

      const slug = slugify(title);
      const jsonFilename = `_archive/${slug}.json`;
      const markdownFilename = `_archive/${slug}.md`;
      const screenshotFilename = `_archive/${slug}.png`;

      function writeArchiveFiles() {
        fs.writeFile(jsonFilename, jsonData, (err) => {
          if (err) throw err;
          //console.log('JSON data written to file.');
        });
        fs.writeFile(markdownFilename, markdownData, (err) => {
          if (err) throw err;
          //console.log('Markdown data written to file.');
        });
        (async() => {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          //await page.emulate(devices['iPhone 6']);
          await page.goto(link);
          await page.screenshot({path: screenshotFilename, fullPage: true});
          await browser.close();
        })();
        console.log(`\n👻  Perfect! I saved your metadata and added files to your archive as ${jsonFilename} and ${markdownFilename} and ${screenshotFilename}.  🎉 🎉 🎉\n`);
      }

      if (answers.confirm) {
        // Make the files
        writeArchiveFiles();
      } else {
        // Ask the questions again
        console.log('\n👻  Oops, let\'s try again!\n');
        askQuestions();
      }

    });

  });

}

askQuestions();
