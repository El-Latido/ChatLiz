const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add sendNotification function
const sendNotifFn = `
export const sendNotification = async (recipientUid: string, type: string, senderData: any) => {
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db, "notifications"), {
      recipientUid: recipientUid,
      senderUid: senderData.uid,
      senderName: senderData.displayName || "Usuario",
      type: type,
      isRead: false,
      frData: senderData.frData || null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
  }
};
`;
file = file.replace("function MainApp() {", sendNotifFn + "\nfunction MainApp() {");

// 2. Add listener to setupListeners
const targetSetup = `    const setupListeners = () => {
        if (unsubUser) unsubUser();
        if (unsubscribe) unsubscribe();`;

const replacementSetup = `    let unsubNotif: any = null;
    const setupListeners = () => {
        if (unsubUser) unsubUser();
        if (unsubscribe) unsubscribe();
        if (unsubNotif) unsubNotif();
        
        const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username),
            where("isRead", "==", false)
        );
        unsubNotif = onSnapshot(qNotif, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                let text = data.text || '';
                if (!text) {
                    if (data.type === 'LIKE' || data.type === 'like') text = \`\${data.senderName} le ha dado Like a tu perfil.\`;
                    else if (data.type === 'REQUEST' || data.type === 'friend_request') text = \`\${data.senderName} te ha enviado una solicitud de amistad.\`;
                    else if (data.type === 'MESSAGE') text = \`Nuevo mensaje de \${data.senderName}.\`;
                    else text = \`Notificación de \${data.senderName}\`;
                }
                return { ...data, id: doc.id, text, read: data.isRead, type: data.type === 'LIKE' ? 'like' : (data.type === 'REQUEST' ? 'friend_request' : data.type) };
            });
            setNotifications(prev => {
                const localNotifs = prev.filter(p => !p.recipientUid); // Keep local socket notifications
                return [...msgs, ...localNotifs];
            });
        });`;

file = file.replace(targetSetup, replacementSetup);

// Ensure cleanup
file = file.replace("if (unsubUser) unsubUser();\n      authUnsubscribe();", "if (unsubUser) unsubUser();\n      if (typeof unsubNotif === 'function') unsubNotif();\n      authUnsubscribe();");

// 3. Update 'Dar Like' button
const targetLike = `                             import('firebase/firestore').then(({ addDoc, collection }) => {
                                 addDoc(collection(db, 'notifications'), { to: selectedUserModal.username, from: user.username, type: 'like', timestamp: Date.now(), createdAt: Date.now() });
                             });`;
const replaceLike = `                             sendNotification(selectedUserModal.username, 'LIKE', {
                                 uid: user.username,
                                 displayName: user.username
                             });`;
file = file.replace(targetLike, replaceLike);

// 4. Update 'Enviar Solicitud' button
const targetRequest = `                                     import('firebase/firestore').then(({ addDoc, collection }) => {
                                         addDoc(collection(db, 'friendRequests'), { from: user.username, to: selectedUserModal.username, status: 'pending', timestamp: Date.now(), createdAt: Date.now() });
                                     });`;
const replaceRequest = `                                     import('firebase/firestore').then(({ addDoc, collection }) => {
                                         addDoc(collection(db, 'friendRequests'), { from: user.username, to: selectedUserModal.username, status: 'pending', timestamp: Date.now(), createdAt: Date.now() }).then(docRef => {
                                              sendNotification(selectedUserModal.username, 'friend_request', {
                                                  uid: user.username,
                                                  displayName: user.username,
                                                  frData: { from: user.username, docId: docRef.id }
                                              });
                                         });
                                     });`;
file = file.replace(targetRequest, replaceRequest);

fs.writeFileSync('src/App.tsx', file);
