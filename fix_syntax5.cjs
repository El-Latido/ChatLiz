const fs = require('fs');

function fixSyntax5() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // Replace the end of the file completely to be safe
    const endRegex = /\{\/\* Power Bar \(8-Ball Style\) \*\/\}[\s\S]*$/m;
    const replacement = `{/* Power Bar (8-Ball Style) */}
                <div className="w-12 md:w-16 h-full max-h-[60vh] md:max-h-[80vh] bg-[#111] border-[4px] border-[#222] rounded-2xl relative flex flex-col justify-end overflow-hidden cursor-pointer touch-none shadow-[0_0_30px_rgba(0,0,0,0.8)] shrink-0"
                     id="power-bar"
                     onMouseDown={handlePowerStart}
                     onMouseMove={handlePowerMove}
                     onMouseUp={handlePowerEnd}
                     onMouseLeave={handlePowerEnd}
                     onTouchStart={handlePowerStart}
                     onTouchMove={handlePowerMove}
                     onTouchEnd={handlePowerEnd}
                >
                    {/* Power scale markers */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4 z-0 opacity-20 pointer-events-none">
                        {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
                    </div>

                    <div className="w-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 pointer-events-none transition-all duration-75 relative z-10" 
                         style={{ height: \`\${power * 100}%\` }}>
                         <div className="absolute top-0 w-full h-2 bg-white shadow-[0_0_15px_white]"></div>
                    </div>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/50 pointer-events-none uppercase tracking-widest">
                        Tirar
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
}`;
    code = code.replace(endRegex, replacement);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}
fixSyntax5();
