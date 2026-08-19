const fs = require('fs');

let content = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// 1. Remove the image import
content = content.replace(/import tableBg from '\.\.\/assets\/images\/pool_layout_1787163922479\.jpg';\n/, '');

// 2. Replace the TABLE WRAPPER
const wrapperRegex = /\{\/\* TABLE WRAPPER \*\/\}\s*<div className="relative shrink-0 shadow-\[0_30px_60px_rgba\(0,0,0,1\)\] rounded-xl" style=\{\{ height: '95%', aspectRatio: '1\/2', backgroundColor: '#000' \}\}>\s*\{\/\*[\s\S]*?NATIVE BACKGROUND IMAGE \(Layer 0\)[\s\S]*?\*\/\}\s*<img src=\{tableBg\}[\s\S]*?\/>\s*\{\/\* INNER SHADOW OVER THE GREEN CLOTH \*\/\}\s*<div className="absolute inset-0 rounded-xl shadow-\[inset_0_0_40px_rgba\(0,0,0,0\.8\)\] pointer-events-none z-10"><\/div>/m;

const replacement = `{/* TABLE WRAPPER */}
            <div className="relative shrink-0" style={{ height: '95%', aspectRatio: '1/2' }}>
                
                {/* TABLE CUSHIONS AND WOODEN RAILS */}
                <div className="absolute -inset-6 md:-inset-8 bg-[#3E2723] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,1)] border-y-[16px] border-x-[16px] border-[#2d1b15] pointer-events-none z-0">
                    <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border border-[#5d4037]/40"></div>
                    
                    {/* Pockets (Visual) */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                    <div className="absolute top-1/2 -left-5 w-10 h-12 bg-black rounded-[2rem] shadow-[inset_0_5px_10px_rgba(0,0,0,1)] -translate-y-1/2"></div>
                    <div className="absolute top-1/2 -right-5 w-10 h-12 bg-black rounded-[2rem] shadow-[inset_0_5px_10px_rgba(0,0,0,1)] -translate-y-1/2"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                </div>

                {/* GREEN CLOTH */}
                <div className="absolute inset-0 bg-[#0c593b] rounded-xl pointer-events-none z-0 overflow-hidden">
                    {/* Cloth Texture / Shadow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] opacity-90 mix-blend-multiply"></div>
                    
                    {/* Table Lines / Dots */}
                    <div className="absolute top-[25%] left-0 w-full h-[2px] bg-white/10"></div>
                    <div className="absolute top-[75%] left-0 w-full h-[2px] bg-white/10"></div>
                    <div className="absolute top-[75%] left-[50%] w-2 h-2 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2"></div>
                </div>`;

content = content.replace(wrapperRegex, replacement);

fs.writeFileSync('src/components/PoolGameModal.tsx', content);
