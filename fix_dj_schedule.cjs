const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
        if (target === "Elizabeth" && aiUserTempCache) {
            aiUserTempCache.role = 'dj';
            aiUserTempCache.djSchedule = data.schedule;
        }
        if (activeUsers[target]) {
`;
content = content.replace("if (activeUsers[target]) {", replacement);

fs.writeFileSync('server.ts', content);
