const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacementFn = `
  const closeAllModals = () => {
    setIsConfigOpen(false);
    setSelectedUserModal(null);
    setAdminConfigLizOpen(false);
    setIsGamesMenuOpen(false);
    setIsStoreOpen(false);
    setIsSongRequestOpen(false);
  };
`;

if (!content.includes('closeAllModals')) {
  // Find a good place to insert it. E.g. right before const handleSendMessage
  content = content.replace(/const handleSendMessage =/g, replacementFn + '\n  const handleSendMessage =');
}

// Now replace setters inside onClick with closeAllModals(); set...
content = content.replace(/onClick=\{\(\) => setIsGamesMenuOpen\(true\)\}/g, 'onClick={() => { closeAllModals(); setIsGamesMenuOpen(true); }}');
content = content.replace(/onClick=\{\(\) => \{\s*setStoreCategory\(undefined\);\s*setIsStoreOpen\(true\);\s*\}\}/g, 'onClick={() => { closeAllModals(); setStoreCategory(undefined); setIsStoreOpen(true); }}');
content = content.replace(/onClick=\{\(\) => setIsSongRequestOpen\(true\)\}/g, 'onClick={() => { closeAllModals(); setIsSongRequestOpen(true); }}');
content = content.replace(/onClick=\{\(\) => \{\s*setIsConfigOpen\(true\);\s*\}\}/g, 'onClick={() => { closeAllModals(); setIsConfigOpen(true); }}');

// Note: setAdminConfigLizOpen is usually triggered FROM another modal or inside it, so we don't necessarily close all if it's meant to replace. But if it replaces, closing all is good!
// The selectedUserModal is opened like setSelectedUserModal(u)
content = content.replace(/onClick=\{\(\) => setSelectedUserModal\(u\)\}/g, 'onClick={() => { closeAllModals(); setSelectedUserModal(u); }}');


fs.writeFileSync('src/App.tsx', content);
