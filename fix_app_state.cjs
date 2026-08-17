const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateRegex = /  const \[toasts, setToasts\] = useState<any\[\]>\(\[\]\);/;
const stateReplacement = `  const [toasts, setToasts] = useState<any[]>([]);
  const [chatList, setChatList] = useState<any[]>([]);`;
code = code.replace(stateRegex, stateReplacement);

const listenerRegex = /    let unsubNotif: any = null;\n    const setupListeners = \(\) => \{/;
const listenerReplacement = `    let unsubNotif: any = null;
    let unsubChats: any = null;
    const setupListeners = () => {
        if (unsubChats) unsubChats();`;
code = code.replace(listenerRegex, listenerReplacement);

const unsubRegex = /        if \(unsubNotif\) unsubNotif\(\);/;
const unsubReplacement = `        if (unsubNotif) unsubNotif();
        
        const qChats = query(collection(db, "userChats", user.username, "chats"), orderBy("updatedAt", "desc"));
        unsubChats = onSnapshot(qChats, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChatList(list);
        });`;
code = code.replace(unsubRegex, unsubReplacement);

const cleanupRegex = /      if \(typeof unsubNotif === 'function'\) unsubNotif\(\);/;
const cleanupReplacement = `      if (typeof unsubNotif === 'function') unsubNotif();
      if (typeof unsubChats === 'function') unsubChats();`;
code = code.replace(cleanupRegex, cleanupReplacement);

fs.writeFileSync('src/App.tsx', code);
