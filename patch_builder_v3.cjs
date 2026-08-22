const fs = require('fs');

const content = `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid, Outlines, useGLTF, TransformControls } from '@react-three/drei';
import { UserObj } from '../types';
import { Layers, Cuboid, Image as ImageIcon, Box, Trees, Waves, ArrowLeft, MousePointer2, Eraser, Move, Mountain, Home, Monitor, Armchair, Archive, Undo2, Redo2, RotateCw } from 'lucide-react';
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
  { id: 'Plantillas', icon: <Home size={20} />, items: ['Casa Moderna', 'Cabaña'] },
  { id: 'Paredes', icon: <Cuboid size={20} />, items: ['Muro Básico', 'Muro Ladrillo'] },
  { id: 'Texturas', icon: <ImageIcon size={20} />, items: ['Piso Madera', 'Piso Piedra'] },
  { id: 'Techos', icon: <Box size={20} />, items: ['Plano', 'Inclinado'] },
  { id: 'Vegetación', icon: <Trees size={20} />, items: ['Árbol', 'Arbusto'] },
  { id: 'Piscinas', icon: <Waves size={20} />, items: ['Piscina Rectangular', 'Jacuzzi'] },
  { id: 'Mobiliario', icon: <Armchair size={20} />, items: ['Silla', 'Mesa', 'Sofá'] },
  { id: 'Electrodomésticos', icon: <Archive size={20} />, items: ['Lavarropas', 'Heladera'] },
  { id: 'Electrónica', icon: <Monitor size={20} />, items: ['TV', 'Consola', 'PC'] },
];

type ToolMode = 'CONSTRUIR' | 'MOVER' | 'ROTAR' | 'BORRAR' | 'TERRENO' | 'CAMARA';

// Texturas Procesales (Evitan problemas de CORS y se generan en memoria)
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

function GLTFModel({ url, scale = 1 }: { url: string, scale?: number | [number, number, number] }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene.clone()} scale={scale} />;
}

function PlacedObject({ item, isSelected, onSelect, onTransformEnd, toolMode }: any) {
    const meshRef = useRef<THREE.Group>(null);
    
    // Texturas
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

    // Generar Geometría (Decoración y Muebles the Sims Style)
    let geometryNode = <boxGeometry args={[1, 1, 1]} />;
    if (item.category === 'Vegetación') {
        geometryNode = item.subType === 'Árbol' ? (
           <React.Suspense fallback={<dodecahedronGeometry args={[0.8, 1]} />}>
               <GLTFModel url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF/Fox.gltf" scale={0.02} />
           </React.Suspense>
        ) : (
            <React.Suspense fallback={<dodecahedronGeometry args={[0.8, 1]} />}>
               <GLTFModel url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF/Duck.gltf" scale={0.5} />
           </React.Suspense>
        );
    } else if (item.category === 'Techos' && item.subType === 'Inclinado') {
        geometryNode = <coneGeometry args={[1, 1, 4]} />;
    } else if (item.category === 'Mobiliario') {
        if (item.subType === 'Silla') {
            geometryNode = (
                <group position={[0, 0.5, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[0.5, 0.1, 0.5]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[-0.2, -0.25, -0.2]}><boxGeometry args={[0.05, 0.5, 0.05]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0.2, -0.25, -0.2]}><boxGeometry args={[0.05, 0.5, 0.05]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[-0.2, -0.25, 0.2]}><boxGeometry args={[0.05, 0.5, 0.05]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0.2, -0.25, 0.2]}><boxGeometry args={[0.05, 0.5, 0.05]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0, 0.3, -0.2]}><boxGeometry args={[0.5, 0.5, 0.05]}/><meshStandardMaterial color={item.color}/></mesh>
                </group>
            );
        } else if (item.subType === 'Mesa') {
            geometryNode = (
                <group position={[0, 0.75, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[2, 0.1, 1]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[-0.9, -0.35, -0.4]}><boxGeometry args={[0.1, 0.7, 0.1]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0.9, -0.35, -0.4]}><boxGeometry args={[0.1, 0.7, 0.1]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[-0.9, -0.35, 0.4]}><boxGeometry args={[0.1, 0.7, 0.1]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0.9, -0.35, 0.4]}><boxGeometry args={[0.1, 0.7, 0.1]}/><meshStandardMaterial color={item.color}/></mesh>
                </group>
            );
        } else if (item.subType === 'Sofá') {
             geometryNode = (
                <group position={[0, 0.4, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[2, 0.4, 0.8]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0, 0.4, -0.3]}><boxGeometry args={[2, 0.5, 0.2]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[-0.9, 0.2, 0]}><boxGeometry args={[0.2, 0.4, 0.8]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0.9, 0.2, 0]}><boxGeometry args={[0.2, 0.4, 0.8]}/><meshStandardMaterial color={item.color}/></mesh>
                </group>
            );
        }
    } else if (item.category === 'Electrodomésticos') {
        if (item.subType === 'Lavarropas') {
             geometryNode = (
                <group position={[0, 0.5, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[0.8, 1, 0.8]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0, 0, 0.41]}><cylinderGeometry args={[0.3, 0.3, 0.05, 16]} rotation={[Math.PI/2, 0, 0]}/><meshStandardMaterial color="#222222"/></mesh>
                </group>
             );
        } else if (item.subType === 'Heladera') {
            geometryNode = (
                <group position={[0, 1, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[0.9, 2, 0.9]}/><meshStandardMaterial color={item.color}/></mesh>
                    <mesh position={[0, 0.2, 0.46]}><boxGeometry args={[0.9, 0.02, 0.02]}/><meshStandardMaterial color="#888888"/></mesh>
                </group>
             );
        }
    } else if (item.category === 'Electrónica') {
        if (item.subType === 'TV') {
             geometryNode = (
                <group position={[0, 0.5, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[2, 1.2, 0.1]}/><meshStandardMaterial color="#111111"/></mesh>
                    <mesh position={[0, -0.6, 0]}><boxGeometry args={[0.4, 0.1, 0.3]}/><meshStandardMaterial color="#333333"/></mesh>
                </group>
             );
        } else if (item.subType === 'Consola' || item.subType === 'PC') {
             geometryNode = (
                <group position={[0, 0.2, 0]}>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[0.3, 0.4, 0.8]}/><meshStandardMaterial color={item.subType === 'PC' ? '#1a1a1a' : '#ffffff'}/></mesh>
                </group>
             );
        }
    }

    return (
        <>
            <group 
                ref={meshRef}
                position={item.position} 
                rotation={item.rotation} 
                scale={item.scale} 
                onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
            >
                {/* Geometría con Material General */}
                {item.category !== 'Mobiliario' && item.category !== 'Electrodomésticos' && item.category !== 'Electrónica' ? (
                    <mesh castShadow receiveShadow>
                        {geometryNode}
                        <meshStandardMaterial 
                            color={item.color} 
                            map={texMap} 
                            transparent={item.category === 'Piscinas'} 
                            opacity={item.category === 'Piscinas' ? 0.8 : 1}
                            roughness={item.category === 'Piscinas' ? 0.1 : 0.8}
                        />
                    </mesh>
                ) : (
                    // Si son objetos compuestos (Muebles), ya tienen sus materiales en la función geometryNode
                    <group castShadow receiveShadow>
                        {geometryNode}
                    </group>
                )}
                
                {isSelected && toolMode !== 'MOVER' && toolMode !== 'ROTAR' && <Outlines thickness={0.05} color="#D4AF37" />}
            </group>

            {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR') && (
                <TransformControls 
                    object={meshRef} 
                    mode={toolMode === 'MOVER' ? 'translate' : 'rotate'}
                    onMouseUp={() => {
                        if (meshRef.current) {
                            const newPos: [number,number,number] = [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z];
                            const newRot: [number,number,number] = [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z];
                            onTransformEnd(item.id, newPos, newRot);
                        }
                    }}
                />
            )}
        </>
    );
}

function Terrain({ toolMode, heights, setHeights, onPlaneClick, onTerrainEditStart }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const isDragging = useRef(false);
    
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

    useEffect(() => {
        if (meshRef.current && heights.length > 0) {
            const geo = meshRef.current.geometry;
            const positions = geo.attributes.position.array as Float32Array;
            for (let i = 0; i < heights.length; i++) {
                positions[i * 3 + 2] = heights[i];
            }
            geo.computeVertexNormals();
            geo.attributes.position.needsUpdate = true;
        }
    }, [heights]);

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (toolMode === 'TERRENO') {
            e.stopPropagation();
            onTerrainEditStart(); // Guardar historial antes de modificar
            isDragging.current = true;
            (e.target as any).setPointerCapture(e.pointerId);
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
            (e.target as any).releasePointerCapture(e.pointerId);
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
        
        const localPoint = meshRef.current.worldToLocal(point.clone());
        let modified = false;
        const radius = 3;
        const force = e.button === 2 || e.shiftKey ? -0.2 : 0.2;

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
            name="basePlane"
            ref={meshRef}
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

  // --- ESTADO Y PERSISTENCIA ---
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(() => {
    const saved = localStorage.getItem('builder3d_items');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [terrainHeights, setTerrainHeights] = useState<number[]>(() => {
    const saved = localStorage.getItem('builder3d_terrain');
    return saved ? JSON.parse(saved) : [];
  });
  
  // --- HISTORIAL (UNDO/REDO) ---
  const [pastStates, setPastStates] = useState<{items: PlacedItem[], terrain: number[]}[]>([]);
  const [futureStates, setFutureStates] = useState<{items: PlacedItem[], terrain: number[]}[]>([]);

  const saveToHistory = (currentItems = placedItems, currentTerrain = terrainHeights) => {
      setPastStates(prev => [...prev, { items: currentItems, terrain: currentTerrain }]);
      setFutureStates([]);
  };

  const undo = () => {
      setPastStates(prev => {
          if (prev.length === 0) return prev;
          const lastState = prev[prev.length - 1];
          setFutureStates(f => [{ items: placedItems, terrain: terrainHeights }, ...f]);
          setPlacedItems(lastState.items);
          setTerrainHeights(lastState.terrain);
          return prev.slice(0, prev.length - 1);
      });
  };

  const redo = () => {
      setFutureStates(prev => {
          if (prev.length === 0) return prev;
          const nextState = prev[0];
          setPastStates(p => [...p, { items: placedItems, terrain: terrainHeights }]);
          setPlacedItems(nextState.items);
          setTerrainHeights(nextState.terrain);
          return prev.slice(1);
      });
  };

  // Teclas Rápidas para Historial
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.key === 'z') {
              e.preventDefault();
              undo();
          } else if (e.ctrlKey && e.key === 'y') {
              e.preventDefault();
              redo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placedItems, terrainHeights, pastStates, futureStates]);

  useEffect(() => {
    localStorage.setItem('builder3d_items', JSON.stringify(placedItems));
    localStorage.setItem('builder3d_terrain', JSON.stringify(terrainHeights));
  }, [placedItems, terrainHeights]);
  
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedSubType, setSelectedSubType] = useState(CATEGORIES[0].items[0]);
  const [toolMode, setToolMode] = useState<ToolMode>('CAMARA');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

  // --- LÓGICAS DE CONSTRUCCIÓN ---
  const handlePlaneClick = (e: ThreeEvent<MouseEvent>) => {
    if (toolMode !== 'CONSTRUIR') return;
    e.stopPropagation();
    
    saveToHistory(); // Guardar estado actual antes de modificar
    const { point } = e;
    
    // SISTEMA DE PREFABS (Casas)
    if (activeCategory === 'Plantillas') {
        const batch: PlacedItem[] = [];
        if (selectedSubType === 'Casa Moderna') {
            batch.push({ id: Math.random().toString(), category: 'Texturas', subType: 'Piso Madera', position: [point.x, point.y + 0.05, point.z], rotation: [0,0,0], scale: [6, 0.1, 6], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [point.x, point.y + 1.5, point.z - 3], rotation: [0,0,0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [point.x, point.y + 1.5, point.z + 3], rotation: [0,0,0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [point.x - 3, point.y + 1.5, point.z], rotation: [0, Math.PI/2, 0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [point.x + 3, point.y + 1.5, point.z], rotation: [0, Math.PI/2, 0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Techos', subType: 'Plano', position: [point.x, point.y + 3.1, point.z], rotation: [0,0,0], scale: [6.2, 0.2, 6.2], color: '#555555' });
        } else if (selectedSubType === 'Cabaña') {
            batch.push({ id: Math.random().toString(), category: 'Texturas', subType: 'Piso Madera', position: [point.x, point.y + 0.05, point.z], rotation: [0,0,0], scale: [5, 0.1, 5], color: '#8b5a2b' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [point.x, point.y + 1.5, point.z - 2.5], rotation: [0,0,0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [point.x, point.y + 1.5, point.z + 2.5], rotation: [0,0,0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [point.x - 2.5, point.y + 1.5, point.z], rotation: [0, Math.PI/2, 0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [point.x + 2.5, point.y + 1.5, point.z], rotation: [0, Math.PI/2, 0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Techos', subType: 'Inclinado', position: [point.x, point.y + 3.1, point.z], rotation: [0,0,0], scale: [5.5, 2, 5.5], color: '#443322' });
        }
        setPlacedItems(prev => [...prev, ...batch]);
        return;
    }

    // Piezas individuales y Muebles
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
       if (selectedSubType === 'Inclinado') newItem.scale = [2.5, 1.5, 2.5];
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
    } else if (activeCategory === 'Mobiliario' || activeCategory === 'Electrodomésticos' || activeCategory === 'Electrónica') {
       newItem.position[1] = point.y;
       newItem.color = activeCategory === 'Mobiliario' ? '#8b5a2b' : '#ffffff';
    }

    setPlacedItems(prev => [...prev, newItem]);
  };

  const handleObjectSelect = (id: string) => {
      if (toolMode === 'BORRAR') {
          saveToHistory();
          setPlacedItems(prev => prev.filter(i => i.id !== id));
      } else if (toolMode === 'MOVER' || toolMode === 'ROTAR') {
          setSelectedItemId(id);
      }
  };

  const handleTransformEnd = (id: string, newPos: [number,number,number], newRot: [number,number,number]) => {
      saveToHistory();
      setPlacedItems(prev => prev.map(item => item.id === id ? { ...item, position: newPos, rotation: newRot } : item));
  };

  const handleClear = () => {
    if (window.confirm('¿Seguro que quieres borrar toda la construcción y el terreno?')) {
      saveToHistory();
      setPlacedItems([]);
      setTerrainHeights([]);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-[#05080e] fixed inset-0 z-[9999] flex font-sans">
      {/* UI Sidebar Menú */}
      <div className="w-80 bg-[#121B2A] border-r border-white/10 flex flex-col h-full z-10 shadow-2xl relative">
        <div className="p-4 border-b border-white/10">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Volver al Chat
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-[#D4AF37] font-bold text-xl flex items-center gap-2">
              <Layers size={22} /> Creador 3D
            </h2>
            <div className="flex items-center gap-1">
                <button onClick={undo} disabled={pastStates.length === 0} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent" title="Deshacer (Ctrl+Z)"><Undo2 size={18}/></button>
                <button onClick={redo} disabled={futureStates.length === 0} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent" title="Rehacer (Ctrl+Y)"><Redo2 size={18}/></button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-3">
            <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Herramientas Principales</label>
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
                className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'ROTAR' ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => setToolMode('ROTAR')}
              >
                <RotateCw size={16} /> Rotar
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
                className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'CAMARA' ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                onClick={() => { setToolMode('CAMARA'); setSelectedItemId(null); }}
              >
                <MousePointer2 size={16} /> Cámara
              </button>
            </div>
            
            {/* Tooltips Dinámicos */}
            {toolMode === 'TERRENO' && (
                <div className="text-xs text-amber-500/80 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    Arrastra sobre el suelo para crear colinas. <br/> (Shift + Arrastrar para hundir).
                </div>
            )}
            {(toolMode === 'MOVER' || toolMode === 'ROTAR') && (
                <div className="text-xs text-blue-400 mt-2 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                    Selecciona un objeto y utiliza los ejes del Gizmo para ajustarlo.
                </div>
            )}
          </div>

          <div className={`space-y-4 ${toolMode !== 'CONSTRUIR' ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Catálogo (Sims Mode)</label>
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
        <Canvas shadows camera={{ position: [0, 15, 20], fov: 45 }}>
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
                onTransformEnd={handleTransformEnd}
                toolMode={toolMode}
             />
          ))}

          <Terrain 
             toolMode={toolMode} 
             heights={terrainHeights} 
             setHeights={setTerrainHeights} 
             onPlaneClick={handlePlaneClick}
             onTerrainEditStart={saveToHistory}
          />
          
          <Grid infiniteGrid fadeDistance={80} sectionColor="#000000" cellColor="#ffffff" sectionSize={5} cellSize={1} position={[0, 0.01, 0]} />

          <OrbitControls 
             makeDefault 
             maxPolarAngle={Math.PI / 2 - 0.05} 
             minDistance={2} maxDistance={100}
             enabled={toolMode === 'CAMARA' || toolMode === 'CONSTRUIR' || toolMode === 'BORRAR' || toolMode === 'TERRENO'} 
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
