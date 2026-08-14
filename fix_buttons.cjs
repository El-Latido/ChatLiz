const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetAceptar = `                                                     import('firebase/firestore').then(({ doc, deleteDoc, updateDoc, arrayUnion, setDoc }) => {
                                                         deleteDoc(doc(db, 'friendRequests', n.id));
                                                         setDoc(doc(db, 'friends', n.id), { user1: user.username, user2: n.frData.from });
                                                         updateDoc(doc(db, 'users', user.username), { friends_list: arrayUnion(n.frData.from) });
                                                         updateDoc(doc(db, 'users', n.frData.from), { friends_list: arrayUnion(user.username) });
                                                     });`;

const replaceAceptar = `                                                     import('firebase/firestore').then(({ doc, deleteDoc, updateDoc, arrayUnion, setDoc }) => {
                                                         if (n.frData?.docId) deleteDoc(doc(db, 'friendRequests', n.frData.docId));
                                                         else deleteDoc(doc(db, 'friendRequests', n.id));
                                                         
                                                         const fromUser = n.senderUid || n.frData?.from;
                                                         setDoc(doc(db, 'friends', n.id), { user1: user.username, user2: fromUser });
                                                         updateDoc(doc(db, 'users', user.username), { friends_list: arrayUnion(fromUser) });
                                                         updateDoc(doc(db, 'users', fromUser), { friends_list: arrayUnion(user.username) });
                                                         updateDoc(doc(db, 'notifications', n.id), { isRead: true });
                                                     });`;

const targetRechazar = `                                                     import('firebase/firestore').then(({ doc, deleteDoc }) => {
                                                         deleteDoc(doc(db, 'friendRequests', n.id));
                                                     });`;

const replaceRechazar = `                                                     import('firebase/firestore').then(({ doc, deleteDoc, updateDoc }) => {
                                                         if (n.frData?.docId) deleteDoc(doc(db, 'friendRequests', n.frData.docId));
                                                         else deleteDoc(doc(db, 'friendRequests', n.id));
                                                         updateDoc(doc(db, 'notifications', n.id), { isRead: true });
                                                     });`;

file = file.replace(targetAceptar, replaceAceptar);
file = file.replace(targetRechazar, replaceRechazar);

// Also Marcar leídas should mark them all in DB
const targetMarcar = `<button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-xs text-[#D4AF37] hover:text-white">Marcar leídas</button>`;
const replaceMarcar = `<button onClick={() => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    import('firebase/firestore').then(({ doc, updateDoc }) => {
        notifications.forEach(n => {
            if (n.recipientUid) updateDoc(doc(db, 'notifications', n.id), { isRead: true });
        });
    });
}} className="text-xs text-[#D4AF37] hover:text-white">Marcar leídas</button>`;

file = file.replace(targetMarcar, replaceMarcar);

fs.writeFileSync('src/App.tsx', file);
