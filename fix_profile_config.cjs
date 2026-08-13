const fs = require('fs');
let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

if (!file.includes("firebase/storage")) {
  file = file.replace("import { db } from '../firebaseConfig';", "import { db, storage } from '../firebaseConfig';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';");
}

const addState = `  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);`;
file = file.replace("  const [saveStatus, setSaveStatus] = useState<string | null>(null);", addState);

const addStateBg = `  const [backgroundBase64, setBackgroundBase64] = useState(user.preferred_background || '');
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);`;
file = file.replace("  const [backgroundBase64, setBackgroundBase64] = useState(user.preferred_background || '');", addStateBg);


const oldFunc = file.substring(file.indexOf("const handleSaveProfile = async () => {"), file.indexOf("return (", file.indexOf("const handleSaveProfile = async () => {")) - 4);

const newFunc = `const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      let finalPhotoURL = fotoURL;
      let finalBgURL = backgroundBase64;
      
      // Si el usuario seleccionó un nuevo archivo, súbelo a Firebase Storage
      if (selectedFile) {
        const storageRef = ref(storage, \`users/\${user.username}/profile.jpg\`);
        await uploadBytes(storageRef, selectedFile);
        finalPhotoURL = await getDownloadURL(storageRef);
      }

      if (selectedBgFile) {
        const bgRef = ref(storage, \`users/\${user.username}/background.jpg\`);
        await uploadBytes(bgRef, selectedBgFile);
        finalBgURL = await getDownloadURL(bgRef);
      }

      const userRef = doc(db, "users", user.username); 
      
      const savePromise = setDoc(userRef, {
        password: password,
        profilePic: finalPhotoURL,
        statusMessage: comentario,
        pais_idioma: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: finalBgURL,
        updatedAt: new Date()
      }, { merge: true });

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout al contactar con el servidor")), 10000));
      
      await Promise.race([savePromise, timeoutPromise]);

      setUser(prev => ({
        ...prev,
        password: password,
        profilePic: finalPhotoURL,
        statusMessage: comentario,
        countryLanguage: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: finalBgURL
      }));

      socket.emit('broadcast_profile_change', { username: user.username, profilePic: finalPhotoURL, statusMessage: comentario });

      setSaveStatus("Guardado correctamente");
      setTimeout(() => setSaveStatus(null), 3000);
      alert("¡Perfil guardado correctamente!");
    } catch (error: any) {
      console.error("Error detallado al guardar en Firebase:", error);
      setSaveStatus("Error al guardar");
      setTimeout(() => setSaveStatus(null), 3000);
      alert("No se pudo guardar: " + error.message);
    } finally {
      // OBLIGATORIO: Apaga el "Guardando..." pase lo que pase
      setSaveStatus(prev => prev === "Guardando..." ? null : prev);
    }
  };`;

file = file.replace(oldFunc, newFunc);

file = file.replace("setFotoURL(dataUrl);", "setFotoURL(dataUrl);\n                        setSelectedFile(file);");
file = file.replace("setBackgroundBase64(dataUrl);", "setBackgroundBase64(dataUrl);\n                          setSelectedBgFile(file);");

fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
