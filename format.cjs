const fs = require('fs');

let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// There must be an unclosed div much higher up, likely in the HUD or the map function.
// Let's strip out the component return entirely and rebuild it from scratch to ensure perfect syntax.

const returnRegex = /return \(\s*<div className="fixed inset-0[\s\S]*$/m;

const newReturn = `return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A101D] border border-white/10 rounded-3xl w-full h-full md:max-h-[90vh] md:max-w-7xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#050810] to-[#121B2A]">
          <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            🎱 Billar
          </h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Game Container */}
        <div className="p-0 md:p-4 flex flex-col gap-2 md:gap-4 flex-1 min-h-0 overflow-hidden bg-[#1A1F2B]">
            
            {/* Player HUD with Ball Trackers */}
            <div className="flex justify-between items-start px-2 md:px-4 py-2 bg-[#1A1A1A] rounded-[20px] shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-[#333] mt-2 mx-2">
                
                {/* Me (Solids) */}
                <div className={\`flex flex-col gap-2 transition-all \${turn === user.username ? 'opacity-100' : 'opacity-60'}\`}>
                    <div className="flex items-center gap-3">
                        <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+user.username} className={\`w-12 h-12 rounded-xl object-cover shadow-lg border-[3px] \${turn === user.username ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'border-[#444]'}\`} />
                        <div>
                            <div className="font-bold text-white text-sm md:text-base leading-tight">Player 1</div>
                            <div className="text-gray-400 text-xs md:text-sm">(You)</div>
                        </div>
                    </div>
                    <div className="flex gap-1 bg-black/40 p-1.5 rounded-lg border border-white/5">
                        {[1,2,3,4,5,6,7].map(i => {
                            const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                            const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                            return (
                                <div key={i} className={\`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center transition-all \${isPocketed ? 'opacity-20 grayscale' : 'shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.5),1px_2px_3px_rgba(0,0,0,0.5)]'}\`} style={{ backgroundColor: colors[i-1] }}>
                                    <div className="w-[50%] h-[50%] bg-white rounded-full flex items-center justify-center">
                                        <span className="text-[5px] md:text-[6px] font-black text-black leading-none">{i}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Opponent (Stripes) */}
                <div className={\`flex flex-col items-end gap-2 transition-all \${turn === opponentName ? 'opacity-100' : 'opacity-60'}\`}>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="font-bold text-white text-sm md:text-base leading-tight">Player 2</div>
                            <div className="text-gray-400 text-xs md:text-sm">(Rival)</div>
                        </div>
                        <div className={\`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shadow-lg border-[3px] \${turn === opponentName ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-[#444]'}\`}>
                            <span className="text-xl">😎</span>
                        </div>
                    </div>
                    <div className="flex gap-1 bg-black/40 p-1.5 rounded-lg border border-white/5">
                        {[9,10,11,12,13,14,15].map(i => {
                            const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                            const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                            return (
                                <div key={i} className={\`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center transition-all \${isPocketed ? 'opacity-20 grayscale' : 'shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.5),1px_2px_3px_rgba(0,0,0,0.5)]'}\`} style={{ backgroundColor: 'white' }}>
                                    <div className="w-full h-[40%] flex items-center justify-center" style={{ backgroundColor: colors[i-9] }}>
                                        <div className="w-[50%] h-[120%] bg-white rounded-full flex items-center justify-center">
                                            <span className="text-[5px] md:text-[6px] font-black text-black leading-none">{i}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex flex-row flex-1 gap-4 items-center justify-center w-full min-h-0 overflow-hidden px-2 pb-4">
                
                {/* Table */}
                <div 
                    id="pool-table"
                    className="relative border-[16px] md:border-[24px] rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden shrink-0" 
                    style={{ 
                        height: '100%', maxHeight: '1000px', aspectRatio: '1/2', maxWidth: '100%',
                        borderColor: '#4A2511', // Wood border
                        backgroundColor: '#1B5B31', // 8 Ball Pool Green cloth
                        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 100%), url("https://www.transparenttextures.com/patterns/felt.png")'
                    }}
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                    onMouseDown={handleTableMove}
                >
                    {/* Inner rubber rails */}
                    <div className="absolute inset-0 border-[8px] border-[#0F381D] rounded-[1.5rem] opacity-90 pointer-events-none z-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                    
                    {/* Head string line (Vertical layout -> bottom quarter) */}
                    <div className="absolute left-0 right-0 h-px bg-white/20 pointer-events-none z-0" style={{ top: '75%' }}></div>
                    <div className="absolute w-2 h-2 rounded-full bg-white/20 pointer-events-none z-0" style={{ left: '50%', top: '75%', transform: 'translate(-50%, -50%)' }}></div>
                    
                    {/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ].map((p, i) => (
                        <div key={i} className="absolute bg-[#0a0a0a] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.1)] z-0" 
                              style={{ 
                                  width: (HOLE_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                  height: (HOLE_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                  left: ((p.x - HOLE_RADIUS)/TABLE_WIDTH)*100+'%',
                                  top: ((p.y - HOLE_RADIUS)/TABLE_HEIGHT)*100+'%'
                              }} />
                    ))}
                    
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
                                      boxShadow: '2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.8)'
                                  }}>
                                  
                                  <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: \`rotate(\${b.angle}rad)\` }}>
                                      {/* Stripe overlay */}
                                      {!isCue && isStripe && (
                                          <div className="absolute w-full h-[50%] top-[25%]" style={{ backgroundColor: color }}></div>
                                      )}
                                      {/* Number circle */}
                                      {!isCue && (
                                          <div className="w-[50%] h-[50%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] z-10">
                                              <span className="text-[6px] md:text-[8px] font-black text-black leading-none" style={{transform: 'scale(0.8)'}}>{num}</span>
                                          </div>
                                      )}
                                  </div>

                                  {/* Specular Highlight Overlay (Glass reflection) */}
                                  <div className="absolute w-[40%] h-[40%] top-[15%] left-[20%] rounded-full bg-gradient-to-br from-white/80 to-transparent z-20"></div>
                            </div>
                        );
                    })}

                    {/* Aim Line (8-Ball Pool Style) */}
                    {turn === user.username && cueBall && ghostBall && (
                        <>
                            {/* Main Trajectory */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                                <line 
                                    x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                                    y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                    x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                    y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                    stroke="rgba(255, 255, 255, 0.7)" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="4 2"
                                />
                                {/* Ghost Ball Circle */}
                                <circle 
                                    cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                    cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                    r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                                    fill="none" 
                                    stroke="rgba(255, 255, 255, 0.8)" 
                                    strokeWidth="1" 
                                />
                                {/* Deflection Line */}
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
                        </>
                    )}

                    {/* Cue Stick */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-30 pointer-events-none"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '80%', // Longer cue
                                 height: '10px',
                                 background: 'linear-gradient(to right, #000 0%, #111 2%, #d4b895 5%, #8b5a2b 40%, #3e2723 80%, #1a100c 95%, #fff 100%)',
                                 boxShadow: '0px 20px 20px rgba(0,0,0,0.5), inset 0px 3px 3px rgba(255,255,255,0.3)',
                                 transformOrigin: '0% 50%',
                                 transform: \`rotate(\${aimAngle + Math.PI}rad) translateX(\${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 30) + 2}%)\`,
                                 borderRadius: '5px'
                             }}
                        >
                            {/* Blue tip */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[5px]"></div>
                        </div>
                    )}
                </div>

                {/* Power Bar (8-Ball Style) */}
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
    </div>
  );
}`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('src/components/PoolGameModal.tsx', code);

