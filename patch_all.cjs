const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/Object.values\(cats\)\.reduce\(\(acc: number, val: any\) => acc \+ val\.points, 0\)/g, "Number(Object.values(cats).reduce((acc: any, val: any) => acc + val.points, 0))");
fs.writeFileSync('src/App.tsx', appCode);

// Patch AudioVisualizer.tsx
let avCode = fs.readFileSync('src/components/AudioVisualizer.tsx', 'utf8');
avCode = avCode.replace(/const requestRef = useRef<number>\(\);/, "const requestRef = useRef<number | undefined>(undefined);");
fs.writeFileSync('src/components/AudioVisualizer.tsx', avCode);

// Patch InlineRadio.tsx
let radioCode = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');
radioCode = radioCode.replace(/import ReactPlayer from 'react-player';/, "import ReactPlayer from 'react-player';\nconst Player = ReactPlayer as any;");
radioCode = radioCode.replace(/<ReactPlayer/g, "<Player");
radioCode = radioCode.replace(/\{\/\* @ts-ignore \*\/\}/g, "");
fs.writeFileSync('src/components/InlineRadio.tsx', radioCode);

