import React, { useState, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { UserObj } from '../types';
import { Layers, Cuboid, Image as ImageIcon, Box, Trees, Waves, ArrowLeft } from 'lucide-react';

interface Builder3DProps {
  user: UserObj;
  onClose?: () => void;
}

export interface PlacedItem {
  id: string;
  category: string;
  subType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

const CATEGORIES = [
  { id: 'Paredes', icon: <Cuboid size={20} />, items: ['Muro Básico', 'Muro Ladrillo'] },
  { id: 'Texturas', icon: <ImageIcon size={20} />, items: ['Madera', 'Piedra'] },
  { id: 'Techos', icon: <Box size={20} />, items: ['Plano', 'Inclinado'] },
  { id: 'Vegetación', icon: <Trees size={20} />, items: ['Árbol', 'Arbusto'] },
  { id: 'Piscinas', icon: <Waves size={20} />, items: ['Piscina Rectangular', 'Jacuzzi'] },
];

export function Builder3D({ user, onClose }: Builder3DProps) {
  // Validar si tiene acceso (solo usuario AXISS estrictamente)
  const hasAccess = user && user.username === 'Axiss';

  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(() => {
    const saved = localStorage.getItem('builder3d_items');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedSubType, setSelectedSubType] = useState(CATEGORIES[0].items[0]);
  const [buildMode, setBuildMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('builder3d_items', JSON.stringify(placedItems));
  }, [placedItems]);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#0a0f1c] fixed inset-0 z-[9999]">
        <div className="bg-[#121B2A] border border-red-500/50 rounded-2xl p-8 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso Denegado</h1>
          <p className="text-gray-300 mb-6">Esta sala es exclusiva para el administrador Axiss.</p>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/30"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const handlePlaneClick = (e: ThreeEvent<MouseEvent>) => {
    if (!buildMode) return;
    
    // Solo reaccionar cuando se hace clic directo en el plano base
    if (e.object.name !== 'basePlane') return;
    
    e.stopPropagation();
    const { point } = e;
    
    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(7),
      category: activeCategory,
      subType: selectedSubType,
      position: [point.x, point.y + 0.5, point.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff'
    };
    
    // Ajustar dimensiones según la pieza seleccionada
    if (activeCategory === 'Paredes') {
       newItem.scale = [2, 2, 0.2];
       newItem.position[1] = point.y + 1; // Centro en Y (mitad de la altura)
       newItem.color = selectedSubType.includes('Ladrillo') ? '#b2573d' : '#cccccc';
    } else if (activeCategory === 'Techos') {
       newItem.scale = [2.2, 0.2, 2.2];
       newItem.position[1] = point.y + 2.1;
       newItem.color = '#333333';
    } else if (activeCategory === 'Vegetación') {
       newItem.scale = [0.5, 2, 0.5];
       newItem.position[1] = point.y + 1;
       newItem.color = '#4ade80';
    } else if (activeCategory === 'Piscinas') {
       newItem.scale = [3, 0.1, 2];
       newItem.position[1] = point.y + 0.05;
       newItem.color = '#38bdf8';
    }

    setPlacedItems(prev => [...prev, newItem]);
  };

  const handleClear = () => {
    if (window.confirm('¿Seguro que quieres borrar toda la construcción?')) {
      setPlacedItems([]);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-[#05080e] fixed inset-0 z-[9999] flex font-sans">
      {/* UI Sidebar Menú */}
      <div className="w-72 bg-[#121B2A] border-r border-white/10 flex flex-col h-full z-10 shadow-2xl relative">
        <div className="p-5 border-b border-white/10">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al Chat
          </button>
          <h2 className="text-[#D4AF37] font-bold text-xl flex items-center gap-2">
            <Layers size={22} />
            Constructor 3D
          </h2>
          <p className="text-gray-400 text-sm mt-1">Lienzo en Tiempo Real</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-3">
            <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Modo de Interacción</label>
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
              <button 
                className={`flex-1 py-2 text-sm rounded-md transition-all ${buildMode ? 'bg-[#D4AF37] text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setBuildMode(true)}
              >
                Construir
              </button>
              <button 
                className={`flex-1 py-2 text-sm rounded-md transition-all ${!buildMode ? 'bg-[#D4AF37] text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setBuildMode(false)}
              >
                Cámara / Rotar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Categorías</label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="space-y-2">
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      activeCategory === cat.id 
                        ? 'bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                    }`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedSubType(cat.items[0]);
                    }}
                  >
                    {cat.icon}
                    <span className="font-medium text-sm">{cat.id}</span>
                  </button>
                  
                  {activeCategory === cat.id && (
                    <div className="pl-5 pr-2 space-y-1 mt-1 border-l-2 border-[#D4AF37]/20 ml-4">
                      {cat.items.map(item => (
                        <button
                          key={item}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                            selectedSubType === item
                              ? 'bg-[#D4AF37]/20 text-[#E8D9B0] font-medium'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                          }`}
                          onClick={() => setSelectedSubType(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-white/10 bg-black/20">
           <button 
             onClick={handleClear}
             className="w-full py-2.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-all border border-red-500/30"
           >
             Borrar Proyecto
           </button>
        </div>
      </div>

      {/* R3F Lienzo */}
      <div className="flex-1 relative cursor-crosshair">
        <Canvas shadows camera={{ position: [5, 8, 12], fov: 45 }}>
          {/* Entorno */}
          <color attach="background" args={['#87CEEB']} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <hemisphereLight groundColor="#2d2d2d" color="#ffffff" intensity={0.4} />

          {/* Renderizado de Piezas Colocadas */}
          {placedItems.map(item => (
             <mesh 
               key={item.id} 
               position={item.position} 
               rotation={item.rotation} 
               scale={item.scale} 
               castShadow 
               receiveShadow
             >
               {item.category === 'Vegetación' ? (
                 <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
               ) : (
                 <boxGeometry args={[1, 1, 1]} />
               )}
               <meshStandardMaterial color={item.color} />
             </mesh>
          ))}

          {/* Plano Base Interactivo */}
          <mesh 
            name="basePlane"
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            receiveShadow
            onClick={handlePlaneClick}
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#4d5c41" />
          </mesh>
          
          <Grid infiniteGrid fadeDistance={50} sectionColor="#000000" cellColor="#ffffff" sectionSize={5} cellSize={1} />

          {/* Controles de Cámara */}
          <OrbitControls 
             makeDefault 
             maxPolarAngle={Math.PI / 2 - 0.05} 
             minDistance={2} 
             maxDistance={60}
             enabled={!buildMode} 
          />
        </Canvas>
        
        {buildMode && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-2.5 rounded-full text-white text-sm font-medium border border-white/20 pointer-events-none shadow-lg">
            Modo Construcción Activo: Clic en el suelo para colocar <span className="text-[#D4AF37] font-bold">{selectedSubType}</span>
          </div>
        )}
      </div>
    </div>
  );
}
