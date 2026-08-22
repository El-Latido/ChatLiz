const fs = require('fs');

const content = `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Outlines, useTexture, useGLTF } from '@react-three/drei';
import { UserObj } from '../types';
import { Layers, Cuboid, Image as ImageIcon, Box, Trees, Waves, ArrowLeft, MousePointer2, Eraser, Move, Mountain } from 'lucide-react';
import * as THREE from 'three';

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
  { id: 'Texturas', icon: <ImageIcon size={20} />, items: ['Piso Madera', 'Piso Piedra'] },
  { id: 'Techos', icon: <Box size={20} />, items: ['Plano', 'Inclinado'] },
  { id: 'Vegetación', icon: <Trees size={20} />, items: ['Árbol', 'Arbusto'] },
  { id: 'Piscinas', icon: <Waves size={20} />, items: ['Piscina Rectangular', 'Jacuzzi'] },
];

type ToolMode = 'CONSTRUIR' | 'MOVER' | 'BORRAR' | 'TERRENO' | 'CAMARA';

// Componente para generar texturas de forma procesal y confiable
const createDataTexture = (type: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    if (type === 'ladrillo') {
        ctx.fillStyle = '#b2573d';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#8a402a';
        for(let i=0; i<10; i++){
            for(let j=0; j<10; j++){
                ctx.fillRect(i*32 + (j%2)*16, j*32, 28, 12);
            }
        }
    } else if (type === 'madera') {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#7a4a20';
        for(let i=0; i<20; i++){
            ctx.beginPath();
            ctx.moveTo(0, i*15 + Math.random()*5);
            ctx.lineTo(256, i*15 + Math.random()*5);
            ctx.stroke();
        }
    } else if (type === 'piedra') {
        ctx.fillStyle = '#888888';
        ctx.fillRect(0,0,256,256);
        for(let i=0; i<100; i++){
            ctx.fillStyle = Math.random() > 0.5 ? '#777777' : '#999999';
            ctx.beginPath();
            ctx.arc(Math.random()*256, Math.random()*256, Math.random()*10+5, 0, Math.PI*2);
            ctx.fill();
        }
    } else if (type === 'agua') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#7dd3fc';
        for(let i=0; i<30; i++){
            ctx.fillRect(Math.random()*256, Math.random()*256, 30, 5);
        }
    } else if (type === 'pasto') {
        ctx.fillStyle = '#4d5c41';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#3b4731';
        for(let i=0; i<500; i++){
            ctx.fillRect(Math.random()*256, Math.random()*256, 2, 8);
        }
    }
    
    return canvas.toDataURL();
};

const textures = {
    ladrillo: createDataTexture('ladrillo'),
    madera: createDataTexture('madera'),
    piedra: createDataTexture('piedra'),
    agua: createDataTexture('agua'),
    pasto: createDataTexture('pasto')
};

function PlacedObject({ 
    item, 
    isSelected, 
    onSelect, 
    onPointerDown, 
    onPointerUp 
}: { 
    item: PlacedItem, 
    isSelected: boolean,
    onSelect: (id: string, e: ThreeEvent<MouseEvent>) => void,
    onPointerDown: (id: string, e: ThreeEvent<PointerEvent>) => void,
    onPointerUp: (id: string, e: ThreeEvent<PointerEvent>) => void,
}) {
    // Usar texturas procesales si corresponden
    const texMap = useMemo(() => {
        let url = null;
        if (item.subType.includes('Ladrillo')) url = textures.ladrillo;
        else if (item.subType.includes('Madera')) url = textures.madera;
        else if (item.subType.includes('Piedra')) url = textures.piedra;
        else if (item.category === 'Piscinas') url = textures.agua;
        
        if (url) {
            const img = new Image();
            img.src = url;
            const tex = new THREE.Texture(img);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(item.scale[0]/2, item.scale[1]/2);
            img.onload = () => tex.needsUpdate = true;
            return tex;
        }
        return null;
    }, [item.subType, item.scale]);

    return (
        <mesh 
            position={item.position} 
            rotation={item.rotation} 
            scale={item.scale} 
            castShadow 
            receiveShadow
            onClick={(e) => onSelect(item.id, e)}
            onPointerDown={(e) => onPointerDown(item.id, e)}
            onPointerUp={(e) => onPointerUp(item.id, e)}
        >
            {item.category === 'Vegetación' ? (
                item.subType === 'Árbol' ? (
                   <group position={[0, -0.5, 0]}>
                       <mesh position={[0, 0.5, 0]}>
                           <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
                           <meshStandardMaterial color="#5c4033" />
                       </mesh>
                       <mesh position={[0, 1.5, 0]}>
                           <dodecahedronGeometry args={[1, 1]} />
                           <meshStandardMaterial color="#2d5a27" />
                       </mesh>
                   </group>
                ) : (
                    <dodecahedronGeometry args={[0.8, 1]} />
                )
            ) : item.category === 'Techos' && item.subType === 'Inclinado' ? (
                <coneGeometry args={[1, 1, 4]} />
            ) : (
                <boxGeometry args={[1, 1, 1]} />
            )}
            
            <meshStandardMaterial 
                color={item.color} 
                map={texMap} 
                transparent={item.category === 'Piscinas'} 
                opacity={item.category === 'Piscinas' ? 0.8 : 1}
                roughness={item.category === 'Piscinas' ? 0.1 : 0.8}
            />
            
            {isSelected && <Outlines thickness={0.05} color="#D4AF37" />}
        </mesh>
    );
}

function Terrain({ toolMode, heights, setHeights, onPlaneClick, setPlacedItems, activeCategory, selectedSubType }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const isDragging = useRef(false);
    
    // Textura para el pasto
    const grassTex = useMemo(() => {
        const img = new Image();
        img.src = textures.pasto;
        const tex = new THREE.Texture(img);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(20, 20);
        img.onload = () => tex.needsUpdate = true;
        return tex;
    }, []);

    // Actualizar geometría con las alturas guardadas
    useEffect(() => {
        if (meshRef.current && heights.length > 0) {
            const geo = meshRef.current.geometry;
            const positions = geo.attributes.position.array as Float32Array;
            for (let i = 0; i < heights.length; i++) {
                positions[i * 3 + 2] = heights[i]; // +2 porque el plano se rota
            }
            geo.computeVertexNormals();
            geo.attributes.position.needsUpdate = true;
        }
    }, [heights]);

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (toolMode === 'TERRENO') {
            e.stopPropagation();
            isDragging.current = true;
            modifyTerrain(e);
        }
    };

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (toolMode === 'TERRENO' && isDragging.current) {
            e.stopPropagation();
            modifyTerrain(e);
        }
    };

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (toolMode === 'TERRENO' && isDragging.current) {
            e.stopPropagation();
            isDragging.current = false;
            // Guardar en state para que persista
            if (meshRef.current) {
                const geo = meshRef.current.geometry;
                const positions = geo.attributes.position.array as Float32Array;
                const newHeights = [];
                for (let i = 0; i < positions.length / 3; i++) {
                    newHeights.push(positions[i * 3 + 2]);
                }
                setHeights(newHeights);
            }
        }
    };
    
    const modifyTerrain = (e: ThreeEvent<PointerEvent>) => {
        if (!meshRef.current) return;
        const geo = meshRef.current.geometry;
        const positions = geo.attributes.position.array as Float32Array;
        const { point } = e;
        
        // Convertir punto de mundo a punto local del plano
        const localPoint = meshRef.current.worldToLocal(point.clone());
        
        let modified = false;
        const radius = 3;
        const force = e.button === 2 || e.shiftKey ? -0.2 : 0.2; // Click derecho o shift para hundir

        for (let i = 0; i < positions.length / 3; i++) {
            const vx = positions[i * 3];
            const vy = positions[i * 3 + 1];
            const distance = Math.sqrt(Math.pow(vx - localPoint.x, 2) + Math.pow(vy - localPoint.y, 2));
            
            if (distance < radius) {
                const influence = 1 - (distance / radius);
                positions[i * 3 + 2] += force * influence;
                modified = true;
            }
        }
        
        if (modified) {
            geo.computeVertexNormals();
            geo.attributes.position.needsUpdate = true;
        }
    };

    return (
        <mesh 
            ref={meshRef}
            name="basePlane"
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            receiveShadow
            onClick={toolMode === 'CONSTRUIR' ? onPlaneClick : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => { isDragging.current = false; }}
        >
            <planeGeometry args={[100, 100, 64, 64]} />
            <meshStandardMaterial color="#cccccc" map={grassTex} roughness={0.9} />
        </mesh>
    );
}

export function Builder3D({ user, onClose }: Builder3DProps) {
  const hasAccess = user && user.username === 'Axiss';

  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(() => {
    const saved = localStorage.getItem('builder3d_items');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [terrainHeights, setTerrainHeights] = useState<number[]>(() => {
    const saved = localStorage.getItem('builder3d_terrain');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedSubType, setSelectedSubType] = useState(CATEGORIES[0].items[0]);
  const [toolMode, setToolMode] = useState<ToolMode>('CAMARA');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('builder3d_items', JSON.stringify(placedItems));
  }, [placedItems]);
  
  useEffect(() => {
    localStorage.setItem('builder3d_terrain', JSON.stringify(terrainHeights));
  }, [terrainHeights]);

  // Lógica de arrastre
  const draggingId = useRef<string | null>(null);
  const dragPlaneY = useRef(0);

  const handlePointerDownObject = (id: string, e: ThreeEvent<PointerEvent>) => {
      if (toolMode === 'MOVER') {
          e.stopPropagation();
          setSelectedItemId(id);
          draggingId.current = id;
          const item = placedItems.find(i => i.id === id);
          if (item) dragPlaneY.current = item.position[1];
          (e.target as any).setPointerCapture(e.pointerId);
      }
  };

  const handlePointerUpObject = (id: string, e: ThreeEvent<PointerEvent>) => {
      if (toolMode === 'MOVER') {
          e.stopPropagation();
          draggingId.current = null;
          (e.target as any).releasePointerCapture(e.pointerId);
      }
  };

  const handleGlobalPointerMove = (e: ThreeEvent<PointerEvent>) => {
      if (toolMode === 'MOVER' && draggingId.current) {
          // Calculamos la intersección con un plano imaginario a la altura del objeto
          const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -dragPlaneY.current);
          const raycaster = e.ray;
          const intersectPoint = new THREE.Vector3();
          
          if (raycaster.intersectPlane(plane, intersectPoint)) {
              setPlacedItems(prev => prev.map(item => {
                  if (item.id === draggingId.current) {
                      return { ...item, position: [intersectPoint.x, item.position[1], intersectPoint.z] };
                  }
                  return item;
              }));
          }
      }
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#0a0f1c] fixed inset-0 z-[9999]">
        <div className="bg-[#121B2A] border border-red-500/50 rounded-2xl p-8 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso Denegado</h1>
          <p className="text-gray-300 mb-6">Esta sala es exclusiva para el administrador Axiss.</p>
          <button onClick={onClose} className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/30">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const handlePlaneClick = (e: ThreeEvent<MouseEvent>) => {
    if (toolMode !== 'CONSTRUIR') return;
    if (e.object.name !== 'basePlane') return;
    
    e.stopPropagation();
    const { point } = e;
    
    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(7),
      category: activeCategory,
      subType: selectedSubType,
      position: [point.x, point.y, point.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff'
    };
    
    if (activeCategory === 'Paredes') {
       newItem.scale = [2, 3, 0.2];
       newItem.position[1] = point.y + 1.5; 
       newItem.color = selectedSubType.includes('Ladrillo') ? '#ffffff' : '#cccccc';
    } else if (activeCategory === 'Texturas') {
       newItem.scale = [2, 0.05, 2];
       newItem.position[1] = point.y + 0.025;
    } else if (activeCategory === 'Techos') {
       newItem.scale = [2.2, 0.2, 2.2];
       if (selectedSubType === 'Inclinado') {
           newItem.scale = [2.5, 1.5, 2.5];
       }
       newItem.position[1] = point.y + 3.1;
       newItem.color = '#555555';
    } else if (activeCategory === 'Vegetación') {
       newItem.scale = selectedSubType === 'Árbol' ? [1.5, 1.5, 1.5] : [0.8, 0.8, 0.8];
       newItem.position[1] = point.y + (selectedSubType === 'Árbol' ? 0 : 0.4);
       newItem.color = '#4ade80';
    } else if (activeCategory === 'Piscinas') {
       newItem.scale = [3, 0.2, 2];
       newItem.position[1] = point.y - 0.1;
       newItem.color = '#38bdf8';
    }

    setPlacedItems(prev => [...prev, newItem]);
  };

  const handleObjectSelect = (id: string, e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (toolMode === 'BORRAR') {
          setPlacedItems(prev => prev.filter(i => i.id !== id));
      } else if (toolMode === 'MOVER') {
          setSelectedItemId(id);
      }
  };

  const handleClear = () => {
    if (window.confirm('¿Seguro que quieres borrar toda la construcción y el terreno?')) {
      setPlacedItems([]);
      setTerrainHeights([]);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-[#05080e] fixed inset-0 z-[9999] flex font-sans">
      {/* UI Sidebar Menú */}
      <div className="w-80 bg-[#121B2A] border-r border-white/10 flex flex-col h-full z-10 shadow-2xl relative">
        <div className="p-5 border-b border-white/10">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Volver al Chat
          </button>
          <h2 className="text-[#D4AF37] font-bold text-xl flex items-center gap-2">
            <Layers size={22} /> Constructor 3D Avanzado
          </h2>
          <p className="text-gray-400 text-sm mt-1">Modo Simulación Activo</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-3">
            <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Herramientas</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'CONSTRUIR' ? 'bg-[#D4AF37] text-black font-bold shadow-md' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => { setToolMode('CONSTRUIR'); setSelectedItemId(null); }}
              >
                <Cuboid size={16} /> Construir
              </button>
              <button 
                className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'MOVER' ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => setToolMode('MOVER')}
              >
                <Move size={16} /> Mover
              </button>
              <button 
                className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'TERRENO' ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => { setToolMode('TERRENO'); setSelectedItemId(null); }}
              >
                <Mountain size={16} /> Terreno
              </button>
              <button 
                className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'BORRAR' ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => { setToolMode('BORRAR'); setSelectedItemId(null); }}
              >
                <Eraser size={16} /> Borrar
              </button>
              <button 
                className={`col-span-2 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'CAMARA' ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => { setToolMode('CAMARA'); setSelectedItemId(null); }}
              >
                <MousePointer2 size={16} /> Solo Cámara
              </button>
            </div>
            {toolMode === 'TERRENO' && (
                <div className="text-xs text-amber-500/80 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    Arrastra sobre el suelo para crear colinas. <br/> (Shift + Arrastrar para hundir).
                </div>
            )}
            {toolMode === 'MOVER' && (
                <div className="text-xs text-blue-400 mt-2 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                    Clic y arrastra un objeto para moverlo.
                </div>
            )}
          </div>

          <div className={`space-y-4 ${toolMode !== 'CONSTRUIR' ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Catálogo</label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="space-y-2">
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      activeCategory === cat.id 
                        ? 'bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                    }`}
                    onClick={() => { setActiveCategory(cat.id); setSelectedSubType(cat.items[0]); }}
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
           <button onClick={handleClear} className="w-full py-2.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-all border border-red-500/30">
             Destruir Todo
           </button>
        </div>
      </div>

      {/* R3F Lienzo */}
      <div className="flex-1 relative cursor-crosshair">
        <Canvas shadows camera={{ position: [0, 15, 20], fov: 45 }} onPointerMove={handleGlobalPointerMove}>
          <color attach="background" args={['#87CEEB']} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[20, 30, 10]} intensity={1.2} castShadow 
            shadow-mapSize={[2048, 2048]} 
            shadow-camera-left={-30} shadow-camera-right={30}
            shadow-camera-top={30} shadow-camera-bottom={-30}
          />
          <hemisphereLight groundColor="#2d2d2d" color="#ffffff" intensity={0.4} />

          {placedItems.map(item => (
             <PlacedObject 
                key={item.id} 
                item={item} 
                isSelected={selectedItemId === item.id}
                onSelect={handleObjectSelect}
                onPointerDown={handlePointerDownObject}
                onPointerUp={handlePointerUpObject}
             />
          ))}

          <Terrain 
             toolMode={toolMode} 
             heights={terrainHeights} 
             setHeights={setTerrainHeights} 
             onPlaneClick={handlePlaneClick}
             setPlacedItems={setPlacedItems}
             activeCategory={activeCategory}
             selectedSubType={selectedSubType}
          />
          
          <Grid infiniteGrid fadeDistance={80} sectionColor="#000000" cellColor="#ffffff" sectionSize={5} cellSize={1} position={[0, 0.01, 0]} />

          <OrbitControls 
             makeDefault 
             maxPolarAngle={Math.PI / 2 - 0.05} 
             minDistance={2} maxDistance={100}
             enabled={toolMode === 'CAMARA'} 
          />
        </Canvas>
        
        {toolMode === 'CONSTRUIR' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-2.5 rounded-full text-white text-sm font-medium border border-white/20 pointer-events-none shadow-lg">
            Colocando: <span className="text-[#D4AF37] font-bold">{selectedSubType}</span>
          </div>
        )}
      </div>
    </div>
  );
}
