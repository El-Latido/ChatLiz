import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Outlines, useGLTF, TransformControls, KeyboardControls, useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { UserObj } from '../types';
import { Layers, Cuboid, Image as ImageIcon, Box, Trees, Waves, ArrowLeft, MousePointer2, Eraser, Move, Mountain, Home, Monitor, Armchair, Archive, Undo2, Redo2, RotateCw, DoorOpen, Grid as GridIcon, ArrowUp, Footprints } from 'lucide-react';
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
  { id: 'Pisos', icon: <GridIcon size={20} />, items: ['Madera', 'Piedra', 'Cerámica', 'Adoquines'] },
  { id: 'Paredes', icon: <Cuboid size={20} />, items: ['Muro Básico', 'Muro Ladrillo'] },
  { id: 'Puertas', icon: <DoorOpen size={20} />, items: ['Puerta Madera', 'Puerta Vidrio'] },
  { id: 'Ventanas', icon: <ImageIcon size={20} />, items: ['Ventana Simple', 'Ventana Doble'] },
  { id: 'Techos', icon: <Box size={20} />, items: ['Plano', 'Inclinado'] },
  { id: 'Escaleras', icon: <ArrowUp size={20} />, items: ['Escalera Recta', 'Ascensor Estructura'] },
  { id: 'Vegetación', icon: <Trees size={20} />, items: ['Árbol', 'Arbusto'] },
  { id: 'Piscinas', icon: <Waves size={20} />, items: ['Piscina Rectangular', 'Jacuzzi'] },
  { id: 'Mobiliario', icon: <Armchair size={20} />, items: ['Silla', 'Mesa', 'Sofá'] },
  { id: 'Electrodomésticos', icon: <Archive size={20} />, items: ['Lavarropas', 'Heladera'] },
  { id: 'Electrónica', icon: <Monitor size={20} />, items: ['TV', 'Consola', 'PC'] },
];

type ToolMode = 'CONSTRUIR' | 'MOVER' | 'ROTAR' | 'BORRAR' | 'TERRENO' | 'CAMARA' | 'EXPLORAR';

// Controles de Teclado
const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
];

// Texturas Procesales
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
    } else if (type === 'adoquines') {
        ctx.fillStyle = '#555555';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#444444';
        for(let i=0; i<8; i++){
            for(let j=0; j<8; j++){
                ctx.fillRect(i*32 + 2, j*32 + 2, 28, 28);
            }
        }
    } else if (type === 'ceramica') {
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(0,0,256,256);
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        for(let i=0; i<4; i++){
            for(let j=0; j<4; j++){
                ctx.strokeRect(i*64, j*64, 64, 64);
            }
        }
    }
    
    return canvas.toDataURL();
};

const textures = {
    ladrillo: createDataTexture('ladrillo'),
    madera: createDataTexture('madera'),
    piedra: createDataTexture('piedra'),
    agua: createDataTexture('agua'),
    pasto: createDataTexture('pasto'),
    adoquines: createDataTexture('adoquines'),
    ceramica: createDataTexture('ceramica')
};

function GLTFModel({ url, scale = 1 }: { url: string, scale?: number | [number, number, number] }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene.clone()} scale={scale} />;
}

// ================= PERSONAJE JUGABLE =================
function Player({ toolMode }: { toolMode: ToolMode }) {
    const bodyRef = useRef<any>(null);
    const [, get] = useKeyboardControls();
    const { camera } = useThree();
    
    const speed = 5;
    const direction = useMemo(() => new THREE.Vector3(), []);
    const frontVector = useMemo(() => new THREE.Vector3(), []);
    const sideVector = useMemo(() => new THREE.Vector3(), []);

    useEffect(() => {
        if (toolMode === 'EXPLORAR') {
            camera.position.set(0, 2, 5);
            camera.rotation.set(0, 0, 0);
        }
    }, [toolMode, camera]);

    useFrame(() => {
        if (toolMode !== 'EXPLORAR' || !bodyRef.current) return;

        const { forward, backward, left, right, jump } = get();
        const velocity = bodyRef.current.linvel();
        const pos = bodyRef.current.translation();

        // 1. Vincular Cámara al Jugador (First Person)
        camera.position.copy(pos);
        camera.position.y += 0.8; // Altura de los ojos

        // 2. Calcular Dirección de Movimiento
        frontVector.set(0, 0, Number(backward) - Number(forward));
        sideVector.set(Number(left) - Number(right), 0, 0);
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed).applyEuler(camera.rotation);

        // 3. Aplicar Velocidad Lineal
        bodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z });

        // 4. Salto
        if (jump && Math.abs(velocity.y) < 0.1) {
            bodyRef.current.setLinvel({ x: velocity.x, y: 5, z: velocity.z });
        }
    });

    if (toolMode !== 'EXPLORAR') return null;

    return (
        <>
            <PointerLockControls />
            <RigidBody ref={bodyRef} colliders="capsule" mass={1} type="dynamic" position={[0, 5, 0]} enabledRotations={[false, false, false]}>
                <capsuleGeometry args={[0.3, 0.8]} />
                <meshStandardMaterial color="hotpink" visible={false} />
            </RigidBody>
        </>
    );
}

