const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Patch notifyOwner
code = code.replace(
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
};`,
  `export const notifyOwner = async (profileUid: string, actionType: string, visitorName: string) => {
  console.log("Intentando enviar notificación a:", profileUid);
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, "notifications"), {
      recipientUid: profileUid,
      senderName: visitorName,
      type: actionType,
      message: \`Has recibido un \${actionType} de \${visitorName}\`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    console.log("Notificación creada con ID:", docRef.id);
  } catch (error) {
    console.error("Error al escribir en Firestore:", error);
  }
};`
);

// Patch listener
code = code.replace(
  `        unsubNotif = onSnapshot(qNotif, (snapshot) => {`,
  `        unsubNotif = onSnapshot(qNotif, (snapshot) => {
            const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Notificaciones recibidas:", rawData);`
);

fs.writeFileSync('src/App.tsx', code);
