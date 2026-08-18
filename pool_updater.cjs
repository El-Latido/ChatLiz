const fs = require('fs');

function updatePool() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // 1. Update Physics (Engine.create)
    // Replace physics settings for balls
    const ballsRegex = /balls\.push\(Bodies\.circle\(bx, by, BALL_RADIUS, \{\s*restitution: [0-9.]+,\s*friction: [0-9.]+,\s*density: [0-9.]+,\s*render: \{ fillStyle: colors\[colorIdx % colors\.length\] \},\s*label: \`ball_\$\{i\}\`\s*\}\)\);/g;
    
    code = code.replace(ballsRegex, `balls.push(Bodies.circle(bx, by, BALL_RADIUS, { 
            restitution: 0.85, 
            friction: 0.002,
            frictionAir: 0.012,
            density: 0.05,
            render: { fillStyle: colors[colorIdx % colors.length] },
            label: \`ball_\${i}\`
        }));`);

    // Update cue ball physics
    const cueRegex = /const cueBall = Bodies\.circle\(TABLE_WIDTH \/ 2, TABLE_HEIGHT \* 0\.75, BALL_RADIUS, \{\s*restitution: [0-9.]+,\s*friction: [0-9.]+,\s*density: [0-9.]+,\s*render: \{ fillStyle: '#ffffff' \},\s*label: 'cue'\s*\}\);/g;

    code = code.replace(cueRegex, `const cueBall = Bodies.circle(TABLE_WIDTH / 2, TABLE_HEIGHT * 0.75, BALL_RADIUS, {
        restitution: 0.85,
        friction: 0.002,
        frictionAir: 0.012,
        density: 0.05,
        render: { fillStyle: '#ffffff' },
        label: 'cue'
    });`);

    // 2. Update rendering of Balls (Specular Highlights)
    const renderBallsRegex = /\{\/\* Balls \*\/\}[\s\S]*?\{\/\* Aim Line \*\/\}/m;

    const newRenderBalls = `{/* Balls */}
                    {ballPositions.map(b => {
                        const isCue = b.label === 'cue';
                        const color = isCue ? '#ffffff' : b.color;
                        return (
                            <div key={b.id} className="absolute rounded-full z-10 pointer-events-none" 
                                  style={{ 
                                      width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                      height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                      left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                      top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                      background: \`radial-gradient(circle at 35% 35%, \${isCue ? '#ffffff' : 'rgba(255,255,255,0.7)'} 0%, \${color} 30%, #111 110%)\`,
                                      boxShadow: '3px 5px 6px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(0,0,0,0.4)'
                                  }} />
                        );
                    })}

                    {/* Cue Stick */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-20 pointer-events-none"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '60%',
                                 height: '8px',
                                 background: 'linear-gradient(to right, #1a0b00 0%, #3e1f00 5%, #8b4513 20%, #d2b48c 80%, #f4f4f4 95%, #444 100%)',
                                 boxShadow: '0px 15px 15px rgba(0,0,0,0.6), inset 0px 2px 2px rgba(255,255,255,0.2)',
                                 transformOrigin: '0% 50%',
                                 transform: \`rotate(\${aimAngle + Math.PI}rad) translateX(\${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 15) + 2}%)\`,
                                 borderRadius: '4px'
                             }}
                        />
                    )}

                    {/* Aim Line */}`;

    code = code.replace(renderBallsRegex, newRenderBalls);

    // 3. Fix shot power calculation
    // Max magnitude
    code = code.replace("const forceMagnitude = Math.max(0.01, p * 1.2);", "const forceMagnitude = Math.max(0.01, p * 1.8);");

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
    console.log("Updated PoolGameModal with Next-Gen graphics and stick");
}

updatePool();
