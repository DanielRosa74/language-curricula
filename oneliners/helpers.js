const { readFileSync, readdirSync } = require('fs');

function fixNumber(n) {
  return parseFloat(n.toFixed(2));
}

// looks through words-json-files and returns { startTime, finishTime, file } of a
// sentence or throws an error if the sentence isn't found
function getSentenceInfo(sentence) {
  const splitSentence = sentence.split(' ');
  const dir = 'words-json-files';
  const files = readdirSync(dir);

  let result = null;

  files.forEach(file => {
    const json = JSON.parse(readFileSync(`${dir}/${file}`));

    if (json.text.includes(sentence)) {
      //sentenceFound = true;
      const { words } = json;

      for (let i = 0; i < words.length; i++) {
        // first word matches
        if (words[i].word === splitSentence[0]) {
          // check if the next words are the rest of the sentence
          let sentenceMatches = true;
          for (let j = 1; j < splitSentence.length; j++) {
            if (words[i + j].word !== splitSentence[j]) {
              sentenceMatches = false;
            }
          }

          if (sentenceMatches) {
            result = {
              startTime: fixNumber(words[i].startTime),
              finishTime: fixNumber(words[i + splitSentence.length - 1].finishTime),
              file: file.replace('.json', '.mp3')
            };
            
            break;
          }
        }
      }
    }
  });

  if (result) return result;
  throw new Error(`Sentence "${sentence}" not found.`);
}

module.exports = { fixNumber, getSentenceInfo };