// ================= OBJETOS COLOCADOS =================
function PlacedObject({ item, isSelected, onSelect, onTransformEnd, toolMode }: any) {
    const meshRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<any>(null);
    const isExplore = toolMode === 'EXPLORAR';
    
    // Estado de Puertas
    const [isOpen, setIsOpen] = useState(false);
    const currentRotY = useRef(item.rotation[1]);
    
    useFrame(() => {
        if (isExplore && item.category === 'Puertas' && bodyRef.current) {
            const targetY = isOpen ? item.rotation[1] + Math.PI / 2 : item.rotation[1];
            currentRotY.current = THREE.MathUtils.lerp(currentRotY.current, targetY, 0.1);
            
            const euler = new THREE.Euler(item.rotation[0], currentRotY.current, item.rotation[2]);
            const quat = new THREE.Quaternion().setFromEuler(euler);
            bodyRef.current.setNextKinematicRotation(quat);
        }
    });

    const handleInteract = (e: any) => {
        if (isExplore && item.category === 'Puertas') {
            e.stopPropagation();
            setIsOpen(!isOpen);
        } else if (!isExplore) {
            e.stopPropagation(); 
            onSelect(item.id);
        }
    };

    const texMap = useMemo(() => {
        let url = null;
        if (item.subType.includes('Ladrillo')) url = textures.ladrillo;
        else if (item.subType.includes('Madera')) url = textures.madera;
        else if (item.subType.includes('Piedra')) url = textures.piedra;
        else if (item.subType.includes('Cerámica')) url = textures.ceramica;
        else if (item.subType.includes('Adoquines')) url = textures.adoquines;
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
    }, [item.subType, item.scale, item.category]);

    // Generar Geometría Específica
    let geometryNode = <boxGeometry args={[1, 1, 1]} />;
    
    if (item.category === 'Puertas') {
        geometryNode = (
            <group position={[0.5, 1, 0]}> {/* Pivote en el borde */}
                <mesh position={[-0.5, 0, 0]}>
                    <boxGeometry args={[1, 2, 0.1]} />
                    <meshStandardMaterial color={item.subType.includes('Vidrio') ? '#a8d8e6' : '#5c3a21'} transparent={item.subType.includes('Vidrio')} opacity={item.subType.includes('Vidrio') ? 0.6 : 1} />
                </mesh>
                <mesh position={[-0.9, 0, 0.1]}>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#d4af37" />
                </mesh>
            </group>
        );
    } else if (item.category === 'Ventanas') {
        geometryNode = (
            <group position={[0, 1, 0]}>
                <mesh position={[0,0,0]}><boxGeometry args={[1, 1, 0.15]}/><meshStandardMaterial color="#eeeeee"/></mesh>
                <mesh position={[0,0,0]}><boxGeometry args={[0.8, 0.8, 0.17]}/><meshStandardMaterial color="#87CEEB" transparent opacity={0.4}/></mesh>
            </group>
        );
    } else if (item.category === 'Escaleras') {
        geometryNode = (
            <group position={[0, 0, 0]}>
               {[...Array(6)].map((_, i) => (
                   <mesh key={i} position={[0, i * 0.25 + 0.125, i * -0.25 - 0.125]}>
                       <boxGeometry args={[1, 0.25, 0.25]} />
                       <meshStandardMaterial color={item.color} />
                   </mesh>
               ))}
               {/* Rampa Invisible para Físicas Suaves */}
               <mesh position={[0, 0.75, -0.75]} rotation={[Math.PI / 4, 0, 0]} visible={false}>
                   <boxGeometry args={[1, 2.1, 0.1]} />
               </mesh>
            </group>
        );
    } else if (item.category === 'Vegetación') {
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
    }

    const meshContent = (
        <group 
            ref={!isExplore ? meshRef : null}
            position={!isExplore ? item.position : [0,0,0]} 
            rotation={!isExplore ? item.rotation : [0,0,0]} 
            scale={item.scale} 
            onClick={handleInteract}
        >
            {item.category !== 'Mobiliario' && item.category !== 'Electrodomésticos' && item.category !== 'Electrónica' && item.category !== 'Puertas' && item.category !== 'Ventanas' && item.category !== 'Escaleras' ? (
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
                <group castShadow receiveShadow>
                    {geometryNode}
                </group>
            )}
            
            {isSelected && !isExplore && toolMode !== 'MOVER' && toolMode !== 'ROTAR' && <Outlines thickness={0.05} color="#D4AF37" />}
        </group>
    );

    if (isExplore) {
        let colliders: any = 'cuboid';
        if (item.category === 'Escaleras' || item.category === 'Vegetación') colliders = 'hull';
        const rbType = item.category === 'Puertas' ? 'kinematicPositionBased' : 'fixed';

        return (
            <RigidBody ref={bodyRef} type={rbType} colliders={colliders} position={item.position} rotation={item.rotation}>
                {meshContent}
            </RigidBody>
        );
    }

    return (
        <>
            {meshContent}
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

// ================= TERRENO =================
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
            onTerrainEditStart(); 
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

    const terrainMesh = (
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

    if (toolMode === 'EXPLORAR') {
        return (
            <RigidBody type="fixed" colliders="trimesh">
                {terrainMesh}
            </RigidBody>
        );
    }

    return terrainMesh;
}

// ================= EDITOR PRINCIPAL =================
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

  // --- LÓGICA DE CONSTRUCCIÓN Y SNAP ---
  const handlePlaneClick = (e: ThreeEvent<MouseEvent>) => {
    if (toolMode !== 'CONSTRUIR') return;
    e.stopPropagation();
    
    saveToHistory();
    const { point } = e;
    const snapEnabled = true; // Snap Activo por defecto
    const step = 0.5; // Grid de 0.5 metros
    
    const x = snapEnabled ? Math.round(point.x / step) * step : point.x;
    const z = snapEnabled ? Math.round(point.z / step) * step : point.z;
    const y = point.y;
    
    // SISTEMA DE PREFABS (Casas)
    if (activeCategory === 'Plantillas') {
        const batch: PlacedItem[] = [];
        if (selectedSubType === 'Casa Moderna') {
            batch.push({ id: Math.random().toString(), category: 'Pisos', subType: 'Madera', position: [x, y + 0.05, z], rotation: [0,0,0], scale: [6, 0.1, 6], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [x, y + 1.5, z - 3], rotation: [0,0,0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [x, y + 1.5, z + 3], rotation: [0,0,0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [x - 3, y + 1.5, z], rotation: [0, Math.PI/2, 0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Básico', position: [x + 3, y + 1.5, z], rotation: [0, Math.PI/2, 0], scale: [6, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Techos', subType: 'Plano', position: [x, y + 3.1, z], rotation: [0,0,0], scale: [6.2, 0.2, 6.2], color: '#555555' });
        } else if (selectedSubType === 'Cabaña') {
            batch.push({ id: Math.random().toString(), category: 'Pisos', subType: 'Madera', position: [x, y + 0.05, z], rotation: [0,0,0], scale: [5, 0.1, 5], color: '#8b5a2b' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [x, y + 1.5, z - 2.5], rotation: [0,0,0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [x, y + 1.5, z + 2.5], rotation: [0,0,0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [x - 2.5, y + 1.5, z], rotation: [0, Math.PI/2, 0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Paredes', subType: 'Muro Ladrillo', position: [x + 2.5, y + 1.5, z], rotation: [0, Math.PI/2, 0], scale: [5, 3, 0.2], color: '#ffffff' });
            batch.push({ id: Math.random().toString(), category: 'Techos', subType: 'Inclinado', position: [x, y + 3.1, z], rotation: [0,0,0], scale: [5.5, 2, 5.5], color: '#443322' });
        }
        setPlacedItems(prev => [...prev, ...batch]);
        return;
    }

    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(7),
      category: activeCategory,
      subType: selectedSubType,
      position: [x, y, z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff'
    };
    
    if (activeCategory === 'Paredes') {
       newItem.scale = [3, 3, 0.2];
       newItem.position[1] = y + 1.5; 
       newItem.color = selectedSubType.includes('Ladrillo') ? '#ffffff' : '#cccccc';
    } else if (activeCategory === 'Pisos') {
       newItem.scale = [3, 0.1, 3];
       newItem.position[1] = y + 0.05;
    } else if (activeCategory === 'Puertas') {
       newItem.scale = [1, 1, 1];
       newItem.position[1] = y;
    } else if (activeCategory === 'Ventanas') {
       newItem.scale = [1, 1, 1];
       newItem.position[1] = y + 1;
    } else if (activeCategory === 'Techos') {
       newItem.scale = [3.2, 0.2, 3.2];
       if (selectedSubType === 'Inclinado') newItem.scale = [3.5, 1.5, 3.5];
       newItem.position[1] = y + 3.1;
       newItem.color = '#555555';
    } else if (activeCategory === 'Escaleras') {
       newItem.scale = [1, 1, 1];
       newItem.position[1] = y;
    } else if (activeCategory === 'Vegetación') {
       newItem.scale = selectedSubType === 'Árbol' ? [1.5, 1.5, 1.5] : [0.8, 0.8, 0.8];
       newItem.position[1] = y + (selectedSubType === 'Árbol' ? 0 : 0.4);
       newItem.color = '#4ade80';
    } else if (activeCategory === 'Piscinas') {
       newItem.scale = [3, 0.2, 2];
       newItem.position[1] = y - 0.1;
       newItem.color = '#38bdf8';
    } else if (activeCategory === 'Mobiliario' || activeCategory === 'Electrodomésticos' || activeCategory === 'Electrónica') {
       newItem.position[1] = y;
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
    <KeyboardControls map={keyboardMap}>
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
                
                {/* EXPLORAR - Botón Principal Destacado */}
                <button 
                    className={`w-full flex items-center justify-center gap-2 py-3 text-sm rounded-lg transition-all ${toolMode === 'EXPLORAR' ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'}`}
                    onClick={() => { setToolMode('EXPLORAR'); setSelectedItemId(null); }}
                  >
                    <Footprints size={18} /> Explorar / Jugar (WASD + Espacio)
                </button>

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
              </div>

              <div className={`space-y-4 ${toolMode === 'EXPLORAR' ? 'opacity-30 pointer-events-none' : ''}`}>
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
                        onClick={() => { setActiveCategory(cat.id); setSelectedSubType(cat.items[0]); setToolMode('CONSTRUIR'); }}
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
                              onClick={() => { setSelectedSubType(item); setToolMode('CONSTRUIR'); }}
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
              
              <Physics gravity={[0, -9.81, 0]}>
                  <ambientLight intensity={0.6} />
                  <directionalLight 
                    position={[20, 30, 10]} intensity={1.2} castShadow 
                    shadow-mapSize={[2048, 2048]} 
                    shadow-camera-left={-30} shadow-camera-right={30}
                    shadow-camera-top={30} shadow-camera-bottom={-30}
                  />
                  <hemisphereLight groundColor="#2d2d2d" color="#ffffff" intensity={0.4} />

                  <Player toolMode={toolMode} />

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
              </Physics>
              
              <Grid infiniteGrid fadeDistance={80} sectionColor="#000000" cellColor="#ffffff" sectionSize={5} cellSize={0.5} position={[0, 0.01, 0]} />

              <OrbitControls 
                 makeDefault 
                 maxPolarAngle={Math.PI / 2 - 0.05} 
                 minDistance={2} maxDistance={100}
                 enabled={toolMode !== 'EXPLORAR'} 
              />
            </Canvas>
            
            {toolMode === 'EXPLORAR' && (
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference" />
            )}

            {toolMode === 'EXPLORAR' && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-2.5 rounded-full text-white text-sm font-medium border border-white/20 pointer-events-none shadow-lg">
                  Presiona <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">Esc</kbd> para liberar el mouse
                </div>
            )}

            {toolMode === 'CONSTRUIR' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-2.5 rounded-full text-white text-sm font-medium border border-white/20 pointer-events-none shadow-lg">
                Colocando: <span className="text-[#D4AF37] font-bold">{selectedSubType}</span> (Snap Activo)
              </div>
            )}
          </div>
        </div>
    </KeyboardControls>
  );
}
