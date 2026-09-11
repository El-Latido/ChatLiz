const fs = require('fs');
let code = fs.readFileSync('src/components/AdminConfigAiModal.tsx', 'utf8');

// Insert earnings section
const insertion = `
        <div className="bg-black/30 border border-amber-500/30 p-4 rounded-xl mt-6 flex items-center justify-between">
            <div>
               <h4 className="text-amber-400 font-bold text-lg">Ingresos por Anuncios</h4>
               <p className="text-gray-400 text-sm">Ganancias generadas por los videos vistos de los usuarios.</p>
            </div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-green-500">
               \${(user?.adRevenue || 0).toFixed(2)}
            </div>
        </div>
`;

code = code.replace('{/* General AI Settings */}', insertion + '\n        {/* General AI Settings */}');
fs.writeFileSync('src/components/AdminConfigAiModal.tsx', code);
console.log("Added earnings to admin panel");
