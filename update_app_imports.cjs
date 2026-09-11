const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("StoreModal")) {
    const importStr = `import StoreModal from "./components/StoreModal";\nimport AdModal from "./components/AdModal";\nimport ProfileFrame from "./components/ProfileFrame";\nimport { Store } from 'lucide-react';\n`;
    code = code.replace('import ActiveCallModal from "./components/ActiveCallModal";', importStr + 'import ActiveCallModal from "./components/ActiveCallModal";');
    
    // Add states
    const statesStr = `  const [showStoreModal, setShowStoreModal] = useState(false);\n  const [showRealAdModal, setShowRealAdModal] = useState(false);\n`;
    code = code.replace('  const [showProfileConfig, setShowProfileConfig] = useState(false);', '  const [showProfileConfig, setShowProfileConfig] = useState(false);\n' + statesStr);
    
    // Replace the old Ad bypass with the new Real AdModal
    const targetAdButton = /<button[\s\S]*?className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95"[\s\S]*?>[\s\S]*?Ver Anuncio Nativo \(\+100 Monedas\)[\s\S]*?<\/button>/;
    const newAdButton = `<button
              onClick={() => setShowRealAdModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95 animate-pulse"
            >
              <PlaySquare size={20} />
              Ver Video (+100 Monedas)
            </button>`;
            
    code = code.replace(targetAdButton, newAdButton);
    
    // Add modals render
    const modalsRender = `
      {showStoreModal && <StoreModal onClose={() => setShowStoreModal(false)} user={user} setUser={setUser} />}
      {showRealAdModal && <AdModal onClose={() => setShowRealAdModal(false)} onSuccess={(newCoins) => {
          setUser(prev => ({ ...prev, lizCoins: newCoins }));
          setOutOfTokensAi(null);
          alert("¡Felicidades! Has recargado 100 Liz-Moneditas.");
          setShowRealAdModal(false);
      }} />}
    `;
    
    code = code.replace('{showProfileConfig && (', modalsRender + '\n      {showProfileConfig && (');
    
    // Add Store button to header
    const storeBtn = `
          <button onClick={() => setShowStoreModal(true)} className="p-2 rounded-xl transition-colors bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] ml-2" title="Tienda de Marcos">
            <Store size={20} />
          </button>
    `;
    code = code.replace('<button onClick={() => setIsIncognito(!isIncognito)}', storeBtn + '\n          <button onClick={() => setIsIncognito(!isIncognito)}');
    
    // Inject ProfileFrame into avatars
    const avatarRegex = /<img[\s\S]*?className=\{`w-8 h-8 rounded-full object-cover border shadow-sm \$\{m\.sender === "Elizabeth" \? "border-white\/10" : "border-\[\#5A52A5\]\/30 bg-white\/5"\}\`\}[\s\S]*?alt=\{m\.sender\}[\s\S]*?\/>/g;
    
    code = code.replace(avatarRegex, (match) => {
        return match + `\n                              <ProfileFrame frameId={senderInfo?.activeFrame} />`;
    });
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated App.tsx imports, state, UI");
} else {
    console.log("Already updated or StoreModal not imported correctly.");
}
