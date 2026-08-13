import React, { useState } from 'react';
import { Settings, X, LogOut, Bot } from 'lucide-react';
import { socket } from '../socket';
import { UserObj } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

interface ProfileConfigModalProps {
  user: UserObj & { password?: string };
  setUser: React.Dispatch<React.SetStateAction<UserObj & { password?: string, securityEmail?: string }>>;
  setIsConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAdminConfigLizOpen: React.Dispatch<React.SetStateAction<boolean>>;
  usersOnline: UserObj[];
  setAiProfileForm: React.Dispatch<React.SetStateAction<{ profilePic: string; statusMessage: string; systemInstruction: string; }>>;
}

export function ProfileConfigModal({
  user, setUser, setIsConfigOpen, setAdminConfigLizOpen, usersOnline, setAiProfileForm
}: ProfileConfigModalProps) {
  // Local states as requested
  const [nombre, setNombre] = useState(user.username || '');
  const [comentario, setComentario] = useState(user.statusMessage || '');
  const [pais, setPais] = useState(user.countryLanguage || 'es');
  const [password, setPassword] = useState(user.password || '');
  const [fotoURL, setFotoURL] = useState(user.profilePic || '');
  const [isFriendsPublic, setIsFriendsPublic] = useState(user.is_friends_public || false);
  const [backgroundBase64, setBackgroundBase64] = useState(user.preferred_background || '');
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      let finalPhotoURL = fotoURL;
      let finalBgURL = backgroundBase64;
      
      // Si el usuario seleccionó un nuevo archivo, súbelo a Firebase Storage usando el blob ya reducido (max 500kb approx por la compresión local)
      if (selectedFile && fotoURL.startsWith('data:image')) {
        const blob = await (await fetch(fotoURL)).blob();
        const storageRef = ref(storage, `users/${user.username}/profile.jpg`);
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
        const bgRef = ref(storage, `users/${user.username}/background.jpg`);
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
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-[#12141c] text-[#ffffff] p-6 lg:p-8 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl relative border-t border-x sm:border-b border-[rgba(255,255,255,0.1)] max-h-[85vh] overflow-y-auto scrollbar-thin animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden"></div>
        <button onClick={() => setIsConfigOpen(false)} className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#ffffff] bg-[rgba(255,255,255,0.1)] hover:opacity-80 p-2 rounded-full transition-all">
           <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-[#ffffff] flex items-center gap-2 mb-6">
           <Settings size={22} className="text-[#D4AF37]" />
           Ajustes de Perfil
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden bg-[#1a1d27] relative">
               <img src={fotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-full h-full object-cover" />
               <input type="file" title="Subir foto de perfil" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_SIZE = 150; // Resize to max 150px for fast fallback to Base64 in Firestore (< 50KB)

                        if (width > height) {
                          if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                          }
                        } else {
                          if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                          }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                        setFotoURL(dataUrl);
                        setSelectedFile(file);
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
               }} />
            </div>
            <span className="text-xs text-gray-500 mt-2">Haz clic para cambiar foto</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#9ca3af]">Usuario</label>
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                 <span className="text-amber-500 font-bold text-xs">{user.lizCoins || 0}</span>
                 <span className="text-[10px] text-amber-500/70">Liz-Moneditas</span>
              </div>
            </div>
            <input 
               disabled
               value={nombre}
               className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none text-[#9ca3af] opacity-70 cursor-not-allowed" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#9ca3af]">Estado / Comentario</label>
            <input 
               value={comentario}
               onChange={e => setComentario(e.target.value)}
               maxLength={60}
               placeholder="Ej: Hola a todos!"
               type="text"
               className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none focus:border-[#D4AF37] transition-all text-[#ffffff]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#9ca3af]">Contraseña</label>
            <input 
               value={password}
               onChange={e => setPassword(e.target.value)}
               type="password"
               className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none focus:border-[#D4AF37] transition-all text-[#ffffff]" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#9ca3af]">País / Idioma</label>
            <div className="relative">
              <select
                 value={pais}
                 onChange={e => setPais(e.target.value)}
                 className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none focus:border-[#D4AF37] transition-all text-[#ffffff] appearance-none"
              >
                 <option value="es">Español</option>
                 <option value="en">English</option>
                 <option value="pt">Português</option>
                 <option value="fr">Français</option>
                 <option value="de">Deutsch</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
                 ▼
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.1)]">
             <label className="text-sm font-semibold text-[#9ca3af]">Mostrar mi lista de amigos públicamente</label>
             <button
               onClick={() => setIsFriendsPublic(!isFriendsPublic)}
               className={`w-12 h-6 rounded-full relative transition-colors ${isFriendsPublic ? 'bg-cyan-500' : 'bg-gray-600'}`}
             >
               <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isFriendsPublic ? 'translate-x-6' : ''}`} />
             </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#9ca3af]">Fondo del Chat</label>
            <div className="flex gap-2">
               <input 
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          const MAX_SIZE = 800; // Resize to max 800px to save space in Firestore

                          if (width > height) {
                            if (width > MAX_SIZE) {
                              height *= MAX_SIZE / width;
                              width = MAX_SIZE;
                            }
                          } else {
                            if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height;
                              height = MAX_SIZE;
                            }
                          }

                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                          setBackgroundBase64(dataUrl);
                          setSelectedBgFile(file);
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none focus:border-[#D4AF37] transition-all text-[#ffffff]" 
               />
               <button onClick={() => setBackgroundBase64('')} className="bg-[#0f111a] hover:opacity-80 px-4 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#9ca3af] text-xs">
                  Restaurar
               </button>
            </div>
            {backgroundBase64 && <img src={backgroundBase64} className="h-16 w-16 rounded-lg object-cover mt-2" alt="Background preview" />}
          </div>
          
          {user.username === 'Axiss' && (
             <button onClick={() => { 
                const aiUser = usersOnline.find(u => u.username === 'Elizabeth');
                setAiProfileForm({ profilePic: aiUser?.profilePic || '', statusMessage: aiUser?.statusMessage || 'IA Asistente virtual', systemInstruction: aiUser?.systemInstruction || '' });
                setIsConfigOpen(false); 
                setAdminConfigLizOpen(true); 
             }} className="w-full flex items-center justify-center gap-2 text-fuchsia-400 border border-fuchsia-400 bg-fuchsia-500/10 p-3 rounded-xl font-bold mt-2 hover:bg-fuchsia-500/20 transition-all">
                <Bot size={18} /> Configurar a HELIZABETH
             </button>
          )}

          {saveStatus && <div className="text-center text-sm font-bold text-[#D4AF37] mt-2">{saveStatus}</div>}

          <button 
            onClick={handleSaveProfile}
            className="w-full mt-4 bg-[#D4AF37] hover:opacity-80 text-white p-3 rounded-xl font-bold transition-all shadow-lg"
           >
             Guardar Cambios
           </button>
         </div>
         
         <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 text-red-400 bg-red-400/10 hover:bg-red-400/20 p-3 rounded-xl font-medium transition-colors border border-red-400/20"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
         </div>
       </div>
     </div>
  );
}
