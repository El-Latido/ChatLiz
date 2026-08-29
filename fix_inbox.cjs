const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update the title
content = content.replace(
  /<Users size=\{24\} className="text-cyan-400" \/>\n                       Mis Amigos/g,
  '<Users size={24} className="text-cyan-400" />\n                       Bandeja y Amigos'
);

// Update the list mapping
const targetList = `                   {(!Array.isArray(user.friends_list) || user.friends_list.length === 0) ? (
                       <p className="text-gray-500 text-center text-sm mt-10">No tienes amigos agregados aún.</p>
                   ) : (
                       Array.isArray(user.friends_list) && user.friends_list.map(friendUsername => {`;

const replacementList = `                   {(() => {
                       const inboxUsers = Array.from(new Set([...(user.friends_list || []), ...Object.keys(unreadPMs)]));
                       if (inboxUsers.length === 0) {
                           return <p className="text-gray-500 text-center text-sm mt-10">Tu bandeja está vacía.</p>;
                       }
                       return inboxUsers.map(friendUsername => {`;

content = content.replace(targetList, replacementList);

// Fix the closing tags for the new structure
const targetClose = `                           );
                       })
                   )}`;

const replacementClose = `                           );
                       })
                   })()}`;

content = content.replace(targetClose, replacementClose);

// Rename button in sidebar
content = content.replace(
  /<Users size=\{16\} strokeWidth=\{1\.5\} \/>\n                        Amigos/g,
  '<Users size={16} strokeWidth={1.5} />\n                        Inbox / Amigos'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Inbox fixed");
