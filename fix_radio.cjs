const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

file = file.replace(
  /{songHistory && songHistory\.length > 0 && \(/g,
  "{Array.isArray(songHistory) && songHistory.length > 0 && ("
);

file = file.replace(
  /{songQueue && songQueue\.length > 0 && \(/g,
  "{Array.isArray(songQueue) && songQueue.length > 0 && ("
);

file = file.replace(
  /{myRequests\.length > 0 && \(/g,
  "{Array.isArray(myRequests) && myRequests.length > 0 && ("
);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
