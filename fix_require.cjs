const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix 1: remove require from firebase/firestore and use already imported
code = code.replace(
  /const \{ updateDoc, doc \} = require\("firebase\/firestore"\);/,
  `// updateDoc and doc are already imported from "firebase/firestore"`
);

// Fix 2: remove require for fs and path
code = code.replace(
  /!require\("fs"\)\.existsSync\(require\("path"\)\.join\(process\.cwd\(\), "dist", "index\.html"\)\)/,
  `!fs.existsSync(path.join(process.cwd(), "dist", "index.html"))`
);

fs.writeFileSync('server.ts', code);
