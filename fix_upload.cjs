const fs = require('fs');
let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

// We want to remove the logic inside handleSaveProfile that does the upload.
// Everything from "if (selectedFile && fotoURL.startsWith('data:image')) {"
// to the end of the second block before "const savePromise = setDoc("

const parts = file.split('const savePromise = setDoc');
if (parts.length === 2) {
    let topPart = parts[0];
    const keepTop = topPart.substring(0, topPart.indexOf('// Si el usuario seleccionó un nuevo archivo'));
    
    file = keepTop + '\n      const savePromise = setDoc' + parts[1];
    fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
    console.log("Fixed!");
} else {
    console.log("Could not find split point");
}
