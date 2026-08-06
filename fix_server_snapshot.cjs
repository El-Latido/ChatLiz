const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `  if (fdb) {
    onSnapshot(collection(fdb, 'users'), (snapshot) => {
      let changed = false;
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified" || change.type === "added") {
          const data = change.doc.data();
          if (data.username === "Elizabeth") {
            aiUserTempCache = { ...aiUserTempCache, ...data };
            changed = true;
          } else if (activeUsers[data.username]) {
            activeUsers[data.username].profilePic = data.profilePic;
            activeUsers[data.username].statusMessage = data.statusMessage;
            activeUsers[data.username].role = data.role;
            // The type definition doesn't declare pais_idioma for activeUsers initially, but it accepts it
            (activeUsers[data.username] as any).pais_idioma = data.pais_idioma;
            changed = true;
          }
        }
      });
      if (changed) emitActiveUsers();
    }, (error) => {
      console.error("onSnapshot users error:", error);
    });
  }`;

const r1 = `  if (fdb) {
    let unsubUsers: any = null;
    const setupUsersListener = () => {
      if (unsubUsers) unsubUsers();
      unsubUsers = onSnapshot(collection(fdb, 'users'), (snapshot) => {
        let changed = false;
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified" || change.type === "added") {
            const data = change.doc.data();
            if (data.username === "Elizabeth") {
              aiUserTempCache = { ...aiUserTempCache, ...data };
              changed = true;
            } else if (activeUsers[data.username]) {
              activeUsers[data.username].profilePic = data.profilePic;
              activeUsers[data.username].statusMessage = data.statusMessage;
              activeUsers[data.username].role = data.role;
              // The type definition doesn't declare pais_idioma for activeUsers initially, but it accepts it
              (activeUsers[data.username] as any).pais_idioma = data.pais_idioma;
              changed = true;
            }
          }
        });
        if (changed) emitActiveUsers();
      }, (error) => {
        console.error("onSnapshot users error, reconnecting in 5s...", error);
        setTimeout(setupUsersListener, 5000);
      });
    };
    setupUsersListener();
  }`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced snapshot in server");
} else {
    console.log("Could not find snapshot block in server");
}
