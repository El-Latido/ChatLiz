const fs = require('fs');
let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// The image is now at /pool-bg.jpg
// Make sure it loads correctly and spans properly.
// The image is a 9:16 vertical table. 

const returnRegex = /return \(\s*<div className="fixed inset-0[\s\S]*$/m;

const newReturn = `return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f18]">
      
      {/* 
        IMAGE-AS-REFERENCE CONTAINER 
      */}
      <div 
        className="relative w-full h-full md:max-w-[500px] md:h-[90vh] bg-cover bg-center overflow-hidden md:rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        style={{ backgroundImage: 'url("/pool-bg.jpg")' }}
      >
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20">
            <X size={24} />
        </button>

        {/* --- HUD OVERLAYS --- */}
        <div className="absolute top-[8%] w-full flex justify-between px-6 z-20">
            
            {/* Player 1 Balls Status Overlay */}
            <div className="w-[35%] h-8 flex items-center justify-between">
                {[1,2,3,4,5,6,7].map(i => {
                    const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                    return (
                        <div key={i} className="h-full aspect-square flex items-center justify-center">
                            {isPocketed && (
                                <div className="w-full h-full bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <X size={12} className="text-red-500 opacity-80" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Player 2 Balls Status Overlay */}
            <div className="w-[35%] h-8 flex items-center justify-between flex-row-reverse">
                {[9,10,11,12,13,14,15].map(i => {
                    const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                    return (
                        <div key={i} className="h-full aspect-square flex items-center justify-center">
                            {isPocketed && (
                                <div className="w-full h-full bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <X size={12} className="text-red-500 opacity-80" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- TABLE HITBOX --- */}
        <div 
            id="pool-table"
            className="absolute z-10"
            style={{
                top: '20%',      // Positioned over the green cloth of the generated image
                left: '10%',       
                width: '80%',      
                aspectRatio: '1/2' 
            }}
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
                    <div key={b.id} className="absolute rounded-full z-10 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-[30ms] ease-linear" 
                            style={{ 
                                width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                backgroundColor: isCue ? '#ffffff' : (isStripe ? '#ffffff' : color),
                                boxShadow: '2px 4px 6px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.6)'
                            }}>
                            
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: \`rotate(\${b.angle}rad)\` }}>
                                {!isCue && isStripe && (
                                    <div className="absolute w-full h-[45%] top-[27.5%]" style={{ backgroundColor: color }}></div>
                                )}
                                {!isCue && (
                                    <div className="w-[45%] h-[45%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] z-10">
                                        <span className="text-[7px] md:text-[9px] font-black text-black leading-none">{num}</span>
                                    </div>
                                )}
                            </div>

                            {/* Specular Highlight */}
                            <div className="absolute w-[40%] h-[40%] top-[10%] left-[15%] rounded-full bg-gradient-to-br from-white/80 to-transparent z-20"></div>
                    </div>
                );
            })}

            {/* AIM LINE */}
            {turn === user.username && cueBall && ghostBall && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                    <line 
                        x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                        y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                        x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                        y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                        stroke="rgba(255, 255, 255, 0.85)" 
                        strokeWidth="2" 
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
                            strokeWidth="2" 
                        />
                    )}
                </svg>
            )}

            {/* CUE STICK */}
            {turn === user.username && cueBall && (
                <div className="absolute z-30 pointer-events-none"
                        style={{
                            left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                            top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                            width: '100%', 
                            height: '14px',
                            background: 'linear-gradient(to right, #000 0%, #111 2%, #D4A373 5%, #8B5A2B 40%, #5C4033 80%, #222 95%, #fff 100%)',
                            boxShadow: '0px 20px 30px rgba(0,0,0,0.7)',
                            transformOrigin: '0% 50%',
                            transform: \`rotate(\${aimAngle + Math.PI}rad) translateX(\${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 35) + 2}%)\`,
                            borderRadius: '7px'
                        }}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[7px] border-r border-white/50"></div>
                </div>
            )}
        </div>

        {/* --- POWER BAR HITBOX --- */}
        <div className="absolute z-20 cursor-pointer touch-none"
             style={{
                 top: '30%',
                 right: '2%',
                 width: '8%',
                 height: '40%',
             }}
             id="power-bar"
             onMouseDown={handlePowerStart}
             onMouseMove={handlePowerMove}
             onMouseUp={handlePowerEnd}
             onMouseLeave={handlePowerEnd}
             onTouchStart={handlePowerStart}
             onTouchMove={handlePowerMove}
             onTouchEnd={handlePowerEnd}
        >
            <div className="absolute left-1/2 -translate-x-1/2 w-[140%] h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full shadow-lg border border-white z-10 pointer-events-none flex items-center justify-center"
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
  );
}`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('src/components/PoolGameModal.tsx', code);
