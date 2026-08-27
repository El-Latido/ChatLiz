import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { UserObj } from '../types';
import { 
  Hammer, ShoppingBag, UserRound, Play, 
  PaintRoller, Waves, Square, Move, 
  Trash2, RotateCw, Check, X, Palette,
  Armchair, Bed, Utensils, TreePine
} from 'lucide-react';
import * as THREE from 'three';

interface Builder3DProps {
  user: UserObj;
  onClose?: () => void;
}

type AppMode = 'BUILD' | 'BUY' | 'CAS' | 'LIVE';
type BuildCategory = 'WALLS' | 'FLOORS' | 'POOLS' | 'FENCES' | 'FOUNDATIONS' | 'ROOFS';
type BuyCategory = 'SEATING' | 'SURFACES' | 'BEDS' | 'DECOR' | 'OUTDOOR';

interface PlacedObject {
  id: string;
  type: 'BUILD' | 'BUY';
  category: string;
  subType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

// SIMS STYLE BUILDER
export function Builder3D({ user, onClose }: Builder3DProps) {
  const [mode, setMode] = useState<AppMode>('BUILD');
  
  // Build/Buy State
  const [buildCategory, setBuildCategory] = useState<BuildCategory>('WALLS');
  const [buyCategory, setBuyCategory] = useState<BuyCategory>('SEATING');
  const [placedItems, setPlacedItems] = useState<PlacedObject[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Placement State
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementPos, setPlacementPos] = useState<[number, number, number]>([0, 0, 0]);
  const [placementRot, setPlacementRot] = useState<number>(0);
  const [dragStart, setDragStart] = useState<[number, number, number] | null>(null);
  const [dragEnd, setDragEnd] = useState<[number, number, number] | null>(null);

  // CAS State
  const [simConfig, setSimConfig] = useState({
    skinColor: '#e0ac69',
    hairColor: '#3b2818',
    hairStyle: 'short',
    topColor: '#ff4040',
    bottomColor: '#2b5299',
    shoesColor: '#222222'
  });

  // Helper to round to grid (0.5 units)
  const snapToGrid = (val: number) => Math.round(val * 2) / 2;

  const handleTerrainPointerMove = (e: any) => {
    if (mode === 'CAS') return;
    e.stopPropagation();
    const { x, z } = e.point;
    const snapped: [number, number, number] = [snapToGrid(x), 0, snapToGrid(z)];
    setPlacementPos(snapped);

    if (isPlacing && dragStart) {
       setDragEnd(snapped);
    }
  };

  const handleTerrainPointerDown = (e: any) => {
    if (mode === 'CAS') return;
    e.stopPropagation();
    const { x, z } = e.point;
    const snapped: [number, number, number] = [snapToGrid(x), 0, snapToGrid(z)];
    
    if (mode === 'BUILD') {
      setIsPlacing(true);
      setDragStart(snapped);
      setDragEnd(snapped);
    } else if (mode === 'BUY') {
      // Place furniture instantly
      const newItem: PlacedObject = {
        id: Math.random().toString(36).substring(7),
        type: 'BUY',
        category: buyCategory,
        subType: 'default',
        position: snapped,
        rotation: [0, placementRot, 0],
        scale: [1, 1, 1],
        color: '#ffffff'
      };
      setPlacedItems(prev => [...prev, newItem]);
    }
  };

  const handleTerrainPointerUp = (e: any) => {
    if (mode === 'BUILD' && isPlacing && dragStart && dragEnd) {
      // Finalize Build shape (Wall line, Pool rect, Floor rect)
      const newItem: PlacedObject = {
        id: Math.random().toString(36).substring(7),
        type: 'BUILD',
        category: buildCategory,
        subType: 'default',
        position: dragStart, // Store start, we will compute center in render
        rotation: [0, 0, 0], // Store dragEnd in scale/rotation logically
        scale: dragEnd, // Using scale to store the end point for simplicity in this demo
        color: buildCategory === 'POOLS' ? '#40E0D0' : (buildCategory === 'WALLS' ? '#e5e5e5' : '#8B4513')
      };
      setPlacedItems(prev => [...prev, newItem]);
    }
    setIsPlacing(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Rendering dynamic build preview
  const renderBuildPreview = () => {
    if (!isPlacing || !dragStart || !dragEnd || mode !== 'BUILD') return null;

    const dx = dragEnd[0] - dragStart[0];
    const dz = dragEnd[2] - dragStart[2];
    const cx = dragStart[0] + dx / 2;
    const cz = dragStart[2] + dz / 2;
    const length = Math.sqrt(dx*dx + dz*dz);
    const angle = Math.atan2(dx, dz);

    if (buildCategory === 'WALLS' || buildCategory === 'FENCES') {
       const height = buildCategory === 'WALLS' ? 3 : 1;
       const width = buildCategory === 'WALLS' ? 0.2 : 0.1;
       return (
         <mesh position={[cx, height/2, cz]} rotation={[0, angle, 0]}>
           <boxGeometry args={[width, height, length]} />
           <meshStandardMaterial color="#88aaff" transparent opacity={0.6} />
         </mesh>
       );
    } else if (buildCategory === 'POOLS' || buildCategory === 'FLOORS' || buildCategory === 'FOUNDATIONS') {
       const w = Math.abs(dx) || 1;
       const d = Math.abs(dz) || 1;
       const cy = buildCategory === 'FOUNDATIONS' ? 0.5 : (buildCategory === 'POOLS' ? -0.4 : 0.01);
       const height = buildCategory === 'FOUNDATIONS' ? 1 : (buildCategory === 'POOLS' ? 0.8 : 0.05);
       return (
         <mesh position={[cx, cy, cz]}>
           <boxGeometry args={[w, height, d]} />
           <meshStandardMaterial color={buildCategory === 'POOLS' ? "#40E0D0" : "#88aaff"} transparent opacity={0.6} />
         </mesh>
       );
    }
  };

  const renderBuyPreview = () => {
    if (mode !== 'BUY' || isPlacing) return null;
    return (
      <mesh position={placementPos} rotation={[0, placementRot, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#88aaff" transparent opacity={0.6} wireframe />
      </mesh>
    );
  };

  const renderPlacedItem = (item: PlacedObject) => {
    const isSelected = selectedItemId === item.id;
    const matColor = isSelected ? '#ffeb3b' : item.color;

    if (item.type === 'BUILD') {
      const start = item.position;
      const end = item.scale; // Reusing scale array for end pos
      const dx = end[0] - start[0];
      const dz = end[2] - start[2];
      const cx = start[0] + dx / 2;
      const cz = start[2] + dz / 2;
      
      if (item.category === 'WALLS' || item.category === 'FENCES') {
        const length = Math.sqrt(dx*dx + dz*dz) || 1;
        const angle = Math.atan2(dx, dz);
        const height = item.category === 'WALLS' ? 3 : 1;
        const width = item.category === 'WALLS' ? 0.2 : 0.1;
        return (
          <mesh key={item.id} position={[cx, height/2, cz]} rotation={[0, angle, 0]} onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color={matColor} roughness={0.8} />
          </mesh>
        );
      } else {
        const w = Math.abs(dx) || 1;
        const d = Math.abs(dz) || 1;
        const cy = item.category === 'FOUNDATIONS' ? 0.5 : (item.category === 'POOLS' ? -0.4 : 0.01);
        const height = item.category === 'FOUNDATIONS' ? 1 : (item.category === 'POOLS' ? 0.8 : 0.05);
        
        // Pools render slightly below ground, others above
        return (
          <mesh key={item.id} position={[cx, cy, cz]} onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}>
            <boxGeometry args={[w, height, d]} />
            <meshStandardMaterial color={matColor} roughness={0.8} />
          </mesh>
        );
      }
    } else if (item.type === 'BUY') {
       // Placeholder for furniture
       return (
         <mesh key={item.id} position={item.position} rotation={item.rotation} onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}>
           <boxGeometry args={[1, 1, 1]} />
           <meshStandardMaterial color={matColor} roughness={0.5} />
         </mesh>
       );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#87CEEB] overflow-hidden font-sans">
      
      {/* TOP BAR */}
      <div className="h-14 bg-white/90 backdrop-blur shadow-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">Constructor de Casas y Sims</h1>
          
          <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
            <button onClick={() => setMode('BUILD')} className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${mode === 'BUILD' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}>
              <Hammer size={16} /> Construir
            </button>
            <button onClick={() => setMode('BUY')} className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${mode === 'BUY' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}>
              <ShoppingBag size={16} /> Comprar
            </button>
            <button onClick={() => setMode('CAS')} className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${mode === 'CAS' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}>
              <UserRound size={16} /> Crear Sim
            </button>
            <button onClick={() => setMode('LIVE')} className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${mode === 'LIVE' ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}>
              <Play size={16} /> Vivir
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-105">
          <X size={20} />
        </button>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: mode === 'CAS' ? [0, 1.5, 4] : [0, 15, 20], fov: 50 }}>
          <color attach="background" args={['#87CEEB']} />
          <fogExp2 attach="fog" args={['#87CEEB', 0.003]} />
          
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[50, 100, 50]} intensity={1.2} color="#fff5e1" castShadow 
            shadow-mapSize={[2048, 2048]} 
          />

          {mode !== 'CAS' && (
            <>
              <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.01} minDistance={2} maxDistance={200} />
              <Grid infiniteGrid fadeDistance={100} sectionColor="#000000" cellColor="#ffffff" sectionSize={5} cellSize={1} position={[0, 0.01, 0]} />
              
              {/* TERRAIN */}
              <mesh 
                rotation={[-Math.PI/2, 0, 0]} 
                receiveShadow 
                onPointerMove={handleTerrainPointerMove}
                onPointerDown={handleTerrainPointerDown}
                onPointerUp={handleTerrainPointerUp}
              >
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#4c9a2a" roughness={0.9} />
              </mesh>

              {/* PLACED ITEMS */}
              {placedItems.map(renderPlacedItem)}
              {renderBuildPreview()}
              {renderBuyPreview()}
            </>
          )}

          {mode === 'CAS' && (
            <>
              <OrbitControls makeDefault minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/1.5} minDistance={2} maxDistance={6} target={[0, 1, 0]} />
              
              {/* CHARACTER MODEL (No Plumbob) */}
              <group position={[0, 0, 0]}>
                {/* Head */}
                <mesh position={[0, 1.7, 0]} castShadow>
                  <sphereGeometry args={[0.15, 32, 32]} />
                  <meshStandardMaterial color={simConfig.skinColor} roughness={0.4} />
                </mesh>
                {/* Hair */}
                <mesh position={[0, 1.78, 0]} castShadow>
                  <sphereGeometry args={[0.16, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
                  <meshStandardMaterial color={simConfig.hairColor} roughness={0.7} />
                </mesh>
                {/* Torso */}
                <mesh position={[0, 1.25, 0]} castShadow>
                  <boxGeometry args={[0.4, 0.6, 0.2]} />
                  <meshStandardMaterial color={simConfig.topColor} roughness={0.8} />
                </mesh>
                {/* Legs */}
                <mesh position={[-0.1, 0.6, 0]} castShadow>
                  <boxGeometry args={[0.15, 0.7, 0.15]} />
                  <meshStandardMaterial color={simConfig.bottomColor} roughness={0.9} />
                </mesh>
                <mesh position={[0.1, 0.6, 0]} castShadow>
                  <boxGeometry args={[0.15, 0.7, 0.15]} />
                  <meshStandardMaterial color={simConfig.bottomColor} roughness={0.9} />
                </mesh>
                {/* Arms */}
                <mesh position={[-0.28, 1.25, 0]} castShadow>
                  <boxGeometry args={[0.12, 0.6, 0.12]} />
                  <meshStandardMaterial color={simConfig.skinColor} roughness={0.4} />
                </mesh>
                <mesh position={[0.28, 1.25, 0]} castShadow>
                  <boxGeometry args={[0.12, 0.6, 0.12]} />
                  <meshStandardMaterial color={simConfig.skinColor} roughness={0.4} />
                </mesh>
                {/* Shoes */}
                <mesh position={[-0.1, 0.1, 0.05]} castShadow>
                  <boxGeometry args={[0.16, 0.2, 0.25]} />
                  <meshStandardMaterial color={simConfig.shoesColor} roughness={0.6} />
                </mesh>
                <mesh position={[0.1, 0.1, 0.05]} castShadow>
                  <boxGeometry args={[0.16, 0.2, 0.25]} />
                  <meshStandardMaterial color={simConfig.shoesColor} roughness={0.6} />
                </mesh>

                {/* Pedestal */}
                <mesh position={[0, -0.05, 0]} receiveShadow>
                  <cylinderGeometry args={[1, 1, 0.1, 32]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
                </mesh>
              </group>
            </>
          )}

        </Canvas>

        {/* HUD OVERLAYS */}
        
        {/* CAS PANEL */}
        {mode === 'CAS' && (
          <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur shadow-2xl rounded-xl p-5 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserRound size={20} className="text-purple-600" /> Crear Sim
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Tono de Piel</label>
                <div className="flex gap-2 mt-1">
                  {['#f9d9bd', '#e0ac69', '#8d5524', '#3d2314'].map(color => (
                    <button key={color} onClick={() => setSimConfig({...simConfig, skinColor: color})} className={`w-8 h-8 rounded-full shadow-sm border-2 ${simConfig.skinColor === color ? 'border-purple-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Color de Pelo</label>
                <div className="flex gap-2 mt-1">
                  {['#f0c75e', '#a55b33', '#3b2818', '#111111', '#e84855'].map(color => (
                    <button key={color} onClick={() => setSimConfig({...simConfig, hairColor: color})} className={`w-8 h-8 rounded-full shadow-sm border-2 ${simConfig.hairColor === color ? 'border-purple-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Ropa Superior</label>
                <div className="flex gap-2 mt-1">
                  {['#ffffff', '#ff4040', '#40ff80', '#4080ff', '#222222'].map(color => (
                    <button key={color} onClick={() => setSimConfig({...simConfig, topColor: color})} className={`w-8 h-8 rounded-full shadow-sm border-2 ${simConfig.topColor === color ? 'border-purple-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Ropa Inferior</label>
                <div className="flex gap-2 mt-1">
                  {['#a4c2f4', '#2b5299', '#333333', '#8f8f8f'].map(color => (
                    <button key={color} onClick={() => setSimConfig({...simConfig, bottomColor: color})} className={`w-8 h-8 rounded-full shadow-sm border-2 ${simConfig.bottomColor === color ? 'border-purple-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                  <Check size={18} /> Confirmar Diseño
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUILD PANEL */}
        {mode === 'BUILD' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-slate-200 flex items-center gap-8">
            <div className="flex gap-2">
              {[
                { id: 'WALLS', icon: <Square size={24} />, label: 'Paredes' },
                { id: 'FLOORS', icon: <PaintRoller size={24} />, label: 'Suelos' },
                { id: 'POOLS', icon: <Waves size={24} />, label: 'Piscinas' },
                { id: 'FENCES', icon: <Square size={24} className="stroke-[3]" />, label: 'Vallas' },
                { id: 'FOUNDATIONS', icon: <Square size={24} className="opacity-50" />, label: 'Cimientos' },
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setBuildCategory(cat.id as BuildCategory)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all min-w-[80px] ${buildCategory === cat.id ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {cat.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-12 bg-slate-200" />

            {selectedItemId && (
              <button 
                onClick={() => {
                  setPlacedItems(prev => prev.filter(i => i.id !== selectedItemId));
                  setSelectedItemId(null);
                }} 
                className="flex flex-col items-center gap-1 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Borrar</span>
              </button>
            )}
            
            <div className="text-xs text-slate-400 max-w-[150px] font-medium leading-tight">
              Arrastra en el terreno para dibujar {buildCategory.toLowerCase()}.
            </div>
          </div>
        )}

        {/* BUY PANEL */}
        {mode === 'BUY' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-slate-200 flex items-center gap-8">
            <div className="flex gap-2">
              {[
                { id: 'SEATING', icon: <Armchair size={24} />, label: 'Asientos' },
                { id: 'SURFACES', icon: <Utensils size={24} />, label: 'Superficies' },
                { id: 'BEDS', icon: <Bed size={24} />, label: 'Camas' },
                { id: 'DECOR', icon: <Palette size={24} />, label: 'Decoración' },
                { id: 'OUTDOOR', icon: <TreePine size={24} />, label: 'Exterior' },
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setBuyCategory(cat.id as BuyCategory)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all min-w-[80px] ${buyCategory === cat.id ? 'bg-green-100 text-green-700 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {cat.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-12 bg-slate-200" />
            
            <div className="flex flex-col gap-2">
              <button onClick={() => setPlacementRot(r => r + Math.PI/2)} className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-bold">
                <RotateCw size={14} /> Rotar Objeto
              </button>
              {selectedItemId && (
                <button onClick={() => { setPlacedItems(prev => prev.filter(i => i.id !== selectedItemId)); setSelectedItemId(null); }} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold">
                  <Trash2 size={14} /> Vender Objeto
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
