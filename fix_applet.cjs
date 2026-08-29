const fs = require('fs');

// 1. Fix App.tsx - setAdminConfigLizOpen(true) should be setIsConfigOpen(true) for user profile
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
// Fix instances where user's profile picture opens admin config
appContent = appContent.replace(/<div className="relative group cursor-pointer" onClick=\{\(\) => \{ closeAllModals\(\); setAdminConfigLizOpen\(true\); \}\}>/g, '<div className="relative group cursor-pointer" onClick={() => { closeAllModals(); setIsConfigOpen(true); }}>');
appContent = appContent.replace(/<div className="relative mb-3 group cursor-pointer" onClick=\{\(\) => \{ closeAllModals\(\); setAdminConfigLizOpen\(true\); \}\}>/g, '<div className="relative mb-3 group cursor-pointer" onClick={() => { closeAllModals(); setIsConfigOpen(true); }}>');
fs.writeFileSync('src/App.tsx', appContent);

// 2. Fix server.ts - broadcast_profile_change and Elizabeth prompt
let serverContent = fs.readFileSync('server.ts', 'utf8');

// Fix broadcast_profile_change
serverContent = serverContent.replace(
  /activeUsers\[data\.username\]\.statusMessage = data\.statusMessage;\n        io\.emit\("active_users", Object\.values\(activeUsers\)\);/g,
  'activeUsers[data.username].statusMessage = data.statusMessage;\n        emitActiveUsers();'
);

// Modify Elizabeth Prompt
serverContent = serverContent.replace(
  "Longitud adaptativa: Adapta drásticamente la longitud de tu respuesta. Si te hacen una pregunta simple o casual (ej. '¿qué color te gusta?', 'hola'), responde de forma CORTA, directa y natural (ej. 'El violeta, ¿y a ti?'). SOLO da respuestas largas y detalladas si la pregunta es compleja, técnica o de programación.",
  "Longitud adaptativa: Adapta drásticamente la longitud de tu respuesta. Comprende mensajes normales sin necesidad de signos de interrogación y responde de manera coherente al contexto. Si te hacen una pregunta simple o un saludo, responde de forma CORTA, directa y natural. SOLO da respuestas largas si la charla es compleja, técnica o de programación."
);

fs.writeFileSync('server.ts', serverContent);

// 3. Fix SocialFeed.tsx - Add back button
let socialContent = fs.readFileSync('src/components/social/SocialFeed.tsx', 'utf8');
socialContent = socialContent.replace(
  /interface SocialFeedProps \{\n  user: UserObj;\n\}/g,
  'interface SocialFeedProps {\n  user: UserObj;\n  onClose?: () => void;\n}'
);
socialContent = socialContent.replace(
  /export function SocialFeed\(\{ user \}: SocialFeedProps\) \{/g,
  'export function SocialFeed({ user, onClose }: SocialFeedProps) {'
);

const headerTarget = '<h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-[InstaFont,sans-serif]">\n          LizGram\n        </h1>';

const headerReplacement = `<div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors" title="Volver al Chat Global">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          )}
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-[InstaFont,sans-serif]">
            LizGram
          </h1>
        </div>`;

socialContent = socialContent.replace(headerTarget, headerReplacement);
fs.writeFileSync('src/components/social/SocialFeed.tsx', socialContent);
console.log('Scripts applied successfully.');
