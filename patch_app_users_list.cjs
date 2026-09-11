const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate flex items-center gap-1.5">
                        {u.username}{" "}
                        {u.username.toUpperCase() === "AXISS" && (`;

const replacement = `                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate flex items-center gap-1.5"
                         style={{
                             color: u.nameColor || "white",
                             fontFamily: u.nameFont !== 'default' ? u.nameFont : "inherit",
                             textShadow: u.nameNeon !== 'none' 
                                 ? (u.nameRainbow 
                                     ? \`0 0 5px \${u.nameNeonColor1}, 0 0 10px \${u.nameNeonColor1}, 0 0 20px \${u.nameNeonColor2}\` 
                                     : \`0 0 5px \${u.nameNeonColor1}, 0 0 10px \${u.nameNeonColor1}, 0 0 20px \${u.nameNeonColor1}\`) 
                                 : "none"
                         }}
                      >
                        {u.username}{" "}
                        {u.username.toUpperCase() === "AXISS" && (`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx users list");
