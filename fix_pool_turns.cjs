const fs = require('fs');

function updatePool() {
    let code = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');

    // In practice mode, don't switch turns
    code = code.replace(
        "setTurn(turn === user.username ? opponentName : user.username);", 
        "if (opponentName !== 'Práctica') setTurn(turn === user.username ? opponentName : user.username);"
    );
    
    // Disable turn changing via socket if practice mode
    code = code.replace(
        "socket.emit('pool_turn_change', { gameId, nextTurn: turn === user.username ? opponentName : user.username });",
        "if (opponentName !== 'Práctica') socket.emit('pool_turn_change', { gameId, nextTurn: turn === user.username ? opponentName : user.username });"
    );

    fs.writeFileSync('src/components/PoolGameModal.tsx', code);
    console.log("Pool logic updated");
}

updatePool();
