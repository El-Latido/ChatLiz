const fs = require('fs');
let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const oldFunc = file.substring(file.indexOf("const handleSaveProfile = async () => {"), file.indexOf("return (", file.indexOf("const handleSaveProfile = async () => {")) - 4);

const newFunc = `const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      const userRef = doc(db, "users", user.username); 
      
      // Implementamos una subida directa (Base64) con fallback
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

      socket.emit('broadcast_profile_change', { username: user.username, profilePic: fotoURL, statusMessage: comentario });

      setSaveStatus("Guardado correctamente");
      setTimeout(() => setSaveStatus(null), 3000);
      alert("¡Perfil actualizado con éxito!");
    } catch (error: any) {
      console.error(error);
      setSaveStatus("Error al guardar");
      setTimeout(() => setSaveStatus(null), 3000);
      alert("Hubo un error al guardar: " + error.message);
    } finally {
      // ESTO ES LO MÁS IMPORTANTE: quita el mensaje "Guardando..." pase lo que pase
      // En caso de que se haya quedado pegado.
      setSaveStatus(prev => prev === "Guardando..." ? null : prev);
    }
  };`;

file = file.replace(oldFunc, newFunc);
fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
