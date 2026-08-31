const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch google_login
const oldGoogleLink = `            if (!snapEmail.empty) {
              userDocSnap = snapEmail.docs[0];
              username = userDocSnap.id;
              // Link googleUid
              await updateDoc(doc(fdb, "users", username), { googleUid });
            }`;

const newGoogleLink = `            if (!snapEmail.empty) {
              return callback({ success: false, error: "Ya tienes una cuenta vinculada a la app con este correo." });
            }`;

code = code.replace(oldGoogleLink, newGoogleLink);


// Patch register_or_login registration logic
const oldReg = `          } else {
            const newUid = Math.random()`;

const newReg = `          } else {
            if (!userSecurityEmail) {
                return callback({ success: false, error: "El correo electrónico es obligatorio para registrarse." });
            }
            const qEmail = query(collection(fdb, "users"), where("securityEmail", "==", userSecurityEmail));
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
                return callback({ success: false, error: "Ya tienes una cuenta vinculada a la app con este correo." });
            }
            const newUid = Math.random()`;

code = code.replace(oldReg, newReg);

fs.writeFileSync('server.ts', code);
