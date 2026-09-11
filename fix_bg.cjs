const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBg = /\{\/\* Cyberpunk Grid Background \*\/\}/;

const newBg = `{user?.bgImage && (
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity" style={{ backgroundImage: \`url(\${user.bgImage})\`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      )}
      {/* Cyberpunk Grid Background */}`;

code = code.replace(targetBg, newBg);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx Background Image");
