const fs = require('fs');

function setupPortrait() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // 1. Change Dimensions back to Portrait (2:1 aspect ratio, vertical)
    code = code.replace("const TABLE_WIDTH = 800;", "const TABLE_WIDTH = 400;");
    code = code.replace("const TABLE_HEIGHT = 400;", "const TABLE_HEIGHT = 800;");

    // 2. Physics Engine Walls & Balls (Vertical)
    const engineSetupRegex = /Engine\.create\(\)[\s\S]*?const runner = Matter\.Runner\.create\(\);/m;
    
    // We need to place balls precisely to fit the width. 
    // Table width is 400. Ball radius is 12 (diameter 24).
    // Let's use standard colors again for the vertical layout.
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
    
    const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f', '#111111', 
                    '#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
    
    // Triangle setup at top half (pointing down)
    const startX = TABLE_WIDTH / 2;
    const startY = TABLE_HEIGHT * 0.25;
    
    const pattern = [
        0, // Row 0 (Top tip)
        1, 8, // Row 1
        2, 7, 9, // Row 2 (7 is 8-ball)
        10, 3, 11, 4, // Row 3
        12, 13, 5, 14, 6 // Row 4
    ];

    let ballIdx = 0;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            // Center each row. Total width of row is row * BALL_RADIUS * 2
            let bx = startX + (col * BALL_RADIUS * 2) - (row * BALL_RADIUS);
            let by = startY + (row * BALL_RADIUS * Math.sqrt(3)); // Y goes down
            
            let colorIndex = pattern[ballIdx];
            
            balls.push(Bodies.circle(bx, by, BALL_RADIUS, { 
                restitution: 0.85, 
                friction: 0.002,
                frictionAir: 0.012,
                density: 0.05,
                render: { fillStyle: colors[colorIndex] },
                label: colorIndex === 7 ? 'ball_8' : \`ball_\${colorIndex + 1}\`
            }));
            ballIdx++;
        }
    }

    // Cue ball at bottom half (head string)
    const cueBall = Bodies.circle(TABLE_WIDTH / 2, TABLE_HEIGHT * 0.75, BALL_RADIUS, {
        restitution: 0.85,
        friction: 0.002,
        frictionAir: 0.012,
        density: 0.05,
        render: { fillStyle: '#ffffff' },
        label: 'cue'
    });
    balls.push(cueBall);
    
    World.add(engine.world, balls);
    
    const runner = Matter.Runner.create();`;
    
    code = code.replace(engineSetupRegex, newEngineSetup);

    // 3. Pockets Logic for Sync Loop (Vertical)
    const pocketSyncRegex = /const pockets = \[\s*\{ x: 0, y: 0 \}, \{ x: TABLE_WIDTH \/ 2, y: 0 \}, \{ x: TABLE_WIDTH, y: 0 \},\s*\{ x: 0, y: TABLE_HEIGHT \}, \{ x: TABLE_WIDTH \/ 2, y: TABLE_HEIGHT \}, \{ x: TABLE_WIDTH, y: TABLE_HEIGHT \}\s*\];/m;
    const newPocketSync = `const pockets = [
            { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
            { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
            { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
        ];`;
    code = code.replace(pocketSyncRegex, newPocketSync);

    // 4. Cue reset position logic
    code = code.replace(/Matter\.Body\.setPosition\(b, \{ x: TABLE_WIDTH \* 0\.25, y: TABLE_HEIGHT \/ 2 \}\);/g, 
                        `Matter.Body.setPosition(b, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT * 0.75 });`);

    // 5. HUD Layout Update (Top profiles with ball trackers)
    const hudRegex = /\{\/\* Player HUD \*\/\}\s*<div className="flex justify-between items-center px-4 py-2 bg-\[#0A101D\] rounded-2xl border border-white\/5 shadow-lg">[\s\S]*?\{\/\* HUD \/ Ball Tracker \*\/\}\s*<div className="flex justify-between px-4">[\s\S]*?<\/div>\s*<\/div>/m;
    
    const newHUD = `{/* Player HUD with Ball Trackers */}
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
            </div>`;
    
    code = code.replace(hudRegex, newHUD);

    // 6. Layout Adjustment for Table and Power bar
    const tableContainerRegex = /<div className="flex flex-col md:flex-row flex-1 gap-4 items-center justify-center w-full min-h-0 overflow-hidden">[\s\S]*?id="pool-table"/m;
    const newTableContainer = `<div className="flex flex-row flex-1 gap-4 items-center justify-center w-full min-h-0 overflow-hidden px-2 pb-4">
                
                {/* Table */}
                <div 
                    id="pool-table"`;
    code = code.replace(tableContainerRegex, newTableContainer);

    // Update table styling for portrait
    code = code.replace(/className="relative border-\[16px\] md:border-\[24px\] rounded-\[1\.5rem\] md:rounded-\[2\.5rem\] shadow-\[0_30px_60px_rgba\(0,0,0,0\.8\)\] overflow-hidden shrink-0"\s*style=\{\{\s*width: '100%', maxWidth: '1000px', aspectRatio: '2\/1', maxHeight: '100%',/, 
                        `className="relative border-[16px] md:border-[24px] rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden shrink-0" 
                    style={{ 
                        height: '100%', maxHeight: '1000px', aspectRatio: '1/2', maxWidth: '100%',`);

    // Inner Rails and lines for vertical
    const railsRegex = /\{\/\* Inner rubber rails \*\/\}\s*<div className="absolute inset-0 border-\[8px\] border-\[#0F381D\] rounded-\[1\.5rem\] opacity-90 pointer-events-none z-0 shadow-\[inset_0_0_20px_rgba\(0,0,0,0\.5\)\]"><\/div>\s*\{\/\* Head string line \*\/\}\s*<div className="absolute top-0 bottom-0 w-px bg-white\/20 pointer-events-none z-0" style=\{\{ left: '25%' \}\}\><\/div>\s*<div className="absolute w-2 h-2 rounded-full bg-white\/20 pointer-events-none z-0" style=\{\{ left: '25%', top: '50%', transform: 'translate\(-50%, -50%\)' \}\}\><\/div>/m;
    const newRails = `{/* Inner rubber rails */}
                    <div className="absolute inset-0 border-[8px] border-[#0F381D] rounded-[1.5rem] opacity-90 pointer-events-none z-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                    
                    {/* Head string line (Vertical layout -> bottom quarter) */}
                    <div className="absolute left-0 right-0 h-px bg-white/20 pointer-events-none z-0" style={{ top: '75%' }}></div>
                    <div className="absolute w-2 h-2 rounded-full bg-white/20 pointer-events-none z-0" style={{ left: '50%', top: '75%', transform: 'translate(-50%, -50%)' }}></div>`;
    code = code.replace(railsRegex, newRails);

    // Visual pockets rendering update for vertical
    const pocketsVisualRegex = /\{\/\* Pockets \*\/\}\s*\{\[\s*\{ x: 0, y: 0 \}, \{ x: TABLE_WIDTH \/ 2, y: 0 \}, \{ x: TABLE_WIDTH, y: 0 \},\s*\{ x: 0, y: TABLE_HEIGHT \}, \{ x: TABLE_WIDTH \/ 2, y: TABLE_HEIGHT \}, \{ x: TABLE_WIDTH, y: TABLE_HEIGHT \}\s*\]/m;
    const newVisualPockets = `{/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ]`;
    code = code.replace(pocketsVisualRegex, newVisualPockets);


    // Power bar layout Update (Keep it vertical on the right)
    code = code.replace(/<div className="w-12 md:w-16 h-\[60vh\] md:h-full max-h-\[400px\] bg-\[#111\]/, `<div className="w-12 md:w-16 h-full max-h-[60vh] md:max-h-[80vh] bg-[#111]`);

    // Make modal background lighter to match image
    code = code.replace(/className="p-2 md:p-4 flex flex-col gap-2 md:gap-4 flex-1 min-h-0 overflow-hidden bg-\[#050B14\]"/, `className="p-0 md:p-4 flex flex-col gap-2 md:gap-4 flex-1 min-h-0 overflow-hidden bg-[#1A1F2B]"`);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
    console.log("Updated to portrait 8-Ball layout");
}

setupPortrait();
