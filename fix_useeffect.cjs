const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove activeChat from the main useEffect
// Let's find the end of the main useEffect: `}, [isLoggedIn, activeChat, user.username]);`
code = code.replace(/}, \[isLoggedIn, activeChat, user\.username\]\);/g, "}, [isLoggedIn, user.username]);");

// 2. Remove the messages logic from the main useEffect
const messagesLogicRegex = /let unsubMessages: any = null;\s*if \(activeChat === 'global' \|\| activeChat === 'tutifrutti'\) \{[\s\S]*?\}\s*socket\.on\('dj_request_status'/;

const extractedMessagesLogic = `
  useEffect(() => {
    if (!isLoggedIn) return;
    let unsubMessages: any = null;
    
    if (activeChat === 'global' || activeChat === 'tutifrutti') {
        const q = query(collection(db, 'global_chat'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            const filteredMsgs = msgs.filter((m: any) => {
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
        const q = query(collection(db, 'chats', convoId, 'messages'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            setMessages(msgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    }
    
    return () => {
        if (unsubMessages) unsubMessages();
    };
  }, [isLoggedIn, activeChat, user.username]);

  socket.on('dj_request_status'`;

code = code.replace(messagesLogicRegex, extractedMessagesLogic);

// 3. Remove `if (unsubMessages) unsubMessages();` from the main useEffect cleanup
code = code.replace(/if \(unsubMessages\) unsubMessages\(\);\n/g, "");

fs.writeFileSync('src/App.tsx', code);
