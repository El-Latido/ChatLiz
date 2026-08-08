const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importRegex = /import \{ SongRequestModal \} from '\.\/components\/SongRequestModal';/;
code = code.replace(importRegex, "import { SongRequestModal } from './components/SongRequestModal';\nimport { DjControlPanelModal } from './components/DjControlPanelModal';");

const stateRegex = /const \[isSongRequestOpen, setIsSongRequestOpen\] = useState\(false\);/;
code = code.replace(stateRegex, "const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);\n  const [isDjPanelOpen, setIsDjPanelOpen] = useState(false);");

const renderRegex = /<InlineRadio \/>/;
code = code.replace(renderRegex, `<InlineRadio />
      {user.role === 'dj' && (
         <button 
            onClick={() => setIsDjPanelOpen(true)}
            className="fixed bottom-36 left-4 z-40 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#D4AF37] p-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
            title="Panel de DJ"
         >
            <Mic size={20} />
         </button>
      )}`);

const modalRegex = /\{isSongRequestOpen && <SongRequestModal onClose=\{\(\) => setIsSongRequestOpen\(false\)\} currentUser=\{user\} \/>\}/;
code = code.replace(modalRegex, `{isSongRequestOpen && <SongRequestModal onClose={() => setIsSongRequestOpen(false)} currentUser={user} />}\n      {isDjPanelOpen && <DjControlPanelModal onClose={() => setIsDjPanelOpen(false)} currentUser={user} />}`);

fs.writeFileSync('src/App.tsx', code);
