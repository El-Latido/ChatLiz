const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }} className="bg-gradient-to-br from-[#0B1220] via-[#121B2A] to-[#0A101C] text-gray-200 flex flex-col font-sans">`;

const replacement = `return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }} className="bg-gradient-to-br from-[#0B1220] via-[#121B2A] to-[#0A101C] text-gray-200 flex flex-col font-sans">
      <DebugConsole />`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/App.tsx', content);
