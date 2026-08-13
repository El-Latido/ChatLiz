const fs = require('fs');

let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const oldFunc = file.substring(file.indexOf("const handleSaveProfile = async () => {"), file.indexOf("return (") - 4);

const newFunc = `const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      const userRef = doc(db, "users", user.username); 
      await setDoc(userRef, {
        password: password,
        profilePic: fotoURL,
        statusMessage: comentario,
        pais_idioma: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: backgroundBase64
      }, { merge: true });

      setUser(prev => ({
        ...prev,
        password: password,
        profilePic: fotoURL,
        statusMessage: comentario,
        countryLanguage: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: backgroundBase64
      }));

      // A lightweight broadcast just to update active users in real-time
      socket.emit('broadcast_profile_change', { username: user.username, profilePic: fotoURL, statusMessage: comentario });

      setSaveStatus("Guardado correctamente");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus("Error al guardar");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };`;

file = file.replace(oldFunc, newFunc);
fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
