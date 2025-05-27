const { writeFileSync } = require('fs');
const { initPositions } = require('./const.js');
const { getSentenceInfo, fixNumber } = require('./helpers.js');

// Change these:
const setupBackground = 'company2-center.png';
const sceneToCreate = [
  {
    character: 'Tom',
    text: "That's excellent. How about the images and graphics we updated?"
  }
];

// This probably shouldn't change to keep scenes consistent
const firstCommandDelay = 1;

try {
  // Create character setup
  const setupCharacters = [];
  for (const line of sceneToCreate) {
    const { character } = line;
    if (!setupCharacters.some(c => c.character === character)) {
      const setupCharacter = {
        character,
        position: initPositions[character],
        opacity: 0
      };
      setupCharacters.push(setupCharacter);
    }
  }

  const fullDialogue = sceneToCreate.map(command => command.text).join(' ');
  const fullSceneInfo = getSentenceInfo(fullDialogue);

  // Create scene setup
  const setup = {
    background: setupBackground,
    characters: setupCharacters,
    audio: {
      filename: fullSceneInfo.file,
      startTime: firstCommandDelay,
      startTimestamp: fullSceneInfo.startTime,
      finishTimestamp: fullSceneInfo.finishTime
    }
  };

  const firstLineInfo = getSentenceInfo(sceneToCreate[0].text);

  // push fade in and first line to commands
  const commands = [
    {
      character: sceneToCreate[0].character,
      opacity: 1,
      startTime: 0
    },
    {
      character: sceneToCreate[0].character,
      startTime: firstCommandDelay,
      finishTime: fixNumber(
        firstLineInfo.finishTime - firstLineInfo.startTime + firstCommandDelay
      ),
      dialogue: {
        text: sceneToCreate[0].text,
        align: 'center'
      }
    }
  ];

  // If more than a one-liner, add middle commands
  if (sceneToCreate.length > 1) {
    // start i = 1 because we already added the first line
    for (let i = 1; i < sceneToCreate.length; i++) {
      const previousLine = sceneToCreate[i - 1];
      const previousLineInfo = getSentenceInfo(previousLine.text);

      const currentLine = sceneToCreate[i];
      const currentLineInfo = getSentenceInfo(currentLine.text);

      // if not the same character, push fade in/out commands
      if (currentLine.character !== previousLine.character) {
        const middleTime = fixNumber(
          (currentLineInfo.startTime - previousLineInfo.finishTime) / 2
        );

        const fadeStartTime = fixNumber(
          previousLineInfo.finishTime -
            fullSceneInfo.startTime +
            firstCommandDelay +
            middleTime
        );

        commands.push(
          {
            character: previousLine.character,
            opacity: 0,
            startTime: fadeStartTime
          },
          {
            character: currentLine.character,
            opacity: 1,
            startTime: fadeStartTime
          }
        );
      }

      // Always push dialogue command for > one-liner commands
      commands.push({
        character: currentLine.character,
        startTime: fixNumber(
          currentLineInfo.startTime -
            fullSceneInfo.startTime +
            firstCommandDelay
        ),
        finishTime: fixNumber(
          currentLineInfo.finishTime -
            fullSceneInfo.startTime +
            firstCommandDelay
        ),
        dialogue: {
          text: currentLine.text,
          align: 'center'
        }
      });
    }
  }

  const lastCharacter = sceneToCreate[sceneToCreate.length - 1].character;
  const lastLineInfo = getSentenceInfo(
    sceneToCreate[sceneToCreate.length - 1].text
  );

  // Always push last fade out
  commands.push({
    character: lastCharacter,
    opacity: 0,
    startTime: fixNumber(
      lastLineInfo.finishTime -
        fullSceneInfo.startTime +
        firstCommandDelay +
        0.5
    )
  });

  const sceneJson = {
    setup,
    commands
  };

  const sceneMarkdown = `
# --scene--

\`\`\`json
${JSON.stringify(sceneJson, null, 2)}
\`\`\`

`;

  writeFileSync('scene.md', sceneMarkdown);
  console.log("Scene written to 'scene.md'");
} catch (e) {
  console.error(e.message);
}
