const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="md:hidden text-white/80 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
          >`;

const replacement1 = `          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="md:hidden text-white/80 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            title="Menú"
            aria-label="Abrir Menú"
          >`;

code = code.replace(target1, replacement1);

// Look for other icon-only buttons
const target2 = `          <button
            onClick={() => {
              closeAllModals();
              setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
            }}
            className="md:hidden relative text-white/80 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
          >`;

const replacement2 = `          <button
            onClick={() => {
              closeAllModals();
              setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
            }}
            className="md:hidden relative text-white/80 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            title="Amigos"
            aria-label="Abrir Amigos"
          >`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched accessibility titles");
