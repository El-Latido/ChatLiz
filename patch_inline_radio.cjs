const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

code = code.replace(
  "{currentRequestedSong && (",
  "{currentRequestedSong && !currentLiveDJ && ("
);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
