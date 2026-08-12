const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

// Update song_ended to push the full object
file = file.replace(
`songHistory.unshift(currentRequestedSong.title);`,
`songHistory.unshift(currentRequestedSong);`
);

fs.writeFileSync('server.ts', file);
