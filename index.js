'use strict';
var inquirer = require('inquirer');
var fs = require('fs');
var slugify = require('slugify');
const puppeteer = require('puppeteer');

var questions = [
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

var confirm = [
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Does this look right?',
  },
];

function askQuestions() {

  console.log('👻  Boo! Hello! Found something you want me to archive?\n');

  inquirer.prompt(questions).then((answers) => {

    var type = answers.type;
    var title = answers.title;
    var link = answers.link;
    var tags = answers.tags;
    var timestamp = new Date();
    var description = answers.description;
    
    var jsonValues = {  
      '@context': 'https://schema.org',
      '@type': type,
      name: title,
      url: link,  
      keywords: tags,
      dateCreated: timestamp, 
      description: description  
    };
    var jsonData = JSON.stringify(jsonValues, null, 2);

    var markdownData = '---\n' +
                 'type: "' + type + '"\n' +
                 'title: "' + title + '"\n' +
                 'link: "' + link + '"\n' +
                 'tags: [' + tags + ']\n' +
                 'timestamp: "' + timestamp + '"\n' +
                 '---\n' + description + '\n';

    console.log('\n👻  All done! Here is what I\'ve written down:\n');
    console.log(markdownData);

    inquirer.prompt(confirm).then(answers => {

      var slug = slugify(title);
      var jsonFilename = '_archive/' + slug + '.json';
      var markdownFilename = '_archive/' + slug + '.md';
      var screenshotFilename = '_archive/' + slug + '.png';

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
        console.log('\n👻  Perfect! I saved your metadata and added files to your archive as ' +
        jsonFilename + ' and ' + markdownFilename + ' and ' + screenshotFilename + '.  🎉 🎉 🎉\n');
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
