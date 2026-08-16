const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add notifyOwner
code = code.replace(
  `export const sendNotification = async (recipientUid: string, type: string, senderData: any) => {`,
  `export const notifyOwner = async (profileUid: string, actionType: string, visitorName: string) => {
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db, "notifications"), {
      recipientUid: profileUid,
      senderName: visitorName,
      type: actionType,
      message: \`Has recibido un \${actionType} de \${visitorName}\`,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al notificar al propietario:", error);
  }
};

export const sendNotification = async (recipientUid: string, type: string, senderData: any) => {`
);

// Update query listener
code = code.replace(
  `const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username)
        );`,
  `const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username),
            where("isRead", "==", false)
        );`
);

// We need to update the 4 buttons inside the modal. Let's do it using Regex or exact string replacement.
code = code.replace(
  `window.history.pushState({}, '', '/chat/' + encodeURIComponent(selectedUserModal.username));
    setActiveChat(selectedUserModal.username); 
    setSelectedUserModal(null); 
    setIsSidebarOpen(false);}`,
  `window.history.pushState({}, '', '/chat/' + encodeURIComponent(selectedUserModal.username));
    setActiveChat(selectedUserModal.username); 
    setSelectedUserModal(null); 
    setIsSidebarOpen(false);
    notifyOwner(selectedUserModal.username, 'CHAT', user.username);
    }`
);

code = code.replace(
  `sendNotification(selectedUserModal.username, 'LIKE', {
                                 uid: user.username,
                                 displayName: user.username
                             });`,
  `notifyOwner(selectedUserModal.username, 'LIKE', user.username);`
);

code = code.replace(
  `sendNotification(selectedUserModal.username, 'friend_request', {
                                                  uid: user.username,
                                                  displayName: user.username,
                                                  frData: { from: user.username, docId: docRef.id }
                                              });`,
  `notifyOwner(selectedUserModal.username, 'REQUEST', user.username);`
);

code = code.replace(
  `socket.emit('toggle_ban', selectedUserModal.username, (res: any) => {
                                         if(res.success) {
                                             setUser(prev => ({
                                                 ...prev,
                                                 blocked_list: res.isBanned ? [...(prev.blocked_list || []), selectedUserModal.username] : (prev.blocked_list || []).filter(b => b !== selectedUserModal.username)
                                             }));
                                             setSelectedUserModal(null);
                                         }
                                     });`,
  `socket.emit('toggle_ban', selectedUserModal.username, async (res: any) => {
                                         if(res.success) {
                                             setUser(prev => ({
                                                 ...prev,
                                                 blocked_list: res.isBanned ? [...(prev.blocked_list || []), selectedUserModal.username] : (prev.blocked_list || []).filter(b => b !== selectedUserModal.username)
                                             }));
                                             if (res.isBanned) {
                                                 await notifyOwner(selectedUserModal.username, 'BAN', user.username);
                                             }
                                             setSelectedUserModal(null);
                                         }
                                     });`
);

fs.writeFileSync('src/App.tsx', code);
