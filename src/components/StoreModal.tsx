import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { UserObj } from '../types';
import { socket } from '../socket';

interface StoreModalProps {
  onClose: () => void;
  user: UserObj;
  decorations: any[];
}

export function StoreModal({ onClose, user, decorations }: StoreModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = (dec: any) => {
    setLoading(true);
    setError('');
    socket.emit('buy_decoration', { decorationId: dec.id, price: dec.price }, (res: any) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Error al comprar.');
      }
    });
  };

  const handleEquip = (decId: string | null) => {
    setLoading(true);
    setError('');
    socket.emit('set_decoration', decId, (res: any) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Error al equipar/desequipar.');
      }
    });
  };

  const categories = [
    { type: 'basic', label: 'Básico (500)', color: 'from-blue-400 to-cyan-400' },
    { type: 'intermediate', label: 'Intermedio (1,200)', color: 'from-purple-400 to-pink-400' },
    { type: 'premium', label: 'Premium (2,500)', color: 'from-amber-400 to-orange-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f111a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-pink-400" />
              Tienda de Decoraciones
            </h2>
            <p className="text-pink-300 mt-1 font-medium">Tus Liz-Moneditas: <span className="text-white bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">{user.lizCoins || 0}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-10">
            {categories.map(cat => {
              const items = decorations.filter(d => d.type === cat.type);
              if (items.length === 0) return null;
              
              return (
                <div key={cat.type}>
                  <h3 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${cat.color} mb-4 inline-block`}>
                    {cat.label} Liz-Moneditas
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(dec => {
                      const isOwned = user.ownedDecorations?.includes(dec.id);
                      const isEquipped = user.activeDecoration === dec.id;
                      const canAfford = (user.lizCoins || 0) >= dec.price;

                      return (
                        <div key={dec.id} className={`relative flex flex-col items-center p-4 rounded-2xl border ${isEquipped ? 'border-pink-500 bg-pink-500/10' : isOwned ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/5'} transition-all hover:border-white/20`}>
                          <div className="w-16 h-16 mb-4 relative">
                            <img src={dec.url} alt="Decoration" className="w-full h-full object-contain filter drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                          </div>
                          
                          <div className="mt-auto w-full">
                            {isEquipped ? (
                              <button 
                                onClick={() => handleEquip(null)}
                                disabled={loading}
                                className="w-full py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 font-bold text-sm transition-colors border border-pink-500/30"
                              >
                                Desequipar
                              </button>
                            ) : isOwned ? (
                              <button 
                                onClick={() => handleEquip(dec.id)}
                                disabled={loading}
                                className="w-full py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold text-sm transition-colors border border-green-500/30"
                              >
                                Equipar
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBuy(dec)}
                                disabled={loading || !canAfford}
                                className={`w-full py-2 rounded-lg font-bold text-sm transition-colors border ${canAfford ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                              >
                                {dec.price} LM
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
