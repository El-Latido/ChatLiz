const fs = require('fs');

function updateModal() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // 1. Change TABLE_WIDTH and TABLE_HEIGHT to portrait format
    code = code.replace("const TABLE_WIDTH = 800;", "const TABLE_WIDTH = 400;");
    code = code.replace("const TABLE_HEIGHT = 400;", "const TABLE_HEIGHT = 800;");

    // 2. Initial setup of balls for vertical table
    // In useEffect, look for Engine.create
    // Let's replace the whole Engine.create useEffect to adjust ball positions and walls.
    const engineSetupRegex = /Engine\.create\(\)[\s\S]*?(?=return \(\) => {)/m;
    const newEngineSetup = `Engine.create();
    engine.world.gravity.y = 0; // Top-down view
    
    // Add walls (Vertical)
    const walls = [
        Bodies.rectangle(TABLE_WIDTH / 2, -10, TABLE_WIDTH, 20, { isStatic: true, restitution: 0.8 }), // Top
        Bodies.rectangle(TABLE_WIDTH / 2, TABLE_HEIGHT + 10, TABLE_WIDTH, 20, { isStatic: true, restitution: 0.8 }), // Bottom
        Bodies.rectangle(-10, TABLE_HEIGHT / 2, 20, TABLE_HEIGHT, { isStatic: true, restitution: 0.8 }), // Left
        Bodies.rectangle(TABLE_WIDTH + 10, TABLE_HEIGHT / 2, 20, TABLE_HEIGHT, { isStatic: true, restitution: 0.8 }) // Right
    ];
    World.add(engine.world, walls);

    // Initial balls (Vertical setup)
    const balls = [];
    const colors = ['#f44336', '#ffeb3b', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#795548', '#000000'];
    
    // Triangle setup at top half
    const startX = TABLE_WIDTH / 2;
    const startY = TABLE_HEIGHT * 0.25;
    let colorIdx = 0;
    let row = 0;
    for (let i = 0; i < 15; i++) {
        if (i === 0) row = 0;
        else if (i === 1) row = 1;
        else if (i === 3) row = 2;
        else if (i === 6) row = 3;
        else if (i === 10) row = 4;
        
        let col = i - (row * (row + 1)) / 2;
        let bx = startX + (col * BALL_RADIUS * 2) - (row * BALL_RADIUS);
        let by = startY - (row * BALL_RADIUS * Math.sqrt(3));
        
        balls.push(Bodies.circle(bx, by, BALL_RADIUS, { 
            restitution: 0.9, 
            friction: 0.005,
            density: 0.05,
            render: { fillStyle: colors[colorIdx % colors.length] },
            label: \`ball_\${i}\`
        }));
        colorIdx++;
    }

    // Cue ball at bottom half
    const cueBall = Bodies.circle(TABLE_WIDTH / 2, TABLE_HEIGHT * 0.75, BALL_RADIUS, {
        restitution: 0.9,
        friction: 0.005,
        density: 0.05,
        render: { fillStyle: '#ffffff' },
        label: 'cue'
    });
    balls.push(cueBall);
    
    World.add(engine.world, balls);
    
    // Sync loop
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    
    const syncLoop = setInterval(() => {
        const positions = engine.world.bodies.filter(b => b.label.startsWith('ball_') || b.label === 'cue').map(b => ({
            id: b.id,
            x: b.position.x,
            y: b.position.y,
            color: b.render?.fillStyle || '#000',
            label: b.label
        }));
        setBallPositions(positions);
        if (opponentName !== 'Práctica') {
            socket.emit('pool_sync', { gameId, positions });
        }
    }, 1000 / 30);
    
    `;
    code = code.replace(engineSetupRegex, newEngineSetup);

    // 3. Fix the table container rendering.
    // Instead of flex row with power bar, make the table take up most space.
    const tableRenderRegex = /<div className="flex gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;

    const newRender = `<div className="flex flex-1 gap-4 items-stretch justify-center h-full min-h-0 w-full overflow-hidden">
                {/* Table */}
                <div 
                    id="pool-table"
                    className="relative border-[10px] md:border-[15px] border-[#3E2723] rounded-[1.5rem] shadow-2xl bg-[#0a4220] overflow-hidden" 
                    style={{ height: '100%', aspectRatio: '1/2', maxHeight: '80vh' }}
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                    onMouseDown={handleTableMove}
                >
                    {/* Render table relative to 400x800 internally via percentages */}
                    {/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ].map((p, i) => (
                        <div key={i} className="absolute bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] z-0" 
                              style={{ 
                                  width: (HOLE_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                  height: (HOLE_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                  left: ((p.x - HOLE_RADIUS)/TABLE_WIDTH)*100+'%',
                                  top: ((p.y - HOLE_RADIUS)/TABLE_HEIGHT)*100+'%'
                              }} />
                    ))}
                    
                    {/* Balls */}
                    {ballPositions.map(b => (
                        <div key={b.id} className="absolute rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.4)] z-10" 
                              style={{ 
                                  width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                  height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                  left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                  top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                  backgroundColor: b.color
                              }} />
                    ))}

                    {/* Aim Line */}
                    {turn === user.username && cueBall && (
                        <div className="absolute pointer-events-none z-20"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '15%', // Short line
                                 height: '2px',
                                 backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                 transformOrigin: '0% 50%',
                                 transform: \`rotate(\${aimAngle}rad)\`
                             }}
                        />
                    )}
                </div>

                {/* Power Bar */}
                <div className="w-12 md:w-16 h-full max-h-[80vh] bg-[#0a0f1c] border-[3px] border-green-500/30 rounded-xl relative flex flex-col justify-end overflow-hidden cursor-pointer touch-none shadow-xl shrink-0"
                     id="power-bar"
                     onMouseDown={handlePowerStart}
                     onMouseMove={handlePowerMove}
                     onMouseUp={handlePowerEnd}
                     onMouseLeave={handlePowerEnd}
                     onTouchStart={handlePowerStart}
                     onTouchMove={handlePowerMove}
                     onTouchEnd={handlePowerEnd}
                >
                    <div className="w-full bg-gradient-to-t from-green-600 via-emerald-400 to-yellow-300 pointer-events-none transition-all duration-75 relative" 
                         style={{ height: \`\${power * 100}%\` }}>
                         <div className="absolute top-0 w-full h-1 bg-white/80 shadow-[0_0_8px_white]"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}`;

    code = code.replace(tableRenderRegex, newRender);

    // Also make the modal itself full height
    code = code.replace('className="bg-[#0f111a] border border-[#2e7d32]/30 rounded-3xl w-full max-w-5xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(46,125,50,0.2)]"', 
                        'className="bg-[#0f111a] border border-[#2e7d32]/30 rounded-3xl w-full h-full md:max-h-[90vh] md:max-w-5xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(46,125,50,0.2)]"');

    // Make content wrapper flex 1
    code = code.replace('<div className="p-4 flex flex-col items-center gap-4">', '<div className="p-4 flex flex-col items-center gap-4 flex-1 min-h-0 overflow-hidden">');

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
    console.log("Updated PoolGameModal.tsx");
}

updateModal();
