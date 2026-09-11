const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{user?.bgImage && (
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity" style={{ backgroundImage: \`url(\${user.bgImage})\`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      )}`;

const replacement = `{(user?.bgImage || user?.preferred_background) && (
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity" style={{ backgroundImage: \`url(\${user.bgImage || user.preferred_background})\`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched background logic in App.tsx");
