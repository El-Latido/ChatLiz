import React, { useState, useEffect } from 'react';
import { Bot, X, CheckCircle } from 'lucide-react';
import { socket } from '../socket';

interface AdminConfigLizModalProps {
  setAdminConfigLizOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiProfileForm: { profilePic: string; statusMessage: string; systemInstruction?: string; };
  setAiProfileForm: React.Dispatch<React.SetStateAction<{ profilePic: string; statusMessage: string; systemInstruction: string; }>>;
}

export function AdminConfigLizModal({ setAdminConfigLizOpen, aiProfileForm, setAiProfileForm }: AdminConfigLizModalProps) {
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
     if (successMsg) {
        const timer = setTimeout(() => {
           setSuccessMsg('');
           setAdminConfigLizOpen(false);
        }, 3000);
        return () => clearTimeout(timer);
     }
  }, [successMsg, setAdminConfigLizOpen]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
       <div className="bg-[#12141c] p-6 lg:p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-fuchsia-500/20 max-h-[90vh] overflow-y-auto scrollbar-thin">
         <button onClick={() => setAdminConfigLizOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={20} />
         </button>
         <h2 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2 mb-6">
            <Bot size={22} />
            Configurar HELIZABETH
         </h2>

         {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 font-medium">
               <CheckCircle size={20} />
               <p className="text-sm">{successMsg}</p>
            </div>
         )}

         <div className="space-y-4">
           <p className="text-sm text-gray-400 leading-relaxed mb-4">
             Como administrador (Axiss), puedes modificar el perfil de la IA.
           </p>
           
           <div className="flex flex-col items-center mb-6">
             <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                <div className="w-28 h-28 rounded-full border border-cyan-400/50 p-1 relative z-10 bg-[#0a0a16] shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center overflow-hidden [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                   {aiProfileForm.profilePic ? (
                      <img src={aiProfileForm.profilePic} alt="avatar" className="w-full h-full object-cover rounded-full" />
                   ) : (
                      <Bot size={40} className="text-cyan-400" />
                   )}
                   <input type="file" title="Subir foto de perfil IA" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', profilePic: reader.result as string});
                        reader.readAsDataURL(file);
                      }
                   }} />
                </div>
             </div>
             <span className="text-xs text-gray-500 mt-3 font-semibold uppercase tracking-wider">Haz clic para cambiar foto</span>
           </div>

           <div className="space-y-2">
             <label className="text-sm font-semibold text-gray-400">Estado / Información</label>
             <input 
                value={aiProfileForm.statusMessage || ''}
                onChange={e => setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', statusMessage: e.target.value})}
                maxLength={60}
                placeholder="Ej: IA Asistente virtual"
                type="text"
                className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none focus:border-fuchsia-500 transition-all text-white" 
             />
           </div>

           <div className="space-y-2">
             <label className="text-sm font-semibold text-gray-400">Instrucciones de Identidad (system_instruction)</label>
             <textarea 
                value={aiProfileForm.systemInstruction || ''}
                onChange={e => setAiProfileForm({...aiProfileForm, systemInstruction: e.target.value})}
                placeholder="Ej: A partir de ahora hablarás solo en rimas..."
                rows={4}
                className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none focus:border-fuchsia-500 transition-all text-white text-sm resize-none scrollbar-thin" 
             />
           </div>

           <button 
             onClick={() => {
               socket.emit('update_ai_config', { profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction }, (res: any) => {
                   if (res.success) {
                       setSuccessMsg('¡Perfil de ELIZABETH actualizado con éxito por el Administrador!');
                   } else {
                       alert("Error: " + res.error);
                   }
               });
             }}
             className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-3 rounded-xl font-bold transition-colors shadow-[0_4px_14px_rgba(217,70,239,0.3)]"
            >
              Guardar Perfil IA
            </button>
         </div>
       </div>
    </div>
  );
}
