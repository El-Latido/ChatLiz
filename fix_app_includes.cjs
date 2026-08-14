const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  /\!tutiFruttiState\.players\.includes/g,
  "!(tutiFruttiState.players || []).includes"
);

file = file.replace(
  /tutiFruttiState\.players\.length/g,
  "(tutiFruttiState.players || []).length"
);

fs.writeFileSync('src/App.tsx', file);
