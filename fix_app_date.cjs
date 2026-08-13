const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /let date = new Date\(\);\s*if \(m\.createdAt \|\| m\.timestamp\) \{\s*if \(\(typeof m\.createdAt === 'number' \|\| typeof m\.timestamp === 'number'\)\) date = new Date\(m\.createdAt\);\s*else if \(\(m\.createdAt\?\.seconds \|\| m\.timestamp\?\.seconds\)\) date = new Date\(\(m\.createdAt\?\.seconds \|\| m\.timestamp\?\.seconds\) \* 1000\);\s*else if \(typeof m\.createdAt\.toDate === 'function'\) date = m\.createdAt\.toDate\(\);\s*else date = new Date\(m\.createdAt\);\s*\}/g;

const repl = `let date = new Date();
                                        if (m.timestamp || m.createdAt) {
                                            const t = m.timestamp || m.createdAt;
                                            if (typeof t === 'number') date = new Date(t);
                                            else if (t.seconds) date = new Date(t.seconds * 1000);
                                            else if (typeof t.toDate === 'function') date = t.toDate();
                                            else date = new Date(t);
                                        }`;

app = app.replace(regex, repl);
fs.writeFileSync('src/App.tsx', app);
