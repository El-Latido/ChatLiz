const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Navigation for Private Chat
const chatBtnOld = `onClick={() => { setActiveChat(selectedUserModal.username); setSelectedUserModal(null); }}`;
const chatBtnNew = `onClick={() => { 
    window.history.pushState({}, '', '/chat/' + encodeURIComponent(selectedUserModal.username));
    setActiveChat(selectedUserModal.username); 
    setSelectedUserModal(null); 
    setIsSidebarOpen(false);
}}`;
file = file.replace(chatBtnOld, chatBtnNew);

// Handle POP state and initial load
const effectOld = `useEffect(() => {
    let ws = new WebSocket('wss://listen.moe/gateway_v2');`;

const effectNew = `useEffect(() => {
    const handleUrl = () => {
        const path = window.location.pathname;
        if (path.startsWith('/chat/')) {
            const u = decodeURIComponent(path.split('/')[2]);
            if (u) setActiveChat(u);
        } else {
            setActiveChat('global');
        }
    };
    handleUrl();
    window.addEventListener('popstate', handleUrl);
    return () => window.removeEventListener('popstate', handleUrl);
}, []);

  useEffect(() => {
    let ws = new WebSocket('wss://listen.moe/gateway_v2');`;

file = file.replace(effectOld, effectNew);


// 2. Likes
const likeOld = `socket.emit('like_user', selectedUserModal.username);
                             setSelectedUserModal(prev => prev ? { ...prev, profileLikes: (prev.profileLikes || 0) + 1 } : null);`;
const likeNew = `socket.emit('like_user', selectedUserModal.username);
                             setSelectedUserModal(prev => prev ? { ...prev, profileLikes: (prev.profileLikes || 0) + 1 } : null);
                             import('firebase/firestore').then(({ addDoc, collection }) => {
                                 addDoc(collection(db, 'notifications'), { to: selectedUserModal.username, from: user.username, type: 'like', createdAt: Date.now() });
                             });`;
file = file.replace(likeOld, likeNew);


// 3. Friends Request logic replacing toggle_friend
const friendOld = `socket.emit('toggle_friend', selectedUserModal.username, (res: any) => {
                                     if(res.success) {
                                         setUser(prev => ({
                                             ...prev,
                                             friends_list: res.isFriend ? [...(prev.friends_list || []), selectedUserModal.username] : (prev.friends_list || []).filter(f => f !== selectedUserModal.username)
                                         }));
                                         setSelectedUserModal(null);
                                     }
                                 });`;
const friendNew = `if (user.friends_list?.includes(selectedUserModal.username)) {
                                     import('firebase/firestore').then(({ doc, updateDoc, arrayRemove }) => {
                                         updateDoc(doc(db, 'users', user.username), { friends_list: arrayRemove(selectedUserModal.username) });
                                         updateDoc(doc(db, 'users', selectedUserModal.username), { friends_list: arrayRemove(user.username) });
                                     });
                                     setUser(prev => ({ ...prev, friends_list: prev.friends_list?.filter(f => f !== selectedUserModal.username) }));
                                     setSelectedUserModal(null);
                                 } else {
                                     import('firebase/firestore').then(({ addDoc, collection }) => {
                                         addDoc(collection(db, 'friendRequests'), { from: user.username, to: selectedUserModal.username, status: 'pending', createdAt: Date.now() });
                                     });
                                     setSelectedUserModal(null);
                                     alert("Solicitud enviada");
                                 }`;
file = file.replace(friendOld, friendNew);
file = file.replace(
    `{user.friends_list?.includes(selectedUserModal.username) ? 'Quitar Amigo' : 'Añadir Amigo'}`,
    `{user.friends_list?.includes(selectedUserModal.username) ? 'Quitar Amigo' : 'Enviar Solicitud'}`
);

// 4. Listeners for notifications and friend requests
const listenOld = `useEffect(() => {
    if (!user.username || user.username === 'Guest') return;
    socket.emit('get_active_users');`;
    
const listenNew = `useEffect(() => {
    if (!user.username || user.username === 'Guest') return;
    
    // Listen for Likes and Friend Requests
    import('firebase/firestore').then(({ collection, query, onSnapshot }) => {
        const qNotif = query(collection(db, 'notifications'));
        const unsubNotif = onSnapshot(qNotif, (snap) => {
            snap.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data.to === user.username && data.type === 'like' && data.createdAt > Date.now() - 10000) {
                        setNotifications(prev => [{ id: change.doc.id, text: \`A \${data.from} le gustó tu perfil\`, read: false, type: 'like' }, ...prev]);
                    }
                }
            });
        });
        
        const qFr = query(collection(db, 'friendRequests'));
        const unsubFr = onSnapshot(qFr, (snap) => {
            snap.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data.to === user.username && data.status === 'pending') {
                        setNotifications(prev => [{ id: change.doc.id, text: \`Solicitud de amistad de \${data.from}\`, read: false, type: 'friend_request', frData: data }, ...prev]);
                        setShowNotifications(true);
                    }
                }
            });
        });
    });

    socket.emit('get_active_users');`;
file = file.replace(listenOld, listenNew);

// Fix the render of Notifications to include Accept/Reject
const notifRenderOld = `<div className={\`\${n.type === 'accepted' ? 'text-green-400' : 'text-red-400'} font-medium\`}>{n.text}</div>`;
const notifRenderNew = `<div className={\`\${n.type === 'accepted' ? 'text-green-400' : n.type === 'friend_request' ? 'text-cyan-400' : n.type === 'like' ? 'text-pink-400' : 'text-red-400'} font-medium\`}>{n.text}</div>
                                         {n.type === 'friend_request' && (
                                             <div className="flex gap-2 mt-2">
                                                 <button onClick={() => {
                                                     import('firebase/firestore').then(({ doc, deleteDoc, updateDoc, arrayUnion, setDoc }) => {
                                                         deleteDoc(doc(db, 'friendRequests', n.id));
                                                         setDoc(doc(db, 'friends', n.id), { user1: user.username, user2: n.frData.from });
                                                         updateDoc(doc(db, 'users', user.username), { friends_list: arrayUnion(n.frData.from) });
                                                         updateDoc(doc(db, 'users', n.frData.from), { friends_list: arrayUnion(user.username) });
                                                     });
                                                     setNotifications(prev => prev.filter(x => x.id !== n.id));
                                                 }} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-xs font-bold hover:bg-green-500/30 transition-colors">Aceptar</button>
                                                 
                                                 <button onClick={() => {
                                                     import('firebase/firestore').then(({ doc, deleteDoc }) => {
                                                         deleteDoc(doc(db, 'friendRequests', n.id));
                                                     });
                                                     setNotifications(prev => prev.filter(x => x.id !== n.id));
                                                 }} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-500/30 transition-colors">Rechazar</button>
                                             </div>
                                         )}`;
file = file.replace(notifRenderOld, notifRenderNew);

fs.writeFileSync('src/App.tsx', file);
