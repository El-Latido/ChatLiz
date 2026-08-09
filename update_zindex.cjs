const fs = require('fs');

const filesToUpdate = [
  'src/components/ProfileConfigModal.tsx',
  'src/components/AdminConfigLizModal.tsx',
  'src/components/GamesMenuModal.tsx',
  'src/components/StoreModal.tsx',
  'src/components/ChessGameModal.tsx',
  'src/components/SongRequestModal.tsx',
  'src/components/RecoveryModal.tsx',
  'src/App.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace z-50 or z-[70] with z-[100] in modals
    content = content.replace(/z-50(?=\s|")/g, 'z-[100]');
    content = content.replace(/z-\[70\](?=\s|")/g, 'z-[100]');
    content = content.replace(/z-40(?=\s|")/g, 'z-[90]'); // Sidebar and Friends Sidebar to 90
    fs.writeFileSync(file, content);
  }
});
