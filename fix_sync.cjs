const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
  useEffect(() => {
    if (!isLoggedIn) return;
    
    let unsubMessages: any = null;
    
    if (activeChat === 'global' || activeChat === 'tutifrutti') {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            // Modo Silencio: Filter out Elizabeth's messages if playing
            const filteredMsgs = msgs.filter(m => {
                if (m.sender === 'Elizabeth' && (isGamesMenuOpenRef.current || activeChessGameRef.current || tutiFruttiStateRef.current?.isActive)) {
                    return false;
                }
                return true;
            });
            setMessages(filteredMsgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    } else {
        const participants = [user.username, activeChat].sort();
        const convoId = participants.join("_");
        const q = query(collection(db, 'private_messages', convoId, 'messages'), orderBy('createdAt', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            setMessages(msgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    }

    socket.on('receive_global', (msg: any) => {
      // Just for translation if needed, but onSnapshot handles display
      // We can keep it to trigger notifications if we had them
    });

    socket.on('receive_private', (msg: any, fromUser: string) => {
      if (activeChat !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
      }
    });
`;

content = content.replace(/useEffect\(\(\) => \{\n\s*if \(!isLoggedIn\) return;\n\s*if \(activeChat === 'global' \|\| activeChat === 'tutifrutti'\) \{[\s\S]*?\}\);\n\n\s*socket\.on\('tutifrutti_state'/, replacement + "\n    socket.on('tutifrutti_state'");

fs.writeFileSync('src/App.tsx', content);
