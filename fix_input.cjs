const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `                              <div className="flex-1 flex items-center pl-3 pr-2 h-full">
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" `;

const r1 = `                              <div className="flex-1 min-w-0 flex items-center pl-3 pr-2 h-full">
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" `;

const t2 = `                                                    className="flex-1 py-2 outline-none text-gray-700 text-sm placeholder-blue-300 bg-transparent h-full"
                                                    placeholder="Escribe un mensaje..."`;

const r2 = `                                                    className="flex-1 min-w-0 py-2 outline-none text-gray-700 text-sm placeholder-blue-300 bg-transparent h-full"
                                                    placeholder="Escribe un mensaje..."`;

let replaced = false;
if(code.includes(t1)) {
    code = code.replace(t1, r1);
    console.log("Replaced global input");
    replaced = true;
} else {
    console.log("Could not find global input");
}

if(code.includes(t2)) {
    code = code.replace(t2, r2);
    console.log("Replaced tutifrutti input");
    replaced = true;
} else {
    console.log("Could not find tutifrutti input");
}

if (replaced) {
    fs.writeFileSync('src/App.tsx', code);
}
