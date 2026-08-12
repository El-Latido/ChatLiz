const fs = require('fs');

let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

file = file.replace(
`const MAX_SIZE = 400; // Resize to max 400px to save space in Firestore`,
`const MAX_SIZE = 150; // Resize to max 150px for fast fallback to Base64 in Firestore (< 50KB)`
);

file = file.replace(
`const dataUrl = canvas.toDataURL('image/jpeg', 0.8);`,
`const dataUrl = canvas.toDataURL('image/jpeg', 0.5);`
);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
