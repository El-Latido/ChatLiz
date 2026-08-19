const fs = require('fs');

let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// Replace everything inside the return statement with the perfect clone of the image
const returnRegex = /return \(\s*<div className="fixed inset-0[\s\S]*$/m;

const newReturn = `return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Background Image (Blurred Pool Hall) */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1610214644053-4dc9cb2cce0a?q=80&w=1000&auto=format&fit=crop")' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-[600px] flex flex-col items-center justify-between py-6 md:py-8">
        
        {/* Top Header & HUD */}
        <div className="w-full px-6 flex flex-col gap-4">
            
            {/* Chat-Liz Pill */}
            <div className="flex justify-center">
                <div className="bg-[#2a2d36]/80 px-8 py-2 rounded-full shadow-lg border border-white/5">
                    <span className="text-gray-300 font-bold text-lg tracking-wider">Chat-Liz</span>
                </div>
            </div>

            {/* Players Area */}
            <div className="flex justify-between items-start w-full mt-2">
                
                {/* Player 1 (Left) */}
                <div className={\`flex items-start gap-4 transition-opacity duration-300 \${turn === user.username ? 'opacity-100' : 'opacity-50'}\`}>
                    <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+user.username} className="w-16 h-16 rounded-[1.2rem] object-cover shadow-xl border-2 border-gray-600 bg-gray-800" />
                    <div className="flex flex-col pt-1">
                        <span className="text-white font-bold text-xl leading-none tracking-wide">Player 1</span>
                        <span className="text-gray-400 text-sm mt-1 mb-2 font-medium">(You)</span>
                        <div className="flex gap-1.5">
                            {[1,2,3,4,5,6,7].map(i => {
                                const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                                const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                                return (
                                    <div key={i} className={\`w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5),2px_2px_4px_rgba(0,0,0,0.4)] \${isPocketed ? 'opacity-0' : 'opacity-100'}\`} style={{ backgroundColor: colors[i-1] }}>
                                        <div className="w-[45%] h-[45%] bg-white rounded-full flex items-center justify-center">
                                            <span className="text-[6px] font-black text-black leading-none">{i}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Player 2 (Right) */}
                <div className={\`flex items-start gap-4 flex-row-reverse transition-opacity duration-300 \${turn === opponentName ? 'opacity-100' : 'opacity-50'}\`}>
                    <div className="w-16 h-16 rounded-[1.2rem] bg-gray-800 flex items-center justify-center shadow-xl border-2 border-gray-600 overflow-hidden">
                        <img src={'https://api.dicebear.com/7.x/avataaars/svg?seed='+opponentName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-end pt-1">
                        <span className="text-white font-bold text-xl leading-none tracking-wide">Player 2</span>
                        <span className="text-gray-400 text-sm mt-1 mb-2 font-medium">(Rival)</span>
                        <div className="flex gap-1.5">
                            {[9,10,11,12,13,14,15].map(i => {
                                const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                                const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                                return (
                                    <div key={i} className={\`w-5 h-5 rounded-full flex items-center justify-center transition-all bg-white shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3),2px_2px_4px_rgba(0,0,0,0.4)] \${isPocketed ? 'opacity-0' : 'opacity-100'}\`}>
                                        <div className="w-full h-[40%] flex items-center justify-center" style={{ backgroundColor: colors[i-9] }}>
                                            <div className="w-[55%] h-[120%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                                                <span className="text-[6px] font-black text-black leading-none">{i}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Game Area (Table + Power Bar) */}
        <div className="flex-1 w-full max-h-[75vh] flex justify-center items-center gap-6 px-4 pb-8 relative">
            
            {/* Table Container */}
            <div 
                id="pool-table"
                className="relative shrink-0 shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(0,0,0,0.8)] overflow-visible rounded-[2.5rem]" 
                style={{ 
                    height: '100%', 
                    aspectRatio: '1/2', 
                    // Wood texture background
                    background: 'linear-gradient(135deg, #4A2B1D 0%, #381A0D 50%, #2A1005 100%)',
                    padding: '24px' // Wood border thickness
                }}
                onMouseMove={handleTableMove}
                onTouchMove={handleTableMove}
                onMouseDown={handleTableMove}
            >
                {/* Silver corner and side pocket metallic overlays */}
                {[
                    {top: '-4px', left: '-4px', classes: 'rounded-tl-[2rem] rounded-br-[1rem]'}, // Top Left
                    {top: '-4px', right: '-4px', classes: 'rounded-tr-[2rem] rounded-bl-[1rem]'}, // Top Right
                    {bottom: '-4px', left: '-4px', classes: 'rounded-bl-[2rem] rounded-tr-[1rem]'}, // Bottom Left
                    {bottom: '-4px', right: '-4px', classes: 'rounded-br-[2rem] rounded-tl-[1rem]'}, // Bottom Right
                    // Side pockets metal
                    {top: '50%', left: '-8px', classes: 'rounded-r-lg w-6 h-12 -translate-y-1/2'}, // Mid Left
                    {top: '50%', right: '-8px', classes: 'rounded-l-lg w-6 h-12 -translate-y-1/2'}, // Mid Right
                ].map((pos, i) => (
                    <div key={'metal'+i} className={\`absolute bg-gradient-to-br from-[#E0E0E0] via-[#9E9E9E] to-[#616161] shadow-lg border border-white/20 z-10 \${pos.classes}\`} 
                         style={{ 
                             top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right,
                             width: pos.classes.includes('w-6') ? undefined : '50px',
                             height: pos.classes.includes('h-12') ? undefined : '50px'
                         }}></div>
                ))}

                {/* White aiming dots (diamonds) on wood border */}
                {[...Array(3)].map((_,i) => <div key={'dtl'+i} className="absolute left-[8px] w-2 h-2 rounded-full bg-white/60 shadow-sm" style={{ top: \`\${25 + i*25}%\` }}></div>)}
                {[...Array(3)].map((_,i) => <div key={'dtr'+i} className="absolute right-[8px] w-2 h-2 rounded-full bg-white/60 shadow-sm" style={{ top: \`\${25 + i*25}%\` }}></div>)}
                <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60 shadow-sm"></div>
                <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60 shadow-sm"></div>


                {/* Green Cloth Area */}
                <div className="relative w-full h-full bg-[#1A6136] rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
                     style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.3) 100%), url("https://www.transparenttextures.com/patterns/felt.png")' }}>
                    
                    {/* Inner Rail Cushions */}
                    <div className="absolute inset-0 border-[12px] border-[#0E3B1E] rounded-2xl opacity-90 pointer-events-none z-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]"></div>
                    
                    {/* Dark pockets cut into the cloth */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ].map((p, i) => (
                        <div key={'pocket'+i} className="absolute bg-black rounded-full shadow-[inset_0_5px_15px_rgba(0,0,0,1)] z-0" 
                              style={{ 
                                  width: (HOLE_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                  height: (HOLE_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                  left: ((p.x - HOLE_RADIUS)/TABLE_WIDTH)*100+'%',
                                  top: ((p.y - HOLE_RADIUS)/TABLE_HEIGHT)*100+'%'
                              }} />
                    ))}
                    
                    {/* The Triangle Frame (Visible initially) */}
                    {ballPositions.length > 14 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                            <polygon 
                                points={\`
                                    \${(TABLE_WIDTH/2)/TABLE_WIDTH*100}%,\${(TABLE_HEIGHT*0.25 - BALL_RADIUS*2)/TABLE_HEIGHT*100}% 
                                    \${(TABLE_WIDTH/2 - BALL_RADIUS*5)/TABLE_WIDTH*100}%,\${(TABLE_HEIGHT*0.25 + BALL_RADIUS*8)/TABLE_HEIGHT*100}% 
                                    \${(TABLE_WIDTH/2 + BALL_RADIUS*5)/TABLE_WIDTH*100}%,\${(TABLE_HEIGHT*0.25 + BALL_RADIUS*8)/TABLE_HEIGHT*100}%
                                \`}
                                fill="none"
                                stroke="#111"
                                strokeWidth="6"
                                strokeLinejoin="round"
                                className="opacity-60 drop-shadow-md"
                            />
                        </svg>
                    )}

                    {/* Balls */}
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
                                      boxShadow: '2px 4px 6px rgba(0,0,0,0.5), inset -3px -3px 5px rgba(0,0,0,0.6), inset 1px 1px 4px rgba(255,255,255,0.9)'
                                  }}>
                                  
                                  <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: \`rotate(\${b.angle}rad)\` }}>
                                      {/* Stripe overlay */}
                                      {!isCue && isStripe && (
                                          <div className="absolute w-full h-[45%] top-[27.5%]" style={{ backgroundColor: color }}></div>
                                      )}
                                      {/* Number circle */}
                                      {!isCue && (
                                          <div className="w-[45%] h-[45%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] z-10">
                                              <span className="text-[7px] md:text-[9px] font-black text-black leading-none">{num}</span>
                                          </div>
                                      )}
                                  </div>

                                  {/* Glass highlight overlay */}
                                  <div className="absolute w-[40%] h-[40%] top-[10%] left-[15%] rounded-full bg-gradient-to-br from-white/90 to-transparent z-20"></div>
                            </div>
                        );
                    })}

                    {/* Aim Line */}
                    {turn === user.username && cueBall && ghostBall && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                            <line 
                                x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                                y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                stroke="rgba(255, 255, 255, 0.85)" 
                                strokeWidth="2.5" 
                            />
                            {/* Ghost Ball Circle */}
                            <circle 
                                cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                                fill="none" 
                                stroke="rgba(255, 255, 255, 0.9)" 
                                strokeWidth="1.5" 
                            />
                            {/* Deflection Line */}
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

                    {/* Cue Stick */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-30 pointer-events-none"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '100%', // Long cue
                                 height: '14px',
                                 background: 'linear-gradient(to right, #000 0%, #111 2%, #D4A373 5%, #8B5A2B 40%, #5C4033 80%, #222 95%, #fff 100%)',
                                 boxShadow: '0px 25px 25px rgba(0,0,0,0.6), inset 0px 4px 4px rgba(255,255,255,0.4)',
                                 transformOrigin: '0% 50%',
                                 transform: \`rotate(\${aimAngle + Math.PI}rad) translateX(\${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 35) + 2}%)\`,
                                 borderRadius: '7px'
                             }}
                        >
                            {/* Blue tip */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[7px] border-r border-white/50"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Power Bar */}
            <div className="relative w-14 md:w-16 h-[75%] max-h-[500px] shrink-0 rounded-[2rem] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1)] border border-[#555] bg-[#2a2c33]"
                 id="power-bar"
                 onMouseDown={handlePowerStart}
                 onMouseMove={handlePowerMove}
                 onMouseUp={handlePowerEnd}
                 onMouseLeave={handlePowerEnd}
                 onTouchStart={handlePowerStart}
                 onTouchMove={handlePowerMove}
                 onTouchEnd={handlePowerEnd}
            >
                {/* Gradient Track */}
                <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-b from-[#2ecc71] via-[#f1c40f] to-[#e74c3c] shadow-[inset_0_5px_15px_rgba(0,0,0,0.6)] overflow-hidden">
                    {/* Overlay darkness based on power */}
                    <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity" style={{ opacity: 0.8 - power }}></div>
                </div>
                
                {/* Draggable Thumb (Slider) */}
                <div className="absolute left-1/2 -translate-x-1/2 w-[140%] h-8 bg-gradient-to-b from-gray-100 to-gray-400 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.8)] border border-gray-500 z-10 pointer-events-none flex items-center justify-center"
                     style={{ 
                         top: \`\${Math.max(10, (1 - power) * 90)}%\`,
                         transition: isCharging ? 'none' : 'top 0.3s ease-out'
                     }}>
                    <div className="w-[80%] h-1 bg-gray-500/50 rounded-full shadow-inner"></div>
                </div>
            </div>
            
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('src/components/PoolGameModal.tsx', code);

