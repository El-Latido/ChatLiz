const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `                                        const date = m.createdAt?.toDate ? m.createdAt.toDate() : new Date();
                                        const timeStr = isNaN(date.getTime()) ? '10:00' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });`;

const r1 = `                                        let date = new Date();
                                        if (m.createdAt) {
                                            if (typeof m.createdAt === 'number') date = new Date(m.createdAt);
                                            else if (m.createdAt.seconds) date = new Date(m.createdAt.seconds * 1000);
                                            else if (typeof m.createdAt.toDate === 'function') date = m.createdAt.toDate();
                                            else date = new Date(m.createdAt);
                                        }
                                        const timeStr = isNaN(date.getTime()) ? '10:00' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });`;

const t2 = `                     const date = m.createdAt?.toDate ? m.createdAt.toDate() : new Date();
                     const timeStr = isNaN(date.getTime()) ? \`10:0\${idx % 10}\` : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });`;

const r2 = `                     let date = new Date();
                     if (m.createdAt) {
                         if (typeof m.createdAt === 'number') date = new Date(m.createdAt);
                         else if (m.createdAt.seconds) date = new Date(m.createdAt.seconds * 1000);
                         else if (typeof m.createdAt.toDate === 'function') date = m.createdAt.toDate();
                         else date = new Date(m.createdAt);
                     }
                     const timeStr = isNaN(date.getTime()) ? \`10:0\${idx % 10}\` : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });`;

let replaced = false;
if(code.includes(t1)) {
    code = code.replace(t1, r1);
    console.log("Replaced block 1");
    replaced = true;
} else {
    console.log("Could not find block 1");
}

if(code.includes(t2)) {
    code = code.replace(t2, r2);
    console.log("Replaced block 2");
    replaced = true;
} else {
    console.log("Could not find block 2");
}

if (replaced) {
    fs.writeFileSync('src/App.tsx', code);
}
