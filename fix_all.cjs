const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
let lines = content.split('\n');
let newLines = [];
let pending = 0;

// Re-apply the naive fix but properly target `socket.on` closures
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // The specific lines we broke are `if (callback) callback({ success: false, error: err.message }); \n });`
    // So anywhere there is a `socket.on(` opening, we need to ensure it gets closed before the next `socket.on(` or before the end of io.on
    
    if (line.match(/^\s*socket\.on\(/)) {
        if (pending > 0) {
            newLines.push('    });');
        }
        pending = 1;
    }
    
    // Handle the end of io.on block
    if (line.match(/^\s*if \(\s*process\.env\.NODE_ENV/)) {
        if (pending > 0) {
            newLines.push('    });');
            pending = 0;
        }
        newLines.push('  });');
        newLines.push('}');
    }
    
    newLines.push(line);
}

fs.writeFileSync('server.ts', newLines.join('\n'));
console.log("File patched.");
