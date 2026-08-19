const fs = require('fs');
let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

// Remove the local import
code = code.replace(/import tableBg from '\.\.\/assets\/images\/pool_layout_1787163922479\.jpg';\n?/, '');

// Fix the Table Wrapper
const returnRegex = /\{\/\* TABLE WRAPPER \*\/\}.*?(?=\{\/\* POWER BAR \*\/\})/s;

const newTableWrapper = `{/* TABLE WRAPPER */}
            <div className="relative shrink-0 shadow-[0_30px_60px_rgba(0,0,0,1)] rounded-xl" style={{ height: '95%', aspectRatio: '1/2', backgroundColor: '#000' }}>
                
                {/* 
                  NATIVE BACKGROUND IMAGE (Layer 0)
                  Using an explicit img tag pointing to the public asset is the most bulletproof way 
                  to ensure the image loads across all browsers and devices without CSS background clipping.
                */}
                <img 
                    src="/pool-bg.jpg" 
                    alt="Pool Table" 
                    className="absolute max-w-none z-0 pointer-events-none" 
                    style={{ 
                        width: '124%', 
                        height: '124%', 
                        top: '-12%', 
                        left: '-12%',
                        objectFit: 'fill',
                        borderRadius: '2.5rem'
                    }} 
                />
                
                {/* INNER SHADOW OVER THE GREEN CLOTH */}
                <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none z-10"></div>

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

            `;

code = code.replace(returnRegex, newTableWrapper);
fs.writeFileSync('src/components/PoolGameModal.tsx', code);
