const fs = require('fs');

function updateLandscape() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // 1. Change TABLE_WIDTH and TABLE_HEIGHT back to landscape
    code = code.replace("const TABLE_WIDTH = 400;", "const TABLE_WIDTH = 800;");
    code = code.replace("const TABLE_HEIGHT = 800;", "const TABLE_HEIGHT = 400;");

    // 2. Initial setup of balls for horizontal table
    const engineSetupRegex = /Engine\.create\(\)[\s\S]*?const runner = Matter\.Runner\.create\(\);/m;
    const newEngineSetup = `Engine.create();
    engine.world.gravity.y = 0; // Top-down view
    
    // Add walls (Horizontal)
    const walls = [
        Bodies.rectangle(TABLE_WIDTH / 2, -10, TABLE_WIDTH, 20, { isStatic: true, restitution: 0.8 }), // Top
        Bodies.rectangle(TABLE_WIDTH / 2, TABLE_HEIGHT + 10, TABLE_WIDTH, 20, { isStatic: true, restitution: 0.8 }), // Bottom
        Bodies.rectangle(-10, TABLE_HEIGHT / 2, 20, TABLE_HEIGHT, { isStatic: true, restitution: 0.8 }), // Left
        Bodies.rectangle(TABLE_WIDTH + 10, TABLE_HEIGHT / 2, 20, TABLE_HEIGHT, { isStatic: true, restitution: 0.8 }) // Right
    ];
    World.add(engine.world, walls);

    // Initial balls (Horizontal setup)
    const balls = [];
    
    // Official 8-ball colors
    // 1: Yellow, 2: Blue, 3: Red, 4: Purple, 5: Orange, 6: Green, 7: Maroon, 8: Black
    // 9-15: same colors but striped
    const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f', '#111111', 
                    '#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
    
    // Triangle setup at right half (pointing left)
    const startX = TABLE_WIDTH * 0.75;
    const startY = TABLE_HEIGHT / 2;
    
    // Standard 8-ball rack:
    // Row 1: 1 ball
    // Row 2: 2 balls
    // Row 3: 3 balls (middle is 8 ball)
    // Row 4: 4 balls
    // Row 5: 5 balls
    // Ensure 8-ball is in the center of the 3rd row.
    // Ensure corners of the 5th row are one solid and one stripe.
    
    // Pattern (just filling them in a triangle shape):
    const pattern = [
        0, // Row 0
        1, 8, // Row 1 (8 is stripe)
        2, 7, 9, // Row 2 (7 is 8-ball)
        10, 3, 11, 4, // Row 3
        12, 13, 5, 14, 6 // Row 4
    ];

    let ballIdx = 0;
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row <= col; row++) {
            let bx = startX + (col * BALL_RADIUS * Math.sqrt(3));
            let by = startY - (col * BALL_RADIUS) + (row * BALL_RADIUS * 2);
            
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

    // Cue ball at left half (head string)
    const cueBall = Bodies.circle(TABLE_WIDTH * 0.25, TABLE_HEIGHT / 2, BALL_RADIUS, {
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

    // 3. Update Sync loop Pocket positions (landscape)
    const pocketSyncRegex = /const pockets = \[\s*\{ x: 0, y: 0 \}, \{ x: TABLE_WIDTH, y: 0 \},\s*\{ x: 0, y: TABLE_HEIGHT \/ 2 \}, \{ x: TABLE_WIDTH, y: TABLE_HEIGHT \/ 2 \},\s*\{ x: 0, y: TABLE_HEIGHT \}, \{ x: TABLE_WIDTH, y: TABLE_HEIGHT \}\s*\];/m;
    const newPocketSync = `const pockets = [
            { x: 0, y: 0 }, { x: TABLE_WIDTH / 2, y: 0 }, { x: TABLE_WIDTH, y: 0 },
            { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
        ];`;
    code = code.replace(pocketSyncRegex, newPocketSync);

    // Reset cue ball in sync loop (landscape)
    code = code.replace(/Matter\.Body\.setPosition\(b, \{ x: TABLE_WIDTH \/ 2, y: TABLE_HEIGHT \* 0\.75 \}\);/, 
                        `Matter.Body.setPosition(b, { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2 });`);

    // 4. Update the layout: Landscape table
    // Table container and power bar layout
    const layoutRegex = /<div className="flex flex-1 gap-2 md:gap-6 items-stretch justify-center h-full min-h-0 w-full overflow-hidden">[\s\S]*?id="pool-table"[\s\S]*?style=\{\{ \s*height: '100%', aspectRatio: '1\/2'/m;
    
    const newLayout = `<div className="flex flex-col md:flex-row flex-1 gap-4 items-center justify-center w-full min-h-0 overflow-hidden">
                
                {/* Table */}
                <div 
                    id="pool-table"
                    className="relative border-[16px] md:border-[24px] rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden shrink-0" 
                    style={{ 
                        width: '100%', maxWidth: '1000px', aspectRatio: '2/1', maxHeight: '100%',`;
    
    code = code.replace(layoutRegex, newLayout);

    // Pockets visual rendering
    const visualPocketsRegex = /\{\/\* Pockets \*\/\}\s*\{\[\s*\{ x: 0, y: 0 \}, \{ x: TABLE_WIDTH, y: 0 \},\s*\{ x: 0, y: TABLE_HEIGHT \/ 2 \}, \{ x: TABLE_WIDTH, y: TABLE_HEIGHT \/ 2 \},\s*\{ x: 0, y: TABLE_HEIGHT \}, \{ x: TABLE_WIDTH, y: TABLE_HEIGHT \}\s*\]/m;
    const newVisualPockets = `{/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH / 2, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ]`;
    code = code.replace(visualPocketsRegex, newVisualPockets);

    // Power bar layout (landscape style, vertical bar on the side)
    const powerBarRegex = /<div className="w-14 md:w-20 h-full max-h-\[80vh\] bg-\[#111\]/m;
    const newPowerBar = `<div className="w-full md:w-16 h-16 md:h-full max-w-[500px] md:max-h-[80vh] bg-[#111]`;
    // We actually need the power bar to stay vertical, maybe place it to the side or bottom depending on mobile/desktop. 
    // Let's keep it vertical on the side for desktop, and horizontal for mobile, OR just keep it vertical always but flex-row puts it on the right.
    code = code.replace(powerBarRegex, `<div className="w-16 h-[80%] max-h-[400px] bg-[#111]`);

    // Let's also adjust the table color to match 8 ball pool better, and wood border.
    code = code.replace(/borderColor: '#2D1B11', \/\/ Dark wood border/, `borderColor: '#4A2511', // Wood border`);
    code = code.replace(/backgroundColor: '#0A3B1C', \/\/ Deep Professional green cloth/, `backgroundColor: '#1B5B31', // 8 Ball Pool Green cloth`);

    // Add table markers (dots on the rails, head string line)
    const railsRegex = /\{\/\* Inner rubber rails \*\/\}\s*<div className="absolute inset-0 border-\[6px\] border-\[#154a27\] rounded-\[1\.2rem\] opacity-80 pointer-events-none z-0"><\/div>/m;
    const newRails = `{/* Inner rubber rails */}
                    <div className="absolute inset-0 border-[8px] border-[#0F381D] rounded-[1.5rem] opacity-90 pointer-events-none z-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                    
                    {/* Head string line */}
                    <div className="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none z-0" style={{ left: '25%' }}></div>
                    <div className="absolute w-2 h-2 rounded-full bg-white/20 pointer-events-none z-0" style={{ left: '25%', top: '50%', transform: 'translate(-50%, -50%)' }}></div>
                    `;
    code = code.replace(railsRegex, newRails);

    // Make the modal use max screen space
    code = code.replace(/className="bg-\[#0f111a\] border border-\[#2e7d32\]\/30 rounded-3xl w-full h-full md:max-h-\[90vh\] md:max-w-5xl/m, 
                        `className="bg-[#0A101D] border border-white/10 rounded-3xl w-full h-full md:max-h-[90vh] md:max-w-7xl`);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}

updateLandscape();
