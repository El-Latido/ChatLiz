const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `    const unsubUser = onSnapshot(doc(db, "users", user.username), (docSnap) => {
        if (docSnap.exists()) {
            const updatedUser = docSnap.data() as UserObj;
            setUser(prev => ({ ...prev, ...updatedUser }));
            
            // También actualizamos nuestra info en usersOnline
            setUsersOnline(prevOnline => {
                const exists = prevOnline.find(u => u.username === user.username);
                if (exists) {
                    return prevOnline.map(u => u.username === user.username ? { ...u, ...updatedUser } : u);
                }
                return prevOnline;
            });
        }
    });

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "modified" || change.type === "added") {
                const updatedUser = change.doc.data() as UserObj;
                setUsersOnline(prevOnline => {
                    const exists = prevOnline.find(u => u.username === updatedUser.username);
                    if (exists) {
                        return prevOnline.map(u => u.username === updatedUser.username ? { ...u, ...updatedUser } : u);
                    }
                    return prevOnline;
                });
            }
        });
    });`;

const r1 = `    let unsubUser: any = null;
    let unsubscribe: any = null;
    
    const setupListeners = () => {
        if (unsubUser) unsubUser();
        if (unsubscribe) unsubscribe();
        
        unsubUser = onSnapshot(doc(db, "users", user.username!), (docSnap) => {
            if (docSnap.exists()) {
                const updatedUser = docSnap.data() as UserObj;
                setUser(prev => ({ ...prev, ...updatedUser }));
                
                setUsersOnline(prevOnline => {
                    const exists = prevOnline.find(u => u.username === user.username);
                    if (exists) {
                        return prevOnline.map(u => u.username === user.username ? { ...u, ...updatedUser } : u);
                    }
                    return prevOnline;
                });
            }
        }, (error) => {
            console.error("onSnapshot unsubUser error, retrying in 3s...", error);
            setTimeout(setupListeners, 3000);
        });

        unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified" || change.type === "added") {
                    const updatedUser = change.doc.data() as UserObj;
                    setUsersOnline(prevOnline => {
                        const exists = prevOnline.find(u => u.username === updatedUser.username);
                        if (exists) {
                            return prevOnline.map(u => u.username === updatedUser.username ? { ...u, ...updatedUser } : u);
                        }
                        return prevOnline;
                    });
                }
            });
        }, (error) => {
            console.error("onSnapshot unsubscribe error, retrying in 3s...", error);
            setTimeout(setupListeners, 3000);
        });
    };
    setupListeners();`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced snapshot in App");
} else {
    console.log("Could not find snapshot block in App");
}
