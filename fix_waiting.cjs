const fs = require('fs');

function fixApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    // Fix pool
    code = code.replace(
        /\{m\.type === 'pool_invite' && m\.inviteData && \([\s\S]*?<\/button>\n\s*\)\}/,
        `{m.type === 'pool_invite' && m.inviteData && (
                                             <button 
                                                disabled={m.sender === user.username}
                                                onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_pool_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setPoolData({ gameId: m.inviteData!.gameId, isHost: false, opponentName: m.sender, bet: m.inviteData!.bet });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className={\`w-full mt-2 py-1.5 \${m.sender === user.username ? 'bg-green-800/50 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-md'} text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2\`}>
                                                 <Gamepad2 size={16} /> {m.sender === user.username ? 'Esperando rival...' : '[Jugar Billar]'}
                                             </button>
                                         )}`
    );

    // Fix chess
    code = code.replace(
        /\{m\.type === 'chess_invite' && m\.inviteData && \([\s\S]*?<\/button>\n\s*\)\}/,
        `{m.type === 'chess_invite' && m.inviteData && (
                                             <button 
                                                disabled={m.sender === user.username}
                                                onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_chess_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setActiveChessGame({ id: m.inviteData!.gameId, opponent: usersOnline.find(u => u.username === m.sender) || {username: m.sender}, bet: m.inviteData!.bet, isHost: false });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className={\`w-full mt-2 py-1.5 \${m.sender === user.username ? 'bg-indigo-800/50 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md'} text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2\`}>
                                                 <Gamepad2 size={16} /> {m.sender === user.username ? 'Esperando rival...' : '[Jugar Ajedrez]'}
                                             </button>
                                         )}`
    );

    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated buttons for waiting state");
}

fixApp();
