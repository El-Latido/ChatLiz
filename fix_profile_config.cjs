const fs = require('fs');
let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const targetSaveProfile = `  const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      let finalPhotoURL = fotoURL;
      let finalBgURL = backgroundBase64;
      
      // Si el usuario seleccionó un nuevo archivo, súbelo a Firebase Storage usando el blob ya reducido (max 500kb approx por la compresión local)
      if (selectedFile && fotoURL.startsWith('data:image')) {
        const blob = await (await fetch(fotoURL)).blob();
        const storageRef = ref(storage, \`users/\${user.username}/profile.jpg\`);
        const uploadTask = uploadBytesResumable(storageRef, blob, { contentType: blob.type });

        finalPhotoURL = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            null,
            (error) => {
              if (error.code === 'storage/retry-limit-exceeded') {
                 reject(new Error("Error de conexión: Por favor, intenta con una imagen más pequeña o verifica tu red."));
              } else {
                 reject(error);
              }
            },
            async () => {
              resolve(await getDownloadURL(uploadTask.snapshot.ref));
            }
          );
        });
      }

      if (selectedBgFile && backgroundBase64.startsWith('data:image')) {
        const bgBlob = await (await fetch(backgroundBase64)).blob();
        const bgRef = ref(storage, \`users/\${user.username}/background.jpg\`);
        const bgUploadTask = uploadBytesResumable(bgRef, bgBlob, { contentType: bgBlob.type });

        finalBgURL = await new Promise((resolve, reject) => {
          bgUploadTask.on('state_changed',
            null,
            (error) => {
              if (error.code === 'storage/retry-limit-exceeded') {
                 reject(new Error("Error de conexión: Por favor, intenta con un fondo más ligero o verifica tu red."));
              } else {
                 reject(error);
              }
            },
            async () => {
              resolve(await getDownloadURL(bgUploadTask.snapshot.ref));
            }
          );
        });
      }

      const savePromise = setDoc(doc(db, "users", user.username!), {`;

const replaceSaveProfile = `  const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      let finalPhotoURL = fotoURL;
      let finalBgURL = backgroundBase64;
      
      const savePromise = setDoc(doc(db, "users", user.username!), {`;

file = file.replace(targetSaveProfile, replaceSaveProfile);
fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
