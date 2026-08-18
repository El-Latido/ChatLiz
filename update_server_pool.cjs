const fs = require('fs');

function updateServer() {
    let code = fs.readFileSync('server.ts', 'utf8');

    if (!code.includes("accept_pool_invite")) {
        const poolEvents = `
    socket.on('accept_pool_invite', async (inviteData, callback) => {
        if (!currentUsername) return callback({ success: false, error: 'Not logged in' });
        const hostName = inviteData.host;
        const bet = inviteData.bet;
        const gameId = inviteData.gameId;

        const guestCoins = activeUsers[currentUsername]?.lizCoins || 0;
        const hostCoins = activeUsers[hostName]?.lizCoins || 0;

        if (guestCoins < bet) return callback({ success: false, error: 'No tienes suficientes monedas.' });
        if (hostCoins < bet) return callback({ success: false, error: 'El anfitrión ya no tiene suficientes monedas.' });
        if (!activeUsers[hostName]) return callback({ success: false, error: 'El anfitrión ya no está en línea.' });

        // Deduct
        activeUsers[currentUsername].lizCoins -= bet;
        activeUsers[hostName].lizCoins -= bet;

        socket.join(gameId);
        const hostSocket = io.sockets.sockets.get(activeUsers[hostName].socketId);
        if (hostSocket) hostSocket.join(gameId);

        io.to(activeUsers[hostName].socketId).emit('pool_invite_accepted', {
            gameId, opponent: currentUsername, bet
        });
        
        emitActiveUsers();
        callback({ success: true });
    });

    socket.on('pool_sync', (data) => {
        socket.to(data.gameId).emit('pool_sync', data);
    });

    socket.on('pool_shoot', (data) => {
        socket.to(data.gameId).emit('pool_shoot', data);
    });
    
    socket.on('pool_turn_change', (data) => {
        socket.to(data.gameId).emit('pool_turn_change', data);
    });
`;

        code = code.replace("socket.on('join_chess_game'", poolEvents + "\n    socket.on('join_chess_game'");
        fs.writeFileSync('server.ts', code);
        console.log("Updated server.ts with pool events");
    }
}

updateServer();
