import React, { useState } from 'react';
import { X, CheckCircle, Store } from 'lucide-react';
import ProfileFrame, { FRAMES } from './ProfileFrame';
import { socket } from '../socket';

interface StoreModalProps {
  onClose: () => void;
  user: any;
  setUser: (val: any) => void;
}

export default function StoreModal({ onClose, user, setUser }: StoreModalProps) {
  const [selectedFrame, setSelectedFrame] = useState<string | null>(user?.activeFrame || null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    socket.emit("update_frame", selectedFrame, (res: any) => {
      setIsSaving(false);
      if (res.success) {
        setUser((prev: any) => ({ ...prev, activeFrame: selectedFrame }));
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#1a1c29] to-[#0d0e15] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tienda de Marcos</h2>
              <p className="text-sm text-gray-400">Personaliza tu avatar con increíbles marcos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 scrollbar-thin">
          
          {/* Preview Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center gap-6">
            <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest text-center">Vista Previa</h3>
            <div className="relative w-40 h-40 mt-4">
              <img 
                src={user?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                alt="Preview" 
                className="w-full h-full rounded-full object-cover border-4 border-[#2a2d3d] shadow-2xl"
              />
              <ProfileFrame frameId={selectedFrame || undefined} />
            </div>
            
            <div className="w-full bg-black/30 rounded-2xl p-4 border border-white/5 text-center mt-2">
               <h4 className="font-bold text-white mb-1">{user?.username}</h4>
               <p className="text-xs text-gray-400">Así lucirá tu avatar en las salas de chat y en tu perfil.</p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100
                bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"
            >
              {isSaving ? "Guardando..." : "Equipar Marco"}
            </button>
            {selectedFrame && (
                <button 
                onClick={() => setSelectedFrame(null)}
                className="w-full py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10"
                >
                Quitar Marco
                </button>
            )}
          </div>

          {/* Grid Section */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FRAMES.map(frame => {
                const isSelected = selectedFrame === frame.id;
                return (
                  <div 
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`relative aspect-square rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group flex flex-col items-center justify-center p-4
                      ${isSelected ? 'border-cyan-400 bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/30'}`}
                  >
                    {/* Tiny avatar to demo the frame */}
                    <div className="relative w-16 h-16 mb-4">
                      <div className="w-full h-full rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${frame.id}`} className="w-full h-full opacity-50 blur-[2px]" />
                      </div>
                      <ProfileFrame frameId={frame.id} />
                    </div>
                    
                    <span className="text-sm font-bold text-white text-center leading-tight">{frame.name}</span>
                    <span className={`text-[10px] uppercase font-bold mt-2 px-2 py-0.5 rounded-full ${frame.category === 'Premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                       {frame.category}
                    </span>

                    {isSelected && (
                      <div className="absolute top-2 right-2 text-cyan-400 animate-in zoom-in">
                        <CheckCircle size={20} className="fill-cyan-400/20" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
