const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');
file = file.replace(/const chatBg = localStorage.getItem\('chatBg'\);/g, `
  let chatBg = null;
  try {
    chatBg = localStorage.getItem('chatBg');
  } catch (e) {
    console.warn("localStorage is blocked");
  }
`);
fs.writeFileSync('src/App.tsx', file);
