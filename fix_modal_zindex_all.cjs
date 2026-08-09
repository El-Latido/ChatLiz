const fs = require('fs');

const filesToUpdate = [
  'src/components/ProfileConfigModal.tsx',
  'src/components/AdminConfigLizModal.tsx',
  'src/components/GamesMenuModal.tsx',
  'src/components/StoreModal.tsx',
  'src/components/ChessGameModal.tsx',
  'src/components/SongRequestModal.tsx',
  'src/components/RecoveryModal.tsx',
  'src/components/DjControlPanelModal.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/z-\[110\]/g, 'z-[120]');
    fs.writeFileSync(file, content);
  }
});
