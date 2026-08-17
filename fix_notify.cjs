const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \{ addDoc, collection, serverTimestamp \} = await import\('firebase\/firestore'\);/g,
  `// using imports from top of file`
);

code = code.replace(
  /const \{ addDoc, collection, serverTimestamp \} = await import\('firebase\/firestore'\);/,
  ``
);

fs.writeFileSync('src/App.tsx', code);
