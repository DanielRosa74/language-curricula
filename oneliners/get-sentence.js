const { readFileSync, readdirSync, writeFileSync } = require("fs");

// Change these:
const sentenceToFind =
  "I understand, Tom. It can be a commitment, but I can't stand seeing this great software being private. Open source is all about transparency and accessibility, and that's something I truly believe in.";
const character = "Sophie";
const textAlign = "center";
const backgroundFile = "company2-center.png";

// Add to this if the character isn't there:
const initPositions = {
  Tom: { x: 50, y: 15, z: 1.2 },
  Maria: { x: 50, y: 0, z: 1.5 },
  Sophie: { x: 50, y: 0, z: 1.4 },
  Jake: { x: 50, y: 0, z: 1.4 },
  Brian: { x: 50, y: 15, z: 1.2 },
  Sarah: { x: 50, y: 0, z: 1.4 },
  James: { x: 50, y: 15, z: 1.2 },
  Alice: { x: 50, y: 0, z: 1.4 },
  Bob: { x: 50, y: 15, z: 1.2 },
  Mark: { x: 50, y: 0, z: 1.4 },
  Linda: { x: 50, y: 0, z: 1.4 },
  Lisa: { x: 50, y: 15, z: 1.2 },
  David: { x: 50, y: 0, z: 1.4 },
  Anna: { x: 50, y: 15, z: 1.2 },
  Expert: { x: 50, y: 15, z: 1.2 },
  Amy: { x: 50, y: 0, z: 1.4 },
  Candidate: { x: 50, y: 0, z: 1.4 },
  "Second Candidate": { x: 50, y: 15, z: 1.2 }
};

const splitSentence = sentenceToFind.split(" ");
const dir = "words-json-files";
const files = readdirSync(dir);

let sentenceFound = false;

files.forEach((file) => {
  const json = JSON.parse(readFileSync(`${dir}/${file}`));

  if (json.text.includes(sentenceToFind)) {
    sentenceFound = true;

    const { words } = json;

    for (let i = 0; i < words.length; i++) {
      // first word matches
      if (words[i].word === splitSentence[0]) {
        const isCorrectFirstWord = true;

        // check if the next words are correct
        let sentenceMatches = true;
        for (let j = 1; j < splitSentence.length; j++) {
          if (words[i + j].word !== splitSentence[j]) {
            sentenceMatches = false;
          }
        }

        if (sentenceMatches) {
          const startTimestamp = parseFloat(words[i].startTime).toFixed(2);
          const finishTimestamp = parseFloat(
            words[i + splitSentence.length - 1].finishTime
          ).toFixed(2);
          const finishTime = parseFloat(
            finishTimestamp - startTimestamp + 1
          ).toFixed(2);

          if (isCorrectFirstWord) {
            const oneliner = `
# --scene--

\`\`\`json
{
  "setup": {
    "background": "${backgroundFile}",
    "characters": [
      {
        "character": "${character}",
        "position": ${JSON.stringify(initPositions[character])},
        "opacity": 0
      }
    ],
    "audio": {
      "filename": "${file.replace(".json", ".mp3")}",
      "startTime": 1,
      "startTimestamp": ${startTimestamp},
      "finishTimestamp": ${finishTimestamp}
    }
  },
  "commands": [
    {
      "character": "${character}",
      "opacity": 1,
      "startTime": 0
    },
    {
      "character": "${character}",
      "startTime": 1,
      "finishTime": ${finishTime},
      "dialogue": {
        "text": "${sentenceToFind}",
        "align": "${textAlign}"
      }
    },
    {
      "character": "${character}",
      "opacity": 0,
      "startTime": ${(parseFloat(finishTime) + 0.5).toFixed(2)}
    }
  ]
}
\`\`\`
`;

            writeFileSync("oneliner.md", oneliner);
            console.log(`Oneliner file created`);
            process.exit();
          }
        }
      }
    }
  }
});

if (!sentenceFound) {
  console.log(`Could not find "${sentenceToFind}" in the JSON files.`);
}
