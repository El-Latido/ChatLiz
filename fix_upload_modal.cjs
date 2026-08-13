const fs = require('fs');
let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

file = file.replace(
  "import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';",
  "import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';"
);

const uploadCodeOld = `      // Si el usuario seleccionó un nuevo archivo, súbelo a Firebase Storage
      if (selectedFile) {
        const storageRef = ref(storage, \`users/\${user.username}/profile.jpg\`);
        await uploadBytes(storageRef, selectedFile);
        finalPhotoURL = await getDownloadURL(storageRef);
      }

      if (selectedBgFile) {
        const bgRef = ref(storage, \`users/\${user.username}/background.jpg\`);
        await uploadBytes(bgRef, selectedBgFile);
        finalBgURL = await getDownloadURL(bgRef);
      }`;

const uploadCodeNew = `      // Si el usuario seleccionó un nuevo archivo, súbelo a Firebase Storage usando el blob ya reducido (max 500kb approx por la compresión local)
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
      }`;

file = file.replace(uploadCodeOld, uploadCodeNew);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
