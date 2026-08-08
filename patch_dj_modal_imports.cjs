const fs = require('fs');
let code = fs.readFileSync('src/components/DjControlPanelModal.tsx', 'utf8');

const importRegex = /import \{ X, Mic, Radio, Play, Check, XCircle \} from 'lucide-react';/;
const newImport = "import { X, Mic, Radio, Play, Check, XCircle, StopCircle, Music } from 'lucide-react';";

code = code.replace(importRegex, newImport);
fs.writeFileSync('src/components/DjControlPanelModal.tsx', code);
