import React, { useState } from 'react';
import { X, Cloud, Layout, Grid, Server } from 'lucide-react';
import { MainIsland } from './MainIsland';

interface CloudAdminPanelProps {
  onClose: () => void;
}

export function CloudAdminPanel({ onClose }: CloudAdminPanelProps) {
  const [activeApp, setActiveApp] = useState('llanura');

  const getSrcDoc = () => {
    if (activeApp === 'constructor') {
      return "<html><body style='background:#111;color:#fff;text-align:center;padding-top:50px;font-family:sans-serif;'><h2>Módulo Constructor Inactivo</h2><p>Entorno removido por limpieza.</p></body></html>";
    } else {
      return "<html><body style='background:#1e293b;color:#38bdf8;text-align:center;padding-top:50px;font-family:sans-serif;'><h2>Estado del Servidor: En Línea</h2></body></html>";
    }
  };

  return (
    <div className="fixed inset-0 z-[20000] flex bg-[#0b0f19] text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-[260px] bg-[#1e293b] border-r border-[#334155] p-5 flex flex-col gap-4 relative z-20">
        <div className="flex justify-between items-center border-b border-[#334155] pb-3">
          <h2 className="text-[#38bdf8] font-bold text-[1.1rem] m-0 leading-none">Panel de Administrador</h2>
        </div>
        
        <div className="flex flex-col gap-2.5 mt-2">
            <button 
                onClick={() => setActiveApp('constructor')} 
                className={`text-left px-[15px] py-[10px] rounded-[6px] border border-[#334155] text-[0.9rem] transition-colors flex items-center gap-2 ${activeApp === 'constructor' ? 'bg-[#334155]' : 'bg-[#0f172a] hover:bg-[#334155]'}`}
            >
                <Layout size={16} /> Constructor / Sims
            </button>
            <button 
                onClick={() => setActiveApp('llanura')} 
                className={`text-left px-[15px] py-[10px] rounded-[6px] border border-[#334155] text-[0.9rem] transition-colors flex items-center gap-2 ${activeApp === 'llanura' ? 'bg-[#334155]' : 'bg-[#0f172a] hover:bg-[#334155]'}`}
            >
                <Grid size={16} /> Isla Principal (Cloud)
            </button>
            <button 
                onClick={() => setActiveApp('servidor')} 
                className={`text-left px-[15px] py-[10px] rounded-[6px] border border-[#334155] text-[0.9rem] transition-colors flex items-center gap-2 ${activeApp === 'servidor' ? 'bg-[#334155]' : 'bg-[#0f172a] hover:bg-[#334155]'}`}
            >
                <Server size={16} /> Control de Servidor Cloud
            </button>
        </div>

        <div className="mt-auto pt-4 border-t border-[#334155]">
            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-md transition-colors font-bold text-sm">
                <X size={18} /> Cerrar Panel
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-0 left-0 right-0 z-10 bg-[#1e293b]/90 backdrop-blur-sm px-[25px] py-[15px] border-b border-[#334155] flex justify-between items-center pointer-events-none">
          <span className="font-medium flex items-center gap-2 text-slate-200">
             <Cloud size={20} className="text-[#38bdf8]" /> Zona Segura - Ejecución en Nube
          </span>
          <span className="bg-[#ef4444] text-white px-[8px] py-[4px] rounded-[4px] text-[0.75rem] font-bold tracking-wide pointer-events-auto shadow-sm">
             ADMINISTRADOR
          </span>
        </div>
        
        <div className="flex-1 relative w-full h-full bg-black">
            {activeApp === 'llanura' ? (
                <MainIsland />
            ) : (
                <iframe 
                  className="w-full h-full border-none"
                  srcDoc={getSrcDoc()}
                  title="Cloud Viewer"
                />
            )}
        </div>
      </div>
    </div>
  );
}
