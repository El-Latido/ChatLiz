const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

file = file.replace(
  /s\.title/g,
  "s?.title"
);

file = file.replace(
  /s\.artists/g,
  "s?.artists"
);

file = file.replace(
  /s\.requester/g,
  "s?.requester"
);

file = file.replace(
  /req\.title/g,
  "req?.title"
);

file = file.replace(
  /req\.status/g,
  "req?.status"
);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
