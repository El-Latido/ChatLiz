const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectRegex = /setupListeners\(\);\n\n    return \(\) => \{\n      socket\.off\('receive_global'\);\n      socket\.off\('receive_private'\);\n      socket\.off\('active_users'\);\n      unsubscribe\(\);\n      unsubUser\(\);\n    \};\n  \}, \[isLoggedIn, activeChat, user\.username\]\);/;

const newEffectRegex = `    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            setupListeners();
        } else {
            signInAnonymously(auth).catch((error) => {
               console.error("Error signing in anonymously to Firebase:", error);
            });
        }
    });

    return () => {
      socket.off('receive_global');
      socket.off('receive_private');
      socket.off('active_users');
      if (unsubscribe) unsubscribe();
      if (unsubUser) unsubUser();
      authUnsubscribe();
    };
  }, [isLoggedIn, activeChat, user.username]);`;

code = code.replace(effectRegex, newEffectRegex);
fs.writeFileSync('src/App.tsx', code);
