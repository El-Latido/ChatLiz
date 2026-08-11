const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const matchGlobalMsg1 = 'text: `¡Reto de Ajedrez por ${bet * 2} LM!`';
const replaceGlobalMsg1 = 'text: bet > 0 ? `¡Reto de Ajedrez por ${bet * 2} LM!` : `¡Reto de Ajedrez Amistoso!`';
app = app.split(matchGlobalMsg1).join(replaceGlobalMsg1);

fs.writeFileSync('src/App.tsx', app);
