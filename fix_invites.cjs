const fs = require('fs');

function fixApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    // For Pool
    const poolLogic = `
                  } else if (gameId.startsWith('pool_')) {
                      const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                      if ((user.lizCoins || 0) < bet) {
                          alert("No tienes suficientes Liz-Moneditas.");
                          return;
                      }
                      const msgData = {
                          id: Date.now().toString(),
                          text: bet > 0 ? \`¡Reto de Billar por \${bet * 2} LM!\` : \`¡Reto de Billar Amistoso!\`,
                          type: 'pool_invite',
                          sender: user.username,
                          senderId: user.username,
                          avatar: user.avatar,
                          inviteData: { gameId: \`pool_\${Date.now()}_\${user.username}\`, bet, host: user.username, gameType: 'pool' }
                      };
                      socket.emit('send_global', msgData);
                      setActiveChat('global');
                      setMessages(prev => [...prev, msgData]);
                      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
`;

    code = code.replace(/\} else if \(gameId\.startsWith\('pool_'\)\) \{[\s\S]*?\}\);/g, poolLogic);

    // For Chess
    const chessLogic = `
                   } else if (gameId.startsWith('chess_')) {
                       const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                       if ((user.lizCoins || 0) < bet) {
                           alert("No tienes suficientes Liz-Moneditas.");
                           return;
                       }
                       const msgData = {
                           id: Date.now().toString(),
                           text: bet > 0 ? \`¡Reto de Ajedrez por \${bet * 2} LM!\` : \`¡Reto de Ajedrez Amistoso!\`,
                           type: 'chess_invite',
                           sender: user.username,
                           senderId: user.username,
                           avatar: user.avatar,
                           inviteData: { gameId: \`chess_\${Date.now()}_\${user.username}\`, bet: bet, host: user.username, gameType: 'chess' }
                       };
                       socket.emit('send_global', msgData);
                       setActiveChat('global');
                       setMessages(prev => [...prev, msgData]);
                       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
`;
    // Replace all occurrences of chess_ logic
    code = code.replace(/\} else if \(gameId\.startsWith\('chess_'\)\) \{[\s\S]*?\}\);/g, chessLogic);

    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed App.tsx invite emission with optimistic UI");
}

fixApp();
