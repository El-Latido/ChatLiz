const fs = require('fs');

function fixPool() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // Add angle to sync
    code = code.replace(/id: b\.id,\s*x: b\.position\.x,\s*y: b\.position\.y,\s*color: b\.render\?\.fillStyle \|\| '#000',\s*label: b\.label/g,
        `id: b.id,
            x: b.position.x,
            y: b.position.y,
            angle: b.angle,
            color: b.render?.fillStyle || '#000',
            label: b.label`);

    // Pockets collision detection in sync loop
    const syncLoopRegex = /const syncLoop = setInterval\(\(\) => \{[\s\S]*?setBallPositions\(positions\);/m;
    const newSyncLoop = `const syncLoop = setInterval(() => {
        // Check pockets
        const pockets = [
            { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
            { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
            { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
        ];
        
        const bodies = engine.world.bodies.filter(b => b.label.startsWith('ball_') || b.label === 'cue');
        bodies.forEach(b => {
            for (let p of pockets) {
                const dx = b.position.x - p.x;
                const dy = b.position.y - p.y;
                if (Math.sqrt(dx*dx + dy*dy) < HOLE_RADIUS + 5) {
                    if (b.label === 'cue') {
                        // Reset cue ball
                        Matter.Body.setPosition(b, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT * 0.75 });
                        Matter.Body.setVelocity(b, { x: 0, y: 0 });
                    } else {
                        // Pocket ball
                        Matter.World.remove(engine.world, b);
                    }
                }
            }
        });

        const positions = engine.world.bodies.filter(b => b.label.startsWith('ball_') || b.label === 'cue').map(b => ({
            id: b.id,
            x: b.position.x,
            y: b.position.y,
            angle: b.angle || 0,
            color: b.render?.fillStyle || '#000',
            label: b.label
        }));
        setBallPositions(positions);`;
    
    code = code.replace(syncLoopRegex, newSyncLoop);

    // Smooth position updates in client (framer-motion or CSS transitions)
    code = code.replace(/<div key=\{b.id\} className="absolute rounded-full z-10 pointer-events-none flex items-center justify-center overflow-hidden"/g,
        `<div key={b.id} className="absolute rounded-full z-10 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-[30ms] ease-linear"`);

    // Add rotation to the ball inner wrapper
    const ballInnerRegex = /backgroundColor: isCue \? '#ffffff' : \(isStripe \? '#ffffff' : color\),\s*boxShadow: '4px 6px 8px rgba\(0,0,0,0\.4\), inset -3px -3px 6px rgba\(0,0,0,0\.5\), inset 1px 1px 4px rgba\(255,255,255,0\.8\)'\s*\}\}>[\s\S]*?\{\/\* Stripe overlay \*\/\}/m;

    const newBallInner = `backgroundColor: isCue ? '#ffffff' : (isStripe ? '#ffffff' : color),
                                      boxShadow: '2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.8)'
                                  }}>
                                  
                                  <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: \`rotate(\${b.angle}rad)\` }}>
                                  {/* Stripe overlay */}`;

    code = code.replace(ballInnerRegex, newBallInner);
    
    // Close the new inner wrapper
    code = code.replace(/<\/span>\s*<\/div>\s*\)\}\s*\{\/\* Specular Highlight Overlay/g, 
        `</span>
                                      </div>
                                  )}
                                  </div>

                                  {/* Specular Highlight Overlay`);


    // HUD for balls pocketed
    // Before {/* Game Area */}
    const hudRegex = /\{\/\* Game Area \*\/\}/;
    const hudReplacement = `
            {/* HUD / Ball Tracker */}
            <div className="flex justify-between px-4">
                <div className="flex gap-1">
                    {[1,2,3,4,5,6,7].map(i => {
                        const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                        return <div key={i} className={\`w-4 h-4 rounded-full border border-white/20 \${isPocketed ? 'opacity-20 bg-gray-600' : 'bg-blue-500'}\`}></div>;
                    })}
                </div>
                <div className="flex gap-1">
                    {[9,10,11,12,13,14,15].map(i => {
                        const isPocketed = !ballPositions.some(b => b.label === \`ball_\${i}\`);
                        return <div key={i} className={\`w-4 h-4 rounded-full border border-white/20 flex flex-col items-center justify-center \${isPocketed ? 'opacity-20 bg-gray-600' : 'bg-white'}\`}>
                            <div className="w-full h-[50%] bg-red-500"></div>
                        </div>;
                    })}
                </div>
            </div>
            
            {/* Game Area */}`;

    code = code.replace(hudRegex, hudReplacement);

    // Table background color
    code = code.replace(/backgroundColor: '#1E6838', \/\/ Professional green cloth/, `backgroundColor: '#0A3B1C', // Deep Professional green cloth`);

    // Cue stick better design
    code = code.replace(/background: 'linear-gradient\(to right, #000 0%, #111 2%, #f1e0c5 5%, #c59763 20%, #4a2511 80%, #222 95%, #fff 100%\)',/, 
        `background: 'linear-gradient(to right, #000 0%, #111 2%, #d4b895 5%, #8b5a2b 40%, #3e2723 80%, #1a100c 95%, #fff 100%)',`);

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
}

fixPool();
