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

fs.writeFileSync('src/App.tsx', code);
