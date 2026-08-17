const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('socket.on("logout"')) {
    code = code.replace(
        /socket\.on\("disconnect", \(\) => \{/,
        `socket.on("logout", () => {
            if (currentUsername && activeUsers[currentUsername] && activeUsers[currentUsername].socketId === socket.id) {
                delete activeUsers[currentUsername];
                emitActiveUsers();
                currentUsername = "";
            }
        });

        socket.on("disconnect", () => {`
    );
    fs.writeFileSync('server.ts', code);
}
