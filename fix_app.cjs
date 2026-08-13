const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  `        const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            setupListeners();
        } else {
            signInAnonymously(auth).catch((error) => {
               console.error("Error signing in anonymously to Firebase:", error);
            });
        }
    });`,
  `        const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            if (user.username) {
                setupListeners();
            }
        } else {
            signInAnonymously(auth).catch((error) => {
               console.error("Error signing in anonymously to Firebase:", error);
            });
        }
    });`
);

fs.writeFileSync('src/App.tsx', file);
