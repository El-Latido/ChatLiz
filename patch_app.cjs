const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ AdminConfigLizModal \} from '\.\/components\/AdminConfigLizModal';/g, "import { AdminConfigAiModal } from './components/AdminConfigAiModal';");

code = code.replace(/const \[adminConfigLizOpen, setAdminConfigLizOpen\] = useState\(false\);/g, "const [adminConfigAiOpen, setAdminConfigAiOpen] = useState(false);\n  const [currentAdminAi, setCurrentAdminAi] = useState('Elizabeth');");

code = code.replace(/setAdminConfigLizOpen={setAdminConfigLizOpen}/g, "setAdminConfigAiOpen={setAdminConfigAiOpen}");
code = code.replace(/setAdminConfigLizOpen/g, "setAdminConfigAiOpen");
code = code.replace(/adminConfigLizOpen/g, "adminConfigAiOpen");
code = code.replace(/AdminConfigLizModal/g, "AdminConfigAiModal");

const profileClickOld = `                    if (selectedUserModal.username === 'Elizabeth' && user.username.trim() === 'Axiss') {
                        setAiProfileForm({ profilePic: selectedUserModal.profilePic || '', statusMessage: selectedUserModal.statusMessage || 'Administradora', systemInstruction: selectedUserModal.systemInstruction || '' });
                        setSelectedUserModal(null);
                        closeAllModals(); setAdminConfigAiOpen(true);
                    }`;
const profileClickNew = `                    if (selectedUserModal.isAi && user.username.trim() === 'Axiss') {
                        setAiProfileForm({ profilePic: selectedUserModal.profilePic || '', statusMessage: selectedUserModal.statusMessage || 'Inteligencia Artificial', systemInstruction: selectedUserModal.systemInstruction || '' });
                        setCurrentAdminAi(selectedUserModal.username);
                        setSelectedUserModal(null);
                        closeAllModals(); setAdminConfigAiOpen(true);
                    }`;
code = code.replace(profileClickOld, profileClickNew);

const profileClassOld = `\${selectedUserModal.username === 'Elizabeth' && user.username.trim() === 'Axiss' ? 'cursor-pointer group' : ''}`;
const profileClassNew = `\${selectedUserModal.isAi && user.username.trim() === 'Axiss' ? 'cursor-pointer group' : ''}`;
code = code.replace(profileClassOld, profileClassNew);

const profileOverlayOld = `\{selectedUserModal.username === 'Elizabeth' && user.username.trim() === 'Axiss' && \(`;
const profileOverlayNew = `\{selectedUserModal.isAi && user.username.trim() === 'Axiss' && \(`;
code = code.replace(profileOverlayOld, profileOverlayNew);

// Add aiUsername prop to AdminConfigAiModal
const modalRenderOld = `<AdminConfigAiModal
          setAdminConfigAiOpen={setAdminConfigAiOpen}
          aiProfileForm={aiProfileForm}
          setAiProfileForm={setAiProfileForm}
        />`;
const modalRenderNew = `<AdminConfigAiModal
          aiUsername={currentAdminAi}
          setAdminConfigAiOpen={setAdminConfigAiOpen}
          aiProfileForm={aiProfileForm}
          setAiProfileForm={setAiProfileForm}
        />`;
code = code.replace(modalRenderOld, modalRenderNew);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
