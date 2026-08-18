const fs = require('fs');

function fixApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    const poolInviteRender = `
                                         {m.type === 'pool_invite' && m.inviteData && (
                                             <button onClick={() => {
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
                                             }} className="w-full mt-2 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-green-500 hover:to-emerald-500 transition-colors flex items-center justify-center gap-2">
                                                 <Gamepad2 size={16} /> [Jugar Billar]
                                             </button>
                                         )}
`;
    
    if (!code.includes("m.type === 'pool_invite'")) {
        code = code.replace(
            "{m.type === 'chess_invite'", 
            poolInviteRender + "\n                                         {m.type === 'chess_invite'"
        );
        fs.writeFileSync('src/App.tsx', code);
        console.log("Added pool_invite render to App.tsx");
    }
}

fixApp();
