import React, { useState } from "react";
import { socket } from "../socket";
import { ArrowLeft, User, Lock, LogOut } from "lucide-react";

export default function Settings({ currentUser, onBack, onLogout }: { currentUser: string; onBack: () => void; onLogout: () => void }) {
  const [newUsername, setNewUsername] = useState(currentUser);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Debes ingresar una contraseña nueva o tu contraseña actual.");
      return;
    }

    socket.emit("update_profile", { oldUsername: currentUser, newUsername, newPassword }, (res: any) => {
      if (res.success) {
        setSuccess("Perfil actualizado con éxito.");
        setError("");
      } else {
        setError(res.error);
        setSuccess("");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-sans relative">
      <header className="h-[70px] bg-transparent border-b border-[#222] px-[30px] flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[#666] hover:text-white transition uppercase font-bold tracking-widest text-[#10px]">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:block">VOLVER</span>
        </button>
        <h1 className="font-black text-lg tracking-[1px] uppercase m-0">AJUSTES & PERFIL</h1>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition uppercase font-bold tracking-widest text-[#10px]">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">SALIR</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex justify-center items-center">
        <div className="w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-[30px] shadow-2xl relative">
          <div className="text-[14px] font-black mb-[20px] text-purple-500 tracking-[-0.5px] uppercase">CREDENCIALES DE ACCESO</div>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] text-[#888] font-bold tracking-wider uppercase mb-1.5">Nombre de usuario</div>
              <input 
                type="text" 
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                maxLength={20}
                className="w-full bg-[#000] border-none p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
              />
            </div>
            <div className="mb-2">
              <div className="text-[11px] text-[#888] font-bold tracking-wider uppercase mb-1.5 flex items-center gap-1.5">Nueva Contraseña</div>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#000] border-none p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            {success && <p className="text-emerald-500 text-xs font-bold">{success}</p>}

            <button type="submit" className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors uppercase text-xs tracking-wider">
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
