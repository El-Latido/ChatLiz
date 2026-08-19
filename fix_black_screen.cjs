const fs = require('fs');

let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// 1. Add native import at the top to guarantee it compiles into the bundle
const importStmt = "import tableBg from '../assets/images/pool_layout_1787163922479.jpg';\n";
if (!code.includes('pool_layout_1787163922479.jpg')) {
    code = importStmt + code;
}

// 2. Replace the return statement with the perfectly layered native image implementation
const returnRegex = /return \(\s*<div className="fixed inset-0[\s\S]*$/m;

const newReturn = `return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f18] text-white font-sans">
      <div className="relative w-full h-full md:max-w-[500px] md:h-[95vh] bg-[#1a2235] flex flex-col md:rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
        
        {/* HEADER / HUD */}
        <div className="flex-none flex flex-col p-4 z-20 bg-gradient-to-b from-[#111824] to-transparent">
            <div className="flex justify-between items-center mb-4">
                <div className="bg-[#2a2d36]/80 px-4 py-1 rounded-full border border-white/5 mx-auto shadow-lg">
                    <span className="text-gray-300 font-bold text-sm tracking-wider">8 BALL POOL</span>
                </div>
                <button onClick={onClose} className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20">
                    <X size={18} />
                </button>
            </div>
            
            <div className="flex justify-between items-start w-full">
                {/* P1 */}
                <div className={\`flex items-start gap-3 transition-opacity \${turn === user.username ? 'opacity-100' : 'opacity-50'}\`}>
                    <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+user.username} className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 bg-gray-800" />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">Player 1</span>
                        <span className="text-gray-400 text-xs mb-1">(You)</span>
                        <div className="flex gap-1">
                            {[1,2,3,4,5,6,7].map(i => {
                                const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                                const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                                return (
                                    <div key={i} className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: colors[i-1] }}>
                                        <div className="w-[45%] h-[45%] bg-white rounded-full"></div>
                                        {isPocketed && <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center"><X size={10} className="text-red-500"/></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/* P2 */}
                <div className={\`flex items-start gap-3 flex-row-reverse transition-opacity \${turn === opponentName ? 'opacity-100' : 'opacity-50'}\`}>
                    <div className="w-12 h-12 rounded-xl bg-gray-800 border-2 border-red-500 overflow-hidden flex items-center justify-center">
                        <img src={'https://api.dicebear.com/7.x/avataaars/svg?seed='+opponentName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-sm leading-tight">Player 2</span>
                        <span className="text-gray-400 text-xs mb-1">(Rival)</span>
                        <div className="flex gap-1">
                            {[9,10,11,12,13,14,15].map(i => {
                                const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                                const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                                return (
                                    <div key={i} className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center bg-white shadow-inner overflow-hidden">
                                        <div className="w-full h-[40%] flex items-center justify-center" style={{ backgroundColor: colors[i-9] }}>
                                            <div className="w-[50%] h-[120%] bg-white rounded-full"></div>
                                        </div>
                                        {isPocketed && <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center"><X size={10} className="text-red-500"/></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* GAME AREA */}
        <div className="flex-1 w-full flex flex-row items-center justify-center gap-4 p-4 pb-8 overflow-hidden z-10">
            
            {/* TABLE WRAPPER */}
            <div className="relative shrink-0 flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,1)] rounded-[2rem]" style={{ height: '95%', aspectRatio: '1/2' }}>
                
                {/* NATIVE BACKGROUND IMAGE (Layer 0) 
                    Spans slightly larger than the playable hitbox to show the wood borders perfectly.
                */}
                <div className="absolute inset-[-12%] bg-cover bg-center rounded-[3rem] z-0 pointer-events-none border-[3px] border-[#2A1508]"
                     style={{ backgroundImage: \`url(\${tableBg})\` }}>
                </div>
                
                {/* INNER SHADOW OVER THE GREEN CLOTH */}
                <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none z-10"></div>

                {/* PLAYABLE HITBOX (Exactly the green cloth dimensions) */}
                <div 
                    id="pool-table"
                    className="absolute inset-0 z-20"
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                    onMouseDown={handleTableMove}
                >
                    {/* BALLS */}
                    {ballPositions.map((b, i) => {
                        const isCue = b.label === 'cue';
                        const color = isCue ? '#ffffff' : b.color;
                        const num = isCue ? 0 : parseInt(b.label.split('_')[1]);
                        const isStripe = num > 8; 
                        
                        return (
                            <div key={b.id} className="absolute rounded-full z-30 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-[30ms] ease-linear" 
                                    style={{ 
                                        width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                        height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                        left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                        top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                        backgroundColor: isCue ? '#ffffff' : (isStripe ? '#ffffff' : color),
                                        boxShadow: '2px 4px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.7), inset 1px 1px 3px rgba(255,255,255,0.8)'
                                    }}>
                                    
                                    <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: \`rotate(\${b.angle}rad)\` }}>
                                        {!isCue && isStripe && (
                                            <div className="absolute w-full h-[45%] top-[27.5%]" style={{ backgroundColor: color }}></div>
                                        )}
                                        {!isCue && (
                                            <div className="w-[45%] h-[45%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] z-10">
                                                <span className="text-[7px] md:text-[9px] font-black text-black leading-none">{num}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute w-[40%] h-[40%] top-[10%] left-[15%] rounded-full bg-gradient-to-br from-white/90 to-transparent z-40"></div>
                            </div>
                        );
                    })}

                    {/* AIM LINE */}
                    {turn === user.username && cueBall && ghostBall && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
                            <line 
                                x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                                y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                stroke="rgba(255, 255, 255, 0.9)" 
                                strokeWidth="2.5" 
                                strokeDasharray="4 2"
                            />
                            <circle 
                                cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                                fill="none" 
                                stroke="rgba(255, 255, 255, 0.9)" 
                                strokeWidth="1.5" 
                            />
                            {deflectionLine && (
                                <line 
                                    x1={(deflectionLine.x1 / TABLE_WIDTH) * 100 + '%'} 
                                    y1={(deflectionLine.y1 / TABLE_HEIGHT) * 100 + '%'} 
                                    x2={(deflectionLine.x2 / TABLE_WIDTH) * 100 + '%'} 
                                    y2={(deflectionLine.y2 / TABLE_HEIGHT) * 100 + '%'} 
                                    stroke="rgba(255, 255, 255, 0.9)" 
                                    strokeWidth="2.5" 
                                />
                            )}
                        </svg>
                    )}

                    {/* CUE STICK */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-50 pointer-events-none"
                                style={{
                                    left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                    top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                    width: '120%', 
                                    height: '16px',
                                    background: 'linear-gradient(to right, #000 0%, #111 2%, #D4A373 5%, #8B5A2B 40%, #5C4033 80%, #222 95%, #fff 100%)',
                                    boxShadow: '0px 25px 35px rgba(0,0,0,0.8), inset 0px 4px 4px rgba(255,255,255,0.4)',
                                    transformOrigin: '0% 50%',
                                    transform: \`rotate(\${aimAngle + Math.PI}rad) translateX(\${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 35) + 2}%)\`,
                                    borderRadius: '8px'
                                }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[8px] border-r border-white/50"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* POWER BAR */}
            <div className="relative w-12 md:w-16 h-[85%] shrink-0 rounded-[2rem] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.9),inset_0_0_10px_rgba(255,255,255,0.1)] border border-[#444] bg-[#1a1c23] z-20"
                 id="power-bar"
                 onMouseDown={handlePowerStart}
                 onMouseMove={handlePowerMove}
                 onMouseUp={handlePowerEnd}
                 onMouseLeave={handlePowerEnd}
                 onTouchStart={handlePowerStart}
                 onTouchMove={handlePowerMove}
                 onTouchEnd={handlePowerEnd}
            >
                <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-b from-[#2ecc71] via-[#f1c40f] to-[#e74c3c] shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity" style={{ opacity: 0.8 - power }}></div>
                </div>
                
                <div className="absolute left-1/2 -translate-x-1/2 w-[140%] h-6 bg-gradient-to-b from-gray-200 to-gray-500 rounded shadow-lg border border-gray-400 z-10 pointer-events-none flex items-center justify-center cursor-pointer"
                        style={{ 
                            top: \`\${Math.max(0, Math.min(100, (1 - power) * 100))}%\`,
                            transform: 'translateY(-50%)',
                            transition: isCharging ? 'none' : 'top 0.3s ease-out'
                        }}>
                    <div className="w-[80%] h-1 bg-gray-600/50 rounded-full shadow-inner"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('src/components/PoolGameModal.tsx', code);
