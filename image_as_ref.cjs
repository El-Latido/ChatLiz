const fs = require('fs');

let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// Replace the return block with the Image-as-Reference architecture
const returnRegex = /return \(\s*<div className="fixed inset-0[\s\S]*$/m;

const newReturn = `return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      
      {/* 
        IMAGE-AS-REFERENCE CONTAINER 
        Adjust max-width or aspect ratio to match your uploaded image precisely.
      */}
      <div 
        className="relative w-full h-full md:h-[90vh] md:w-auto md:aspect-[9/16] bg-cover bg-center bg-no-repeat overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] md:rounded-[3rem]"
        style={{ backgroundImage: 'url("/pool-bg.jpg")' }} // The user must upload pool-bg.jpg to the public/ folder
      >
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20">
            <X size={24} />
        </button>

        {/* --- HUD OVERLAYS (Hitboxes for crossing out pocketed balls) --- */}
        
        {/* Player 1 Balls Status Overlay */}
        <div className="absolute top-[10.5%] left-[10%] w-[32%] h-[2.5%] flex items-center justify-between z-20">
            {[1,2,3,4,5,6,7].map(i => {
                const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                return (
                    <div key={i} className="h-full aspect-square flex items-center justify-center">
                        {isPocketed && (
                            // Black cross or dark overlay for pocketed balls
                            <div className="w-[120%] h-[120%] bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <X size={12} className="text-red-500 opacity-80" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Player 2 Balls Status Overlay */}
        <div className="absolute top-[10.5%] right-[10%] w-[32%] h-[2.5%] flex items-center justify-between flex-row-reverse z-20">
            {[9,10,11,12,13,14,15].map(i => {
                const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                return (
                    <div key={i} className="h-full aspect-square flex items-center justify-center">
                        {isPocketed && (
                            <div className="w-[120%] h-[120%] bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <X size={12} className="text-red-500 opacity-80" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>


        {/* --- TABLE HITBOX --- */}
        {/* Adjust top, left, width, and height to perfectly align with the green cloth in your image */}
        <div 
            id="pool-table"
            className="absolute z-10"
            style={{
                top: '18.5%',      // Adjust this to match the top edge of the green cloth
                left: '11%',       // Adjust this to match the left edge of the green cloth
                width: '78%',      // Adjust this to span from left edge to right edge
                aspectRatio: '1/2' // Standard pool table ratio
            }}
            onMouseMove={handleTableMove}
            onTouchMove={handleTableMove}
            onMouseDown={handleTableMove}
        >
            {/* We NO LONGER draw the table styling, borders, or pockets. 
                Everything is on the background image. We ONLY draw dynamic elements. */}

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
                                // Simplified shadow since the image has its own lighting, just enough to pop
                                boxShadow: '2px 4px 6px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.6)'
                            }}>
                            
                            {/* Rotation wrapper */}
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
                    {/* Ghost Ball */}
                    <circle 
                        cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                        cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                        r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.9)" 
                        strokeWidth="1.5" 
                    />
                    {/* Deflection */}
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
                    {/* Blue tip */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[7px] border-r border-white/50"></div>
                </div>
            )}
        </div>

        {/* --- POWER BAR HITBOX --- */}
        {/* Adjust to match the power bar slider in your image */}
        <div className="absolute z-20 cursor-pointer touch-none"
             style={{
                 top: '35%',
                 right: '3%',
                 width: '8%',
                 height: '30%',
                 // backgroundColor: 'rgba(255,0,0,0.2)' // Uncomment to debug hitbox positioning
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
            {/* The Draggable Thumb (Matches exactly where power is) */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[120%] h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded shadow-lg border border-white z-10 pointer-events-none flex items-center justify-center"
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

