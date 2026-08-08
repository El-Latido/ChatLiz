const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch 1: password reset
code = code.replace(
    /if \(fdb\) \{\n            await updateDoc\(doc\(fdb, 'users', username\), \{ password: newPassword \}\);\n        \}/,
    `if (fdb) {
            try {
                await updateDoc(doc(fdb, 'users', username), { password: newPassword });
            } catch (e) { console.error("Error password reset", e); }
        }`
);

fs.writeFileSync('server.ts', code);
