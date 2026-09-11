const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-1">
                  {selectedUserModal.username}`;

const replacement = `                <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-1"
                    style={{
                             color: selectedUserModal.nameColor || "white",
                             fontFamily: selectedUserModal.nameFont !== 'default' ? selectedUserModal.nameFont : "inherit",
                             textShadow: selectedUserModal.nameNeon !== 'none' 
                                 ? (selectedUserModal.nameRainbow 
                                     ? \`0 0 5px \${selectedUserModal.nameNeonColor1}, 0 0 10px \${selectedUserModal.nameNeonColor1}, 0 0 20px \${selectedUserModal.nameNeonColor2}\` 
                                     : \`0 0 5px \${selectedUserModal.nameNeonColor1}, 0 0 10px \${selectedUserModal.nameNeonColor1}, 0 0 20px \${selectedUserModal.nameNeonColor1}\`) 
                                 : "none"
                    }}
                >
                  {selectedUserModal.username}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched selectedUserModal name");
