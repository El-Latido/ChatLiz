const fs = require('fs');
let code = fs.readFileSync('src/components/DjControlPanelModal.tsx', 'utf8');

code = code.replace("Detener Transmisión en Vivo", "Cerrar Programa");

fs.writeFileSync('src/components/DjControlPanelModal.tsx', code);
