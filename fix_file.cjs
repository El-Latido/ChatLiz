const fs = require('fs');

let brokenCode = fs.readFileSync('/tmp/server.ts.broken', 'utf8');
let lines = brokenCode.split('\n');

let fixedLines = [];
let pendingCloses = 0;

// This heuristic adds `    });` when we encounter another `socket.on` and we are inside a previous one without a close.
// We know that `sed -i '/});/d'` literally just removed lines matching `});`.

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if it's the start of a socket.on
    if (line.match(/^\s*socket\.on\(/)) {
        if (pendingCloses > 0) {
            fixedLines.push('    });');
            pendingCloses = 0;
        }
        pendingCloses++;
    }
    
    // Also, if we hit the end of the connection block:
    if (line.match(/^\s*if \(\s*process\.env\.NODE_ENV/)) {
        if (pendingCloses > 0) {
            fixedLines.push('    }); // close last socket.on');
            pendingCloses = 0;
        }
        fixedLines.push('  }); // close io.on(connection)');
    }
    
    fixedLines.push(line);
}

// Write the fixed file
fs.writeFileSync('server.ts.fixed', fixedLines.join('\n'));
console.log("Wrote server.ts.fixed");

