const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const match1 = `const bet = parseInt(gameId.split('_')[1], 10) || 10;`;
const replace1 = `const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;`;

app = app.split(match1).join(replace1);
fs.writeFileSync('src/App.tsx', app);
