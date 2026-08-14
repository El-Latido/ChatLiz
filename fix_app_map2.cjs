const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  /\{tutiFruttiState\.players\?\.map/g,
  "{Array.isArray(tutiFruttiState.players) && tutiFruttiState.players.map"
);

fs.writeFileSync('src/App.tsx', file);
