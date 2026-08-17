const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix notifyOwner to accept extraData and include senderUid / frData
code = code.replace(
  `export const notifyOwner = async (profileUid: string, actionType: string, visitorName: string) => {`,
  `export const notifyOwner = async (profileUid: string, actionType: string, visitorName: string, extraData?: any) => {`
);

code = code.replace(
  `recipientUid: profileUid,
      senderName: visitorName,
      type: actionType,`,
  `recipientUid: profileUid,
      senderUid: visitorName,
      senderName: visitorName,
      type: actionType,
      frData: extraData?.frData || null,`
);

// 2. Update REQUEST button to pass frData
code = code.replace(
  `notifyOwner(selectedUserModal.username, 'REQUEST', user.username);`,
  `notifyOwner(selectedUserModal.username, 'REQUEST', user.username, { frData: { from: user.username, docId: docRef.id } });`
);

// 3. Remove where("isRead", "==", false) from qNotif
code = code.replace(
  `        const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username),
            where("isRead", "==", false)
        );`,
  `        const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username)
        );`
);

// 4. Also replace the one call to sendNotification to use notifyOwner
code = code.replace(
  `sendNotification(activeChat, 'MESSAGE', { uid: user.username, displayName: user.username });`,
  `notifyOwner(activeChat, 'MESSAGE', user.username);`
);

fs.writeFileSync('src/App.tsx', code);
