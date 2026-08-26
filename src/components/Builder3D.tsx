import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Grid, Outlines, useGLTF, TransformControls, KeyboardControls, useKeyboardControls, PointerLockControls, Html, Float } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { UserObj } from '../types';
import { Layers, Cuboid, Image as ImageIcon, Box, Trees, Waves, ArrowLeft, MousePointer2, Eraser, Move, Mountain, Home, Monitor, Armchair, Archive, Undo2, Redo2, RotateCw, DoorOpen, Grid as GridIcon, ArrowUp, Footprints, DownloadCloud, X, Trash2, Upload } from 'lucide-react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer, Bloom, N8AO, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import localforage from 'localforage';
import { RyokanNeo } from "./RyokanNeo";

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

export interface CustomAsset {
  id: string;
  name: string;
  category: string;
  type: 'model' | 'texture' | 'sketchfab';
  blobUrl?: string;
  sketchfabUid?: string;
}

const CATEGORIES = [
  { id: 'Plantillas', icon: <Home size={20} />, items: ['Ryokan Neofuturista', 'Santuario Japonés', 'Moderna Minimalista', 'Cabaña Rústica', 'Contemporánea Cristal', 'Villa Mediterránea', 'Industrial Loft'] },
  { id: 'Pisos', icon: <GridIcon size={20} />, items: ['Madera', 'Piedra', 'Cerámica', 'Adoquines'] },
  { id: 'Paredes', icon: <Cuboid size={20} />, items: ['Muro Básico', 'Muro Ladrillo'] },
  { id: 'Puertas', icon: <DoorOpen size={20} />, items: ['Puerta Madera', 'Puerta Vidrio'] },
  { id: 'Ventanas', icon: <ImageIcon size={20} />, items: ['Ventana Simple', 'Ventana Doble'] },
  { id: 'Techos', icon: <Box size={20} />, items: ['Plano', 'Inclinado'] },
  { id: 'Escaleras', icon: <ArrowUp size={20} />, items: ['Escalera Recta', 'Ascensor Estructura'] },
  { id: 'Vegetación', icon: <Trees size={20} />, items: ['Árbol', 'Arbusto', 'Árbol Sakura', 'Bambú', 'Roca Musgo'] },
  { id: 'Piscinas', icon: <Waves size={20} />, items: ['Piscina Rectangular', 'Jacuzzi'] },
  { id: 'Mobiliario', icon: <Armchair size={20} />, items: ['Silla', 'Mesa', 'Sofá', 'Vela', 'Farol Japonés'] },
  { id: 'Electrodomésticos', icon: <Archive size={20} />, items: ['Lavarropas', 'Heladera'] },
  { id: 'Electrónica', icon: <Monitor size={20} />, items: ['TV', 'Consola', 'PC'] },
];

const HOUSE_DATA: Record<string, any> = {
    'Moderna Minimalista': {
        walls: [
            [-4.9, 1.5, 0, 0.2, 3, 10, '#ffffff'],
            [4.9, 1.5, 0, 0.2, 3, 10, '#ffffff'],
            [0, 1.5, -4.9, 10, 3, 0.2, '#ffffff'],
            [-3, 1.5, 4.9, 4, 3, 0.2, '#ffffff'],
            [3, 1.5, 4.9, 4, 3, 0.2, '#ffffff'],
            [0, 2.55, 4.9, 2, 0.9, 0.2, '#ffffff'],
            [-4.9, 4.6, -2.5, 0.2, 3, 5, '#ffffff'],
            [4.9, 4.6, -2.5, 0.2, 3, 5, '#ffffff'],
            [0, 4.6, -4.9, 10, 3, 0.2, '#ffffff'],
            [0, 4.6, 0, 10, 3, 0.2, '#ffffff'],
        ],
        glass: [
            [0, 3.6, 4.9, 10, 1, 0.1],
            [-4.9, 3.6, 2.45, 0.1, 1, 5],
            [4.9, 3.6, 2.45, 0.1, 1, 5],
            [0, 4.6, 0.1, 8, 2.5, 0.1]
        ],
        floors: [
            [0, 0.1, 0, 10, 0.2, 10, 'ceramica'],
            [0, 3.1, 0, 10, 0.2, 10, 'madera'],
            [0, 6.2, -2.5, 10, 0.2, 5, 'ceramica'],
        ],
        stairs: [
            [-3.5, 1.6, 0, Math.PI/2]
        ],
        doors: [
            [0, 1.1, 4.9, 0]
        ]
    },
    'Cabaña Rústica': {
        walls: [
            [-4.9, 1.5, 0, 0.2, 3, 10, '#ffffff', 'madera'],
            [4.9, 1.5, 0, 0.2, 3, 10, '#ffffff', 'madera'],
            [0, 1.5, -4.9, 10, 3, 0.2, '#ffffff', 'madera'],
            [-3, 1.5, 4.9, 4, 3, 0.2, '#ffffff', 'madera'],
            [3, 1.5, 4.9, 4, 3, 0.2, '#ffffff', 'madera'],
            [0, 2.55, 4.9, 2, 0.9, 0.2, '#ffffff', 'madera'],
        ],
        roofs: [
            [-2.5, 4, 0, 6, 0.2, 11, '#6b4c3a', Math.PI/6],
            [2.5, 4, 0, 6, 0.2, 11, '#6b4c3a', -Math.PI/6]
        ],
        floors: [
            [0, 0.1, 0, 10, 0.2, 10, 'madera'],
            [0, 3.1, 0, 10, 0.2, 10, 'madera']
        ],
        glass: [
            [-3, 1.5, 5, 2, 1.5, 0.1]
        ],
        chimneys: [
            [5, 3, 0, 1.5, 6, 1.5, 'piedra']
        ],
        doors: [
            [0, 1.1, 4.9, 0]
        ]
    },
    'Contemporánea Cristal': {
        walls: [
            [-4.9, 1.5, 0, 0.2, 3, 10, '#ffffff', 'ladrillo'],
            [4.9, 1.5, 0, 0.2, 3, 10, '#ffffff', 'ladrillo'],
            [0, 1.5, -4.9, 10, 3, 0.2, '#ffffff', 'ladrillo'],
            [0, 1.5, 4.9, 10, 0.5, 0.2, '#ffffff', 'ladrillo'],
        ],
        glass: [
            [-2.5, 2, 4.9, 5, 2, 0.1],
            [3.5, 2, 4.9, 3, 2, 0.1]
        ],
        floors: [
            [0, 0.1, 0, 10, 0.2, 10, 'ceramica'],
            [0, 3.2, 0, 11, 0.3, 11, 'ceramica']
        ],
        doors: [
            [1, 1.1, 4.9, 0]
        ]
    },
    'Villa Mediterránea': {
        walls: [
            [-4.9, 1.5, 0, 0.2, 3, 10, '#e3dac9'],
            [4.9, 1.5, 0, 0.2, 3, 10, '#e3dac9'],
            [0, 1.5, -4.9, 10, 3, 0.2, '#e3dac9'],
            [-3, 1.5, 4.9, 4, 3, 0.2, '#e3dac9'],
            [3, 1.5, 4.9, 4, 3, 0.2, '#e3dac9'],
            [0, 2.55, 4.9, 2, 0.9, 0.2, '#e3dac9'],
            [-1.5, 1.5, 7, 0.5, 3, 0.5, '#e3dac9'],
            [1.5, 1.5, 7, 0.5, 3, 0.5, '#e3dac9'],
            [0, 3.2, 7, 4, 0.5, 0.5, '#e3dac9']
        ],
        roofs: [
            [0, 3.6, 0, 11, 0.4, 11, '#cc4b37', 0]
        ],
        floors: [
            [0, 0.1, 0, 10, 0.2, 10, 'ceramica'],
            [0, 0.1, 6, 4, 0.2, 3, 'adoquines']
        ],
        doors: [
            [0, 1.1, 4.9, 0]
        ]
    },
    'Industrial Loft': {
        walls: [
            [-4.9, 2.5, 0, 0.2, 5, 10, '#555555', 'piedra'],
            [4.9, 2.5, 0, 0.2, 5, 10, '#555555', 'piedra'],
            [0, 2.5, -4.9, 10, 5, 0.2, '#555555', 'piedra'],
            [-3, 2.5, 4.9, 4, 5, 0.2, '#555555', 'piedra'],
            [3, 2.5, 4.9, 4, 5, 0.2, '#555555', 'piedra'],
            [0, 3.55, 4.9, 2, 2.9, 0.2, '#555555', 'piedra'],
        ],
        beams: [
            [-5, 5.1, 0, 0.4, 0.4, 10.4, '#111111'],
            [5, 5.1, 0, 0.4, 0.4, 10.4, '#111111'],
            [0, 5.1, -5, 10.4, 0.4, 0.4, '#111111'],
            [0, 5.1, 5, 10.4, 0.4, 0.4, '#111111'],
            [-5, 2.5, -5, 0.4, 5.4, 0.4, '#111111'],
            [5, 2.5, -5, 0.4, 5.4, 0.4, '#111111'],
            [-5, 2.5, 5, 0.4, 5.4, 0.4, '#111111'],
            [5, 2.5, 5, 0.4, 5.4, 0.4, '#111111'],
        ],
        floors: [
            [0, 0.1, 0, 10, 0.2, 10, 'adoquines'],
            [0, 5.3, 0, 10, 0.2, 10, 'ceramica']
        ],
        glass: [
            [-2, 2.5, 5, 1.5, 2, 0.1],
            [2, 2.5, 5, 1.5, 2, 0.1]
        ],
        doors: [
            [0, 1.1, 4.9, 0]
        ]
    }
};

type ToolMode = 'CONSTRUIR' | 'MOVER' | 'ROTAR' | 'ESCALAR' | 'BORRAR' | 'TERRENO' | 'CAMARA' | 'EXPLORAR';

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

// ================= SKETCHFAB EMBED =================
function SketchfabEmbed({ uid, isExplore }: { uid: string, isExplore: boolean }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const existingScript = document.getElementById('sketchfab-script');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'sketchfab-script';
            script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            document.body.appendChild(script);
        } else {
            setScriptLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (scriptLoaded && iframeRef.current && (window as any).Sketchfab) {
            var client = new (window as any).Sketchfab(iframeRef.current);
            client.init(uid, {
                success: function onSuccess(api: any) {
                    api.start();
                    console.log('Modelo de Sketchfab cargado con éxito en la sala');
                },
                error: function onError() {
                    console.log('Error al cargar el modelo de Sketchfab');
                },
                autostart: 1,
                ui_controls: 1,
                ui_infos: 0,
                ui_watermark: 0,
                transparent: 1
            });
        }
    }, [uid, scriptLoaded]);

    return (
        <Html transform occlude distanceFactor={5} position={[0, 0.5, 0]}>
            <div style={{ width: '400px', height: '400px', pointerEvents: isExplore ? 'auto' : 'none', background: 'transparent' }}>
                <iframe
                    id={`api-frame-${uid}`}
                    ref={iframeRef}
                    title={`Sketchfab-${uid}`}
                    style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                />
            </div>
        </Html>
    );
}

// ================= PLANTILLAS PREFABRICADAS =================
function TemplateDoor({ position, rotationY, itemRotationY, isExplore, texture }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const currentRotY = useRef(rotationY);
    const bodyRef = useRef<any>(null);
    const meshRef = useRef<any>(null);

    useFrame((state, delta) => {
        const target = isOpen ? rotationY + Math.PI / 2 : rotationY;
        currentRotY.current = THREE.MathUtils.lerp(currentRotY.current, target, delta * 5);
        
        if (bodyRef.current && isExplore) {
            const worldRotY = itemRotationY + currentRotY.current;
            bodyRef.current.setNextKinematicRotation(
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, worldRotY, 0))
            );
        } else if (meshRef.current && !isExplore) {
            meshRef.current.rotation.y = currentRotY.current;
        }
    });

    return (
        <RigidBody 
            type={isExplore ? 'kinematicPositionBased' : 'fixed'}
            position={position}
            ref={bodyRef}
        >
            <group ref={meshRef} position={[0,0,0]} rotation={[0, rotationY, 0]}>
                <group position={[0.6, 0, 0]}>
                    <mesh position={[-0.6, 0, 0]} castShadow receiveShadow onClick={(e) => { e.stopPropagation(); if (isExplore) setIsOpen(!isOpen); }}>
                        <boxGeometry args={[1.2, 2, 0.1]} />
                        <meshStandardMaterial map={texture} />
                    </mesh>
                </group>
            </group>
        </RigidBody>
    );
}

const sjColors = {
  bg: '#050814',
  woodDark: '#2b1b11',
  woodLight: '#d2a679',
  shoji: '#fffae6',
  neonPink: '#ff1493',
  neonBlue: '#00ffff',
  stone: '#4a5054',
  water: '#00aaff',
  leaves: '#ff99cc',
  bamboo: '#8f9779',
  candle: '#ffaa00'
};

function buildMergedGeometry(configs: any[]) {
    const geos = configs.map(c => {
        let geo;
        if (c.type === 'box') geo = new THREE.BoxGeometry(...(c.args || []));
        else if (c.type === 'plane') geo = new THREE.PlaneGeometry(...(c.args || []));
        else if (c.type === 'cylinder') geo = new THREE.CylinderGeometry(...(c.args || []));
        else geo = new THREE.BoxGeometry();

        const mat = new THREE.Matrix4();
        mat.compose(
            c.position ? new THREE.Vector3(...c.position) : new THREE.Vector3(),
            c.rotation ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...c.rotation)) : new THREE.Quaternion(),
            c.scale ? new THREE.Vector3(...c.scale) : new THREE.Vector3(1, 1, 1)
        );
        geo.applyMatrix4(mat);
        return geo;
    });
    return mergeGeometries(geos);
}

function SakuraPetals() {
  const count = 150;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = Math.random() * 8 + 2;
      const z = (Math.random() - 0.5) * 10;
      const speed = Math.random() * 0.02 + 0.01;
      temp.push({ x, y, z, speed });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      particle.x += Math.sin(particle.y) * 0.01;
      if (particle.y < 0) particle.y = 8;

      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.rotation.x += particle.speed;
      dummy.rotation.y += particle.speed;
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current.instanceMatrix) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0, 0, -15]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial color={sjColors.leaves} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function SantuarioJaponesColliders({ tex }: { tex: any }) {
  return (
    <group>
        {/* MainHouse - Two Floors */}
        <group position={[0, 0.5, 0]}>
          {/* Base / First Floor Foundation */}
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[30, 0.5, 20]} />
            <meshStandardMaterial map={tex.woodLight} bumpMap={tex.woodLight} bumpScale={0.05} roughness={0.8} metalness={0.1} />
          </mesh>
          <mesh position={[0, -0.25, 10.1]} castShadow receiveShadow>
            <boxGeometry args={[30.2, 0.1, 0.1]} />
            <meshStandardMaterial color={sjColors.neonPink} emissive={sjColors.neonPink} emissiveIntensity={2} />
          </mesh>

          {/* FIRST FLOOR */}
          {/* Living Room */}
          <group position={[-5, 0, 2]}>
            {/* Main Table */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[6, 0.2, 3]} />
              <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} />
            </mesh>
            {/* Cushions */}
            <mesh position={[0, 0.1, 2.5]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#884444" /></mesh>
            <mesh position={[2, 0.1, 2.5]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#884444" /></mesh>
            <mesh position={[-2, 0.1, 2.5]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#884444" /></mesh>
            <mesh position={[0, 0.1, -2.5]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#884444" /></mesh>
            <mesh position={[2, 0.1, -2.5]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#884444" /></mesh>
            <mesh position={[-2, 0.1, -2.5]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#884444" /></mesh>
          </group>

          {/* Kitchen & Dining */}
          <group position={[5, 0, 2]}>
            {/* Kitchen Counter */}
            <mesh position={[3, 0.5, -2]} castShadow receiveShadow><boxGeometry args={[4, 1, 2]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} /></mesh>
            {/* Dining Table */}
            <mesh position={[-1, 0.5, 3]} castShadow receiveShadow><boxGeometry args={[5, 0.2, 3]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} /></mesh>
            {/* Dining Chairs (Stools) */}
            <mesh position={[-1, 0.25, 5]} castShadow receiveShadow><cylinderGeometry args={[0.3, 0.3, 0.5]} /><meshStandardMaterial map={tex.woodLight} bumpMap={tex.woodLight} bumpScale={0.05} /></mesh>
            <mesh position={[1, 0.25, 5]} castShadow receiveShadow><cylinderGeometry args={[0.3, 0.3, 0.5]} /><meshStandardMaterial map={tex.woodLight} bumpMap={tex.woodLight} bumpScale={0.05} /></mesh>
            <mesh position={[-3, 0.25, 5]} castShadow receiveShadow><cylinderGeometry args={[0.3, 0.3, 0.5]} /><meshStandardMaterial map={tex.woodLight} bumpMap={tex.woodLight} bumpScale={0.05} /></mesh>
          </group>

          {/* First Floor Bathroom */}
          <group position={[10, 0, -5]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[4, 1, 3]} /><meshStandardMaterial color="#222" /></mesh>
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow><boxGeometry args={[3.8, 0.1, 2.8]} /><meshPhysicalMaterial color={sjColors.water} emissive={sjColors.water} emissiveIntensity={0.2} transmission={0.9} roughness={0.0} ior={1.33} thickness={2} clearcoat={1} transparent opacity={1} /></mesh>
            <mesh position={[-3, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 3, 6]} /><meshStandardMaterial color={sjColors.shoji} transparent opacity={0.7} roughness={0.4} /></mesh>
          </group>

          {/* First Floor Bedrooms (Shoji sliding doors) */}
          <group position={[-10, 0, -5]}>
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow><boxGeometry args={[4, 0.2, 5]} /><meshStandardMaterial color="#eeeeee" /></mesh>
            <mesh position={[3, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 3, 8]} /><meshStandardMaterial color={sjColors.shoji} transparent opacity={0.7} roughness={0.4} /></mesh>
          </group>

          {/* SECOND FLOOR */}
          <group position={[0, 3, 0]}>
             {/* Floor 2 Base */}
             <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[26, 0.2, 16]} />
                <meshStandardMaterial map={tex.woodLight} bumpMap={tex.woodLight} bumpScale={0.05} roughness={0.8} />
             </mesh>
             
             {/* Second Floor Master Bedroom */}
             <group position={[-6, 0, 0]}>
                <mesh position={[0, 0.1, 0]} castShadow receiveShadow><boxGeometry args={[6, 0.2, 8]} /><meshStandardMaterial color="#eeeeee" /></mesh>
                <mesh position={[4, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 3, 10]} /><meshStandardMaterial color={sjColors.shoji} transparent opacity={0.7} roughness={0.4} /></mesh>
             </group>

             {/* Second Floor Bathroom */}
             <group position={[8, 0, 0]}>
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[4, 1, 4]} /><meshStandardMaterial color="#222" /></mesh>
                <mesh position={[0, 0.9, 0]} castShadow receiveShadow><boxGeometry args={[3.8, 0.1, 3.8]} /><meshPhysicalMaterial color={sjColors.water} emissive={sjColors.water} emissiveIntensity={0.2} transmission={0.9} roughness={0.0} ior={1.33} thickness={2} clearcoat={1} transparent opacity={1} /></mesh>
                <mesh position={[-4, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 3, 8]} /><meshStandardMaterial color={sjColors.shoji} transparent opacity={0.7} roughness={0.4} /></mesh>
             </group>
          </group>

          {/* Roof */}
          <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
            <coneGeometry args={[20, 4, 4]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
          <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 0.2, 22]} />
            <meshStandardMaterial color={sjColors.neonBlue} emissive={sjColors.neonBlue} emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Backyard */}
        <group position={[0, 0, -15]}>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[12, 8]} />
            <meshPhysicalMaterial color={sjColors.water} emissive={sjColors.water} emissiveIntensity={0.2} transmission={0.9} roughness={0.0} ior={1.33} thickness={2} clearcoat={1} transparent opacity={1} />
          </mesh>
          <mesh position={[0, 0.2, 4]} castShadow receiveShadow><boxGeometry args={[12, 0.5, 1]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
          <mesh position={[0, 0.2, -4]} castShadow receiveShadow><boxGeometry args={[12, 0.5, 1]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>

          <group position={[0, 0.5, 0]}>
            <mesh position={[0, 0, 0]} castShadow receiveShadow><boxGeometry args={[2, 1, 3]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
            <mesh position={[0, 1, 1]} castShadow receiveShadow><boxGeometry args={[1.5, 1.5, 1.5]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
            <mesh position={[0, 1.5, 2]} castShadow receiveShadow><boxGeometry args={[1, 1, 2]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
            <mesh position={[0.3, 1.6, 2.5]} castShadow receiveShadow><sphereGeometry args={[0.1]} /><meshStandardMaterial color={sjColors.neonPink} emissive={sjColors.neonPink} emissiveIntensity={2} /></mesh>
            <mesh position={[-0.3, 1.6, 2.5]} castShadow receiveShadow><sphereGeometry args={[0.1]} /><meshStandardMaterial color={sjColors.neonPink} emissive={sjColors.neonPink} emissiveIntensity={2} /></mesh>
          </group>

          <group position={[-7, 0, 0]}>
            <mesh position={[0, 3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.5, 0.8, 6]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[0, 6, 0]} castShadow receiveShadow><sphereGeometry args={[4, 16, 16]} /><meshStandardMaterial color={sjColors.leaves} roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.9} /></mesh>
          </group>

          <group position={[6, 0, 0]}>
            <mesh position={[-2, 2, -2]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[2, 2, -2]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[-2, 2, 2]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[2, 2, 2]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[0, 4, 0]} castShadow receiveShadow><boxGeometry args={[5, 0.2, 5]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
          </group>

          <group position={[-10, 0, -8]}>
            <mesh position={[0, 2, 0]} castShadow receiveShadow><boxGeometry args={[6, 4, 6]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[0, 1.5, 3.01]} castShadow receiveShadow><planeGeometry args={[1.5, 3]} /><meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={2.0} /></mesh>
          </group>

          <mesh position={[0, 5, -10]} rotation={[0, 0, 0]} castShadow receiveShadow>
            <planeGeometry args={[6, 10]} />
            <meshPhysicalMaterial color="#88ddff" emissive="#00aaff" emissiveIntensity={2.0} transmission={0.9} roughness={0.0} ior={1.33} thickness={2} clearcoat={1} transparent opacity={1} />
          </mesh>
        </group>

        {/* MysticCave */}
        <group position={[25, 0, -10]}>
          <mesh position={[0, 2, 0]} receiveShadow>
            <dodecahedronGeometry args={[12, 1]} />
            <meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} color="#555" roughness={0.9} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <dodecahedronGeometry args={[12.5, 1]} />
            <meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} color="#444" roughness={1} />
          </mesh>
          <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[8, 32]} />
            <meshPhysicalMaterial color={sjColors.water} emissive={sjColors.water} emissiveIntensity={0.2} transmission={0.9} roughness={0.0} ior={1.33} thickness={2} clearcoat={1} transparent opacity={1} />
          </mesh>
          <mesh position={[7, 0.8, 0]} castShadow receiveShadow><boxGeometry args={[1.5, 0.5, 4]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
          <mesh position={[-7, 0.8, 0]} castShadow receiveShadow><boxGeometry args={[1.5, 0.5, 4]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
        </group>

        {/* EnvironmentAndPaths */}
        <group>
          <group position={[0, 0, 15]}>
            <mesh position={[-4, 4, 0]} castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 8]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[4, 4, 0]} castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 8]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[0, 7, 0]} castShadow receiveShadow><boxGeometry args={[10, 0.6, 0.6]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[0, 8.2, 0]} castShadow receiveShadow><boxGeometry args={[12, 0.8, 0.8]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} metalness={0.1} /></mesh>
            <mesh position={[0, 8.2, 0.45]} castShadow receiveShadow><boxGeometry args={[12.2, 0.1, 0.1]} /><meshStandardMaterial color={sjColors.neonPink} emissive={sjColors.neonPink} emissiveIntensity={2} /></mesh>
          </group>

          {/* Border Fences - Merged */}
          <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry(Array.from({ length: 40 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 3], position: [-15 + (i * 0.8), 1.5, 12] }))), [])}>
             <meshStandardMaterial map={tex.bamboo} bumpMap={tex.bamboo} bumpScale={0.05} roughness={0.8} />
          </mesh>

          {/* Border Trees (Sakuras) around the lot - Merged Trunks */}
          <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry(Array.from({ length: 15 }).map((_, i) => ({ type: 'cylinder', args: [0.4, 0.6, 6], position: [-18 + (i * 2.5), 3, -18 + Math.sin(i) * 3] }))), [])}>
             <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.9} />
          </mesh>
          {/* Border Trees (Sakuras) around the lot - Merged Leaves */}
          <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry(Array.from({ length: 15 }).map((_, i) => ({ type: 'box', args: [6, 6, 6], position: [-18 + (i * 2.5), 6, -18 + Math.sin(i) * 3] }))), [])}>
             <meshStandardMaterial color={sjColors.leaves} roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>

          {/* Paths - Merged */}
          <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry([
             ...Array.from({ length: 10 }).map((_, i) => ({ type: 'plane', args: [1.5, 1], position: [0, 0.05, 8 + (i * 0.7)], rotation: [-Math.PI / 2, 0, Math.sin(i)] })),
             ...Array.from({ length: 25 }).map((_, i) => ({ type: 'plane', args: [1.2, 1], position: [5 + (i * 0.8), 0.05, 0 - (i * 0.4)], rotation: [-Math.PI / 2, 0, Math.cos(i)] }))
          ] as any[]), [])}>
             <meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} />
          </mesh>
          
          <group position={[8, 0.5, 2]}>
            <mesh position={[0, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 1, 0.6]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow><coneGeometry args={[0.6, 0.6, 4]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.05} roughness={0.9} /></mesh>
          </group>
        </group>
    </group>
  );
}

function SantuarioJaponesLights() {
    return (
        <group>
            {/* Global Ilumination & Ambient Occlusion support */}
            <hemisphereLight skyColor={sjColors.bg} groundColor="#1c1008" intensity={0.6} />
            <fog attach="fog" args={[sjColors.bg, 20, 90]} />

            {/* Ambient subtle neon */}
            <pointLight position={[0, 4, 3]} color={sjColors.neonPink} intensity={1} distance={15} />

            {/* Pergola Light */}
            <group position={[0, 0, -15]}>
                <group position={[6, 0, 0]}>
                    <mesh position={[0, 3.5, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 0.5]} />
                        <meshStandardMaterial color={sjColors.candle} emissive={sjColors.candle} emissiveIntensity={2} />
                        <pointLight color={sjColors.candle} intensity={3} distance={15} />
                    </mesh>
                </group>
                {/* Onsen warm light */}
                <pointLight position={[0, 1, 0]} color={sjColors.candle} intensity={1.5} distance={10} />
            </group>

            {/* Cave Lights */}
            <group position={[25, 0, -10]}>
                <spotLight position={[0, 15, 0]} angle={0.4} penumbra={0.5} intensity={8} color="#add8e6" castShadow />
                <pointLight position={[0, 3, 0]} color={sjColors.water} intensity={2} distance={20} />
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                    <group position={[3, 0.6, 2]}>
                    <mesh><cylinderGeometry args={[0.1, 0.1, 0.3]} /><meshStandardMaterial color="#fff" emissive={sjColors.candle} emissiveIntensity={2.5} /></mesh>
                    <pointLight color={sjColors.candle} intensity={2} distance={10} />
                    </group>
                </Float>
                <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.6}>
                    <group position={[-4, 0.6, -3]}>
                    <mesh><cylinderGeometry args={[0.1, 0.1, 0.3]} /><meshStandardMaterial color="#fff" emissive={sjColors.candle} emissiveIntensity={2.5} /></mesh>
                    <pointLight color={sjColors.candle} intensity={2} distance={10} />
                    </group>
                </Float>
            </group>

            {/* Path Lights */}
            <group position={[8, 0.5, 2]}>
                <pointLight position={[0, 0.8, 0]} color={sjColors.neonBlue} intensity={2} distance={8} />
            </group>

            {/* Torii pink light */}
            <group position={[0, 8, 15]}>
                <pointLight color={sjColors.neonPink} intensity={2} distance={12} />
            </group>
        </group>
    );
}

function HousePrefab({ item, isExplore, onSelect, onTransformEnd, isSelected, toolMode }: any) {
    if (item.subType === 'Ryokan Neofuturista') return <RyokanNeo item={item} isExplore={isExplore} onSelect={onSelect} onTransformEnd={onTransformEnd} isSelected={isSelected} toolMode={toolMode} />;
    const parentGroupRef = useRef<THREE.Group>(null);

    const sjTextures = useMemo(() => {
        if (item.subType !== 'Santuario Japonés') return null;
        const createTex = (color1: string, color2: string, type: 'wood' | 'stone') => {
            const c = document.createElement('canvas');
            c.width = 256; c.height = 256;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = color1;
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = color2;
            
            if (type === 'wood') {
                for(let i=0; i<200; i++) {
                    ctx.fillRect(0, Math.random()*256, 256, Math.random()*4+1);
                }
            } else {
                for(let i=0; i<800; i++) {
                    ctx.fillStyle = Math.random() > 0.5 ? color2 : (color1 === sjColors.stone ? '#5a6064' : color1);
                    ctx.fillRect(Math.random()*256, Math.random()*256, Math.random()*5+1, Math.random()*5+1);
                }
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        };

        return {
            woodDark: createTex(sjColors.woodDark, '#1c1008', 'wood'),
            woodLight: createTex(sjColors.woodLight, '#b88a5e', 'wood'),
            stone: createTex(sjColors.stone, '#3a4044', 'stone'),
            bamboo: createTex(sjColors.bamboo, '#7a8264', 'wood'),
        };
    }, [item.subType]);

    if (item.subType === 'Santuario Japonés') {
        return (
            <group 
                ref={parentGroupRef} 
                position={item.position as [number, number, number]} 
                rotation={item.rotation as [number, number, number]} 
                onClick={(e) => { if (!isExplore) { e.stopPropagation(); onSelect(item.id); } }}
            >
                <RigidBody type="fixed" colliders="trimesh">
                   <SantuarioJaponesColliders tex={sjTextures} />
                </RigidBody>
                <SantuarioJaponesLights />
                <SakuraPetals />

                {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR' || toolMode === 'ESCALAR') && (
                    <TransformControls 
                        object={parentGroupRef} 
                        mode={toolMode === 'MOVER' ? 'translate' : toolMode === 'ROTAR' ? 'rotate' : 'scale'} 
                        onMouseUp={(e) => {
                            if (parentGroupRef.current) { const pos = [parentGroupRef.current.position.x, parentGroupRef.current.position.y, parentGroupRef.current.position.z]; const rot = [parentGroupRef.current.rotation.x, parentGroupRef.current.rotation.y, parentGroupRef.current.rotation.z]; const scale = [parentGroupRef.current.scale.x, parentGroupRef.current.scale.y, parentGroupRef.current.scale.z]; onTransformEnd(item.id, pos, rot, scale); 
                                
                            }
                        }} 
                    />
                )}
                {isSelected && <Outlines thickness={2} color="#D4AF37" />}
            </group>
        );
    }

    const data = HOUSE_DATA[item.subType];
    if (!data) return null;
    
    // Load textures
    const loadedTextures = useMemo(() => {
        const result: Record<string, THREE.Texture> = {};
        Object.keys(textures).forEach((key) => {
            const img = new Image();
            img.src = (textures as any)[key];
            const tex = new THREE.Texture(img);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            // House scale is mostly 1, so texture repeat can just be hardcoded or tied to size, but standard 1x1 is fine
            img.onload = () => tex.needsUpdate = true;
            result[key] = tex;
        });
        return result;
    }, []);

    return (
        <group 
            ref={parentGroupRef} 
            position={item.position as [number, number, number]} 
            rotation={item.rotation as [number, number, number]} 
            onClick={(e) => { if (!isExplore) { e.stopPropagation(); onSelect(item.id); } }}
        >
            <RigidBody type="fixed" colliders="trimesh">
                <group>
                    {data.walls?.map((w: any, i: number) => (
                        <mesh key={`w-${i}`} position={[w[0], w[1], w[2]]} castShadow receiveShadow>
                            <boxGeometry args={[w[3], w[4], w[5]]} />
                            <meshStandardMaterial color={w[6] || '#ffffff'} map={w[7] ? loadedTextures[w[7]] : undefined} />
                        </mesh>
                    ))}
                    {data.floors?.map((f: any, i: number) => (
                        <mesh key={`f-${i}`} position={[f[0], f[1], f[2]]} castShadow receiveShadow>
                            <boxGeometry args={[f[3], f[4], f[5]]} />
                            <meshStandardMaterial map={f[6] ? loadedTextures[f[6]] : undefined} />
                        </mesh>
                    ))}
                    {data.roofs?.map((r: any, i: number) => (
                        <mesh key={`r-${i}`} position={[r[0], r[1], r[2]]} rotation={[0, 0, r[7]]} castShadow receiveShadow>
                            <boxGeometry args={[r[3], r[4], r[5]]} />
                            <meshStandardMaterial color={r[6]} />
                        </mesh>
                    ))}
                    {data.chimneys?.map((c: any, i: number) => (
                        <mesh key={`c-${i}`} position={[c[0], c[1], c[2]]} castShadow receiveShadow>
                            <boxGeometry args={[c[3], c[4], c[5]]} />
                            <meshStandardMaterial map={loadedTextures[c[6]]} />
                        </mesh>
                    ))}
                    {data.beams?.map((b: any, i: number) => (
                        <mesh key={`b-${i}`} position={[b[0], b[1], b[2]]} castShadow receiveShadow>
                            <boxGeometry args={[b[3], b[4], b[5]]} />
                            <meshStandardMaterial color={b[6]} />
                        </mesh>
                    ))}
                    {/* Invisible physics ramps for stairs */}
                    {data.stairs?.map((s: any, i: number) => (
                        <group key={`s-${i}`} position={[s[0], s[1], s[2]]} rotation={[0, s[3], 0]}>
                            <mesh rotation={[Math.PI/4, 0, 0]} visible={false}>
                                <boxGeometry args={[2, 4.2, 0.5]} />
                                <meshStandardMaterial />
                            </mesh>
                        </group>
                    ))}
                </group>
            </RigidBody>

            {/* Non-colliding visible glass panels */}
            {data.glass?.map((g: any, i: number) => (
                <mesh key={`g-${i}`} position={[g[0], g[1], g[2]]} castShadow receiveShadow>
                    <boxGeometry args={[g[3], g[4], g[5]]} />
                    <meshStandardMaterial color="black" transparent opacity={0.4} />
                </mesh>
            ))}

            {/* Visible stairs (no physics to prevent bumping) */}
            {data.stairs?.map((s: any, i: number) => (
                <group key={`vs-${i}`} position={[s[0], s[1], s[2]]} rotation={[0, s[3], 0]}>
                    <mesh rotation={[Math.PI/4, 0, 0]}>
                        <boxGeometry args={[2, 4.2, 0.3]} />
                        <meshStandardMaterial color="#555555" />
                    </mesh>
                </group>
            ))}

            {/* Interactive Doors */}
            {data.doors?.map((d: any, i: number) => (
                <TemplateDoor 
                    key={`d-${i}`}
                    position={[d[0], d[1], d[2]]}
                    rotationY={d[3]}
                    itemRotationY={item.rotation[1]}
                    isExplore={isExplore}
                    texture={loadedTextures.madera}
                />
            ))}

            {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR' || toolMode === 'ESCALAR') && (
                <TransformControls 
                    object={parentGroupRef} 
                    mode={toolMode === 'MOVER' ? 'translate' : toolMode === 'ROTAR' ? 'rotate' : 'scale'} 
                    onMouseUp={(e) => {
                        if (parentGroupRef.current) { const pos = [parentGroupRef.current.position.x, parentGroupRef.current.position.y, parentGroupRef.current.position.z]; const rot = [parentGroupRef.current.rotation.x, parentGroupRef.current.rotation.y, parentGroupRef.current.rotation.z]; const scale = [parentGroupRef.current.scale.x, parentGroupRef.current.scale.y, parentGroupRef.current.scale.z]; onTransformEnd(item.id, pos, rot, scale); 
                            
                        }
                    }} 
                />
            )}
            
            {isSelected && <Outlines thickness={2} color="#D4AF37" />}
        </group>
    );
}

// ================= OBJETOS COLOCADOS =================
function PlacedObject({ item, isSelected, onSelect, onTransformEnd, toolMode, customAssets }: any) {
    if (item.category === 'Plantillas') {
        return <HousePrefab item={item} isExplore={toolMode === 'EXPLORAR'} onSelect={onSelect} onTransformEnd={onTransformEnd} isSelected={isSelected} toolMode={toolMode} />;
    }

    const meshRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<any>(null);
    const isExplore = toolMode === 'EXPLORAR';
    
    // Check custom asset
    const isCustom = item.subType.startsWith('Custom: ');
    const customName = item.subType.replace('Custom: ', '');
    const customAsset = isCustom ? customAssets?.find((a: any) => a.name === customName) : null;
    
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
        if (customAsset && customAsset.type === 'texture' && customAsset.blobUrl) {
            url = customAsset.blobUrl;
        } else if (item.subType.includes('Ladrillo')) url = textures.ladrillo;
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
    
    if (customAsset && customAsset.type === 'sketchfab' && customAsset.sketchfabUid) {
        geometryNode = (
            <group>
                <SketchfabEmbed uid={customAsset.sketchfabUid} isExplore={isExplore} />
                <mesh visible={!isExplore}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="#1CAAD9" wireframe transparent opacity={0.5} />
                </mesh>
            </group>
        );
    } else if (customAsset && customAsset.type === 'model' && customAsset.blobUrl) {
        geometryNode = (
            <React.Suspense fallback={<boxGeometry args={[1, 1, 1]} />}>
                <GLTFModel url={customAsset.blobUrl + '#fake.glb'} scale={1} />
            </React.Suspense>
        );
    } else if (item.category === 'Puertas') {
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
        } else if (item.subType === 'Vela') {
             geometryNode = (
                <group position={[0, 0.15, 0]}>
                    <mesh><cylinderGeometry args={[0.1, 0.1, 0.3]} /><meshStandardMaterial color={item.color} /></mesh>
                    <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={2} /></mesh>
                </group>
             );
        } else if (item.subType === 'Farol Japonés') {
             geometryNode = (
                <group position={[0, 0.5, 0]}>
                    <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.4, 0.2, 0.4]} /><meshStandardMaterial color="#333" /></mesh>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[0.3, 0.6, 0.3]} /><meshStandardMaterial color={item.color} emissive={item.emissiveIntensity > 0 ? item.color : undefined} emissiveIntensity={item.emissiveIntensity || 0} /></mesh>
                    <mesh position={[0, 0.35, 0]}><coneGeometry args={[0.4, 0.3, 4]} /><meshStandardMaterial color="#222" /></mesh>
                </group>
             );
        }
    } else if (item.category === 'Vegetación') {
        if (item.subType === 'Árbol Sakura') {
            geometryNode = (
                <group position={[0, 1.5, 0]}>
                    <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.2, 0.3, 2]} /><meshStandardMaterial color="#4a2e15" /></mesh>
                    <mesh position={[0, 1, 0]}><sphereGeometry args={[1.5, 16, 16]} /><meshStandardMaterial color="#ffb7c5" transparent opacity={0.9} /></mesh>
                    <mesh position={[0.8, 0.5, 0]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color="#ffb7c5" transparent opacity={0.9} /></mesh>
                    <mesh position={[-0.8, 0.7, 0]}><sphereGeometry args={[1.2, 16, 16]} /><meshStandardMaterial color="#ffb7c5" transparent opacity={0.9} /></mesh>
                </group>
            );
        } else if (item.subType === 'Bambú') {
            geometryNode = (
                <group position={[0, 1.5, 0]}>
                    <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 3]} /><meshStandardMaterial color="#556b2f" /></mesh>
                    <mesh position={[0.2, -0.2, 0.1]}><cylinderGeometry args={[0.04, 0.04, 2.5]} /><meshStandardMaterial color="#6b8e23" /></mesh>
                    <mesh position={[-0.15, -0.5, -0.1]}><cylinderGeometry args={[0.06, 0.06, 2]} /><meshStandardMaterial color="#556b2f" /></mesh>
                </group>
            );
        } else if (item.subType === 'Roca Musgo') {
            geometryNode = (
                <mesh position={[0, 0.3, 0]}>
                    <dodecahedronGeometry args={[0.6, 1]} />
                    <meshStandardMaterial color="#4f5e4d" roughness={0.9} />
                </mesh>
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
            {(item.category !== 'Mobiliario' && item.category !== 'Electrodomésticos' && item.category !== 'Electrónica' && item.category !== 'Puertas' && item.category !== 'Ventanas' && item.category !== 'Escaleras' && !(customAsset && (customAsset.type === 'model' || customAsset.type === 'sketchfab'))) ? (
                <mesh castShadow receiveShadow>
                    {geometryNode}
                    <meshStandardMaterial 
                        color={item.color} 
                        emissive={item.emissiveIntensity > 0 ? item.color : undefined}
                        emissiveIntensity={item.emissiveIntensity || 0}
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
            
            {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR' || toolMode === 'ESCALAR') && toolMode !== 'MOVER' && toolMode !== 'ROTAR' && <Outlines thickness={0.05} color="#D4AF37" />}
        </group>
    );

    if (item.isVisible === false && isExplore) return null;

    if (isExplore) {
        let colliders: any = 'cuboid';
        if (item.category === 'Escaleras' || item.category === 'Vegetación') colliders = 'hull';
        if (item.hasCollisions === false) colliders = false;
        
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
            {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR' || toolMode === 'ESCALAR') && (
                <TransformControls 
                    object={meshRef} 
                    mode={toolMode === 'MOVER' ? 'translate' : toolMode === 'ROTAR' ? 'rotate' : 'scale'}
                    onMouseUp={() => {
                        if (meshRef.current) {
                            const newPos: [number,number,number] = [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z];
                            const newRot: [number,number,number] = [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z];
                            const newScale: [number,number,number] = [meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z];
                            onTransformEnd(item.id, newPos, newRot, newScale);
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
  const hasAccess = true; // user && user.username === 'Axiss';

  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(() => {
    const saved = localStorage.getItem('builder3d_items_v2');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : [{ id: 'default-ryokan', category: 'Plantillas', subType: 'Ryokan Neofuturista', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffffff', emissiveIntensity: 0 }];
  });
  
  const [terrainHeights, setTerrainHeights] = useState<number[]>(() => {
    const saved = localStorage.getItem('builder3d_terrain_v2');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : [{ id: 'default-ryokan', category: 'Plantillas', subType: 'Ryokan Neofuturista', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#ffffff', emissiveIntensity: 0 }];
  });
  
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>([]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'url_file' | 'sketchfab'>('url_file');
  const [sketchfabUid, setSketchfabUid] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState(CATEGORIES[0].id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveSketchfab = async () => {
      if (!sketchfabUid || !newAssetName) return;
      try {
          const id = Math.random().toString(36).substring(7);
          const newAsset: CustomAsset = { 
              id, 
              name: newAssetName, 
              category: newAssetCategory, 
              type: 'sketchfab',
              sketchfabUid 
          };
          const newMetadata = [...customAssets, newAsset].map(({blobUrl, ...rest}) => rest);
          await localforage.setItem('custom_assets_metadata', newMetadata);
          setCustomAssets(prev => [...prev, newAsset]);
          setIsAssetModalOpen(false);
          setSketchfabUid('');
          setNewAssetName('');
          showToast(`¡Modelo de Sketchfab ${newAssetName} guardado con éxito!`);
      } catch (err: any) {
          setDownloadError('Error al guardar el asset de Sketchfab.');
      }
  };

  useEffect(() => {
      localforage.getItem<CustomAsset[]>('custom_assets_metadata').then(async (metadata) => {
          if (metadata) {
              const loadedAssets = await Promise.all(metadata.map(async (m) => {
                  if (m.type === 'sketchfab') return m;
                  const blob = await localforage.getItem<Blob>(`asset_${m.id}`);
                  if (blob) {
                      return { ...m, blobUrl: URL.createObjectURL(blob) };
                  }
                  return m;
              }));
              setCustomAssets(loadedAssets.filter(a => a.blobUrl || a.type === 'sketchfab'));
          }
      });
  }, []);

  useEffect(() => {
      if (newAssetUrl) {
          const url = newAssetUrl.toLowerCase();
          if (url.match(/\.(glb|gltf)$/i)) {
              if (newAssetCategory !== 'Mobiliario' && newAssetCategory !== 'Plantillas' && newAssetCategory !== 'Puertas') {
                  setNewAssetCategory('Mobiliario');
              }
          } else if (url.match(/\.(jpg|jpeg|png)$/i)) {
              if (newAssetCategory !== 'Pisos' && newAssetCategory !== 'Paredes') {
                  setNewAssetCategory('Pisos');
              }
          }
      }
  }, [newAssetUrl]);

  const handleDownloadAsset = async () => {
      if (!newAssetUrl || !newAssetName) return;
      setIsDownloading(true);
      setDownloadError('');
      try {
          const type = newAssetUrl.toLowerCase().match(/\.(glb|gltf)$/i) ? 'model' : 'texture';
          const res = await fetch(newAssetUrl);
          if (!res.ok) throw new Error('Error de red al descargar (¿Problema de CORS?)');
          const blob = await res.blob();
          
          const id = Math.random().toString(36).substring(7);
          await localforage.setItem(`asset_${id}`, blob);
          
          const newAsset: CustomAsset = { id, name: newAssetName, category: newAssetCategory, type };
          const newMetadata = [...customAssets, newAsset].map(({blobUrl, ...rest}) => rest);
          await localforage.setItem('custom_assets_metadata', newMetadata);
          
          setCustomAssets(prev => [...prev, { ...newAsset, blobUrl: URL.createObjectURL(blob) }]);
          setIsAssetModalOpen(false);
          setNewAssetUrl('');
          setNewAssetName('');
          showToast(`¡${newAssetName} descargado con éxito!`);
      } catch (err: any) {
          setDownloadError(err.message || 'Error al descargar. Verifica que el enlace sea directo y permita CORS.');
          showToast('Error CORS: El servidor externo bloqueó la descarga directa. Usa un enlace compatible o prueba otra fuente.');
      } finally {
          setIsDownloading(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsDownloading(true);
      setDownloadError('');
      
      try {
          const isModel = !!file.name.toLowerCase().match(/\.(glb|gltf)$/i);
          const type = isModel ? 'model' : 'texture';
          const id = Math.random().toString(36).substring(7);
          
          await localforage.setItem(`asset_${id}`, file);
          
          let category = newAssetCategory;
          if (isModel && category !== 'Mobiliario' && category !== 'Plantillas' && category !== 'Puertas' && category !== 'Techos' && category !== 'Escaleras' && category !== 'Piscinas' && category !== 'Ventanas') {
              category = 'Mobiliario';
          } else if (!isModel && category !== 'Pisos' && category !== 'Paredes') {
              category = 'Pisos';
          }
          
          const assetName = newAssetName || file.name.replace(/\.[^/.]+$/, "");

          const newAsset: CustomAsset = { id, name: assetName, category, type };
          const newMetadata = [...customAssets, newAsset].map(({blobUrl, ...rest}) => rest);
          await localforage.setItem('custom_assets_metadata', newMetadata);
          
          setCustomAssets(prev => [...prev, { ...newAsset, blobUrl: URL.createObjectURL(file) }]);
          setIsAssetModalOpen(false);
          setNewAssetUrl('');
          setNewAssetName('');
          showToast(`¡${assetName} cargado con éxito desde el dispositivo!`);
      } catch (err: any) {
          setDownloadError(err.message || 'Error al procesar el archivo local.');
          showToast('Error al procesar el archivo local.');
      } finally {
          setIsDownloading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleDeleteCustomAsset = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm('¿Seguro que quieres borrar este asset?')) return;
      
      await localforage.removeItem(`asset_${id}`);
      const updatedMetadata = customAssets.filter(a => a.id !== id).map(({blobUrl, ...rest}) => rest);
      await localforage.setItem('custom_assets_metadata', updatedMetadata);
      
      setCustomAssets(prev => prev.filter(a => a.id !== id));
      
      const deletedAsset = customAssets.find(a => a.id === id);
      if (deletedAsset && selectedSubType === `Custom: ${deletedAsset.name}`) {
          setSelectedSubType(CATEGORIES[0].items[0]);
          setActiveCategory(CATEGORIES[0].id);
      }
  };
  
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
    localStorage.setItem('builder3d_items_v2', JSON.stringify(placedItems));
    localStorage.setItem('builder3d_terrain_v2', JSON.stringify(terrainHeights));
  }, [placedItems, terrainHeights]);
  
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedSubType, setSelectedSubType] = useState(CATEGORIES[0].items[0]);
  const [toolMode, setToolMode] = useState<ToolMode>('CAMARA');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const isMobile = window.innerWidth < 768;

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
    
    const isCustom = selectedSubType.startsWith('Custom: ');
    const customName = selectedSubType.replace('Custom: ', '');
    const customAsset = customAssets.find(a => a.name === customName);

    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(7),
      category: activeCategory,
      subType: selectedSubType,
      position: [x, y, z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff'
    };
    
    if (customAsset) {
        if (customAsset.type === 'texture') {
            if (activeCategory === 'Pisos') {
               newItem.scale = [3, 0.1, 3];
               newItem.position[1] = y + 0.05;
            } else if (activeCategory === 'Paredes') {
               newItem.scale = [3, 3, 0.2];
               newItem.position[1] = y + 1.5;
            } else {
               newItem.scale = [2, 2, 0.2];
               newItem.position[1] = y + 1;
            }
        } else {
            newItem.position[1] = y;
        }
    } else if (activeCategory === 'Paredes') {
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
       newItem.color = '#ffffff';
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

  const updateSelectedItemProps = (props: Partial<PlacedItem>) => {
    if (!selectedItemId) return;
    saveToHistory();
    setPlacedItems(prev => prev.map(item => item.id === selectedItemId ? { ...item, ...props } : item));
  };
  
  const deleteSelectedItem = () => {
    if (!selectedItemId) return;
    saveToHistory();
    setPlacedItems(prev => prev.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
  };
  
  const duplicateSelectedItem = () => {
    if (!selectedItemId) return;
    saveToHistory();
    const item = placedItems.find(i => i.id === selectedItemId);
    if (item) {
        const newItem = { ...item, id: Math.random().toString(36).substring(7), position: [item.position[0] + 1, item.position[1], item.position[2] + 1] as [number, number, number] };
        setPlacedItems(prev => [...prev, newItem]);
        setSelectedItemId(newItem.id);
    }
  };

  const handleTransformEnd = (id: string, newPos: [number,number,number], newRot: [number,number,number], newScale?: [number,number,number]) => {
      saveToHistory();
      setPlacedItems(prev => prev.map(item => item.id === id ? { ...item, position: newPos, rotation: newRot, scale: newScale || item.scale } : item));
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
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${toolMode === 'ESCALAR' ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}
                    onClick={() => setToolMode('ESCALAR')}
                  >
                    <Move size={16} style={{transform: 'rotate(45deg)'}} /> Escalar
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
                <div className="flex items-center justify-between">
                    <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Catálogo (Sims Mode)</label>
                    <button onClick={() => setIsAssetModalOpen(true)} className="text-[#D4AF37] flex items-center gap-1 text-xs hover:text-white transition-colors">
                        <DownloadCloud size={14} /> Importar
                    </button>
                </div>
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
                        <div className="grid grid-cols-2 gap-2 mt-2 pl-3 pr-2 border-l-2 border-[#D4AF37]/20 ml-4">
                          {cat.items.map(item => (
                            <button
                              key={item}
                              className={`w-full text-center px-2 py-3 rounded-md text-xs font-medium transition-all border ${
                                selectedSubType === item
                                  ? 'bg-[#D4AF37]/20 text-[#E8D9B0] border-[#D4AF37]/50'
                                  : 'bg-black/20 text-gray-400 border-white/5 hover:text-gray-200 hover:bg-white/5'
                              }`}
                              onClick={() => { 
                                setSelectedSubType(item); 
                                setToolMode('CONSTRUIR'); 
                                showToast(`¡${item} añadido al lienzo / inventario!`);
                              }}
                            >
                              {item}
                            </button>
                          ))}
                          
                          {/* Custom Assets for this category */}
                          {customAssets.filter(a => a.category === cat.id).map(asset => (
                            <div
                              key={asset.id}
                              className={`relative group w-full text-center px-2 py-3 rounded-md text-xs font-medium transition-all border cursor-pointer flex items-center justify-center ${
                                selectedSubType === `Custom: ${asset.name}`
                                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50'
                                  : 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/20 border-dashed hover:bg-emerald-500/10'
                              }`}
                              onClick={() => { 
                                setSelectedSubType(`Custom: ${asset.name}`); 
                                setToolMode('CONSTRUIR'); 
                                showToast(`¡${asset.name} añadido al lienzo / inventario!`);
                              }}
                            >
                              <span className="truncate w-full block">{asset.name}</span>
                              <button
                                onClick={(e) => handleDeleteCustomAsset(asset.id, e)}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Eliminar Asset"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
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
            
            {/* PROPERTIES PANEL */}
            {toolMode !== 'EXPLORAR' && selectedItemId && (
                <div className="absolute top-4 right-4 bg-[#121B2A]/90 backdrop-blur border border-white/10 rounded-xl p-5 w-72 z-50 shadow-2xl text-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                        <h3 className="font-bold text-[#D4AF37]">Propiedades</h3>
                        <button onClick={() => setSelectedItemId(null)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 text-xs uppercase font-bold">Color Principal</label>
                        <input 
                           type="color" 
                           value={placedItems.find(i => i.id === selectedItemId)?.color || '#ffffff'}
                           onChange={(e) => updateSelectedItemProps({ color: e.target.value })}
                           className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 text-xs uppercase font-bold">Intensidad Brillo</label>
                        <input 
                           type="range" min="0" max="10" step="0.5"
                           value={(placedItems.find(i => i.id === selectedItemId) as any)?.emissiveIntensity || 0}
                           onChange={(e) => updateSelectedItemProps({ emissiveIntensity: parseFloat(e.target.value) } as any)}
                           className="w-full accent-[#D4AF37]"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="text-gray-400 text-xs uppercase font-bold">Colisiones</label>
                        <input 
                           type="checkbox" 
                           checked={(placedItems.find(i => i.id === selectedItemId) as any)?.hasCollisions !== false}
                           onChange={(e) => updateSelectedItemProps({ hasCollisions: e.target.checked } as any)}
                           className="w-4 h-4 accent-[#D4AF37]"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs uppercase font-bold">Visible</label>
                        <input 
                           type="checkbox" 
                           checked={(placedItems.find(i => i.id === selectedItemId) as any)?.isVisible !== false}
                           onChange={(e) => updateSelectedItemProps({ isVisible: e.target.checked } as any)}
                           className="w-4 h-4 accent-[#D4AF37]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                        <button onClick={duplicateSelectedItem} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 p-2 rounded text-xs font-bold transition-colors">
                            DUPLICAR
                        </button>
                        <button onClick={deleteSelectedItem} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 p-2 rounded text-xs font-bold transition-colors">
                            BORRAR
                        </button>
                    </div>
                </div>
            )}

            <Canvas shadows dpr={isMobile ? [1, 1] : [1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: false }} camera={{ position: [0, 60, 110], fov: 45 }}>
              <color attach="background" args={['#0b132b']} />
              <fogExp2 attach="fog" args={['#0b132b', 0.012]} />
              
              <Physics gravity={[0, -9.81, 0]}>
                  <ambientLight intensity={1.0} color="#1c2541" />
                  <directionalLight 
                    position={[20, 40, 20]} intensity={0.7} color="#48cae4" castShadow 
                    shadow-mapSize={[2048, 2048]} 
                    shadow-camera-left={-60} shadow-camera-right={60}
                    shadow-camera-top={60} shadow-camera-bottom={-60}
                  />

                  <Player toolMode={toolMode} />

                  {placedItems.map(item => (
                     <PlacedObject 
                        key={item.id} 
                        item={item} 
                        isSelected={selectedItemId === item.id}
                        onSelect={handleObjectSelect}
                        onTransformEnd={handleTransformEnd}
                        toolMode={toolMode}
                        customAssets={customAssets}
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
                 maxPolarAngle={Math.PI / 2} 
                 minDistance={2} maxDistance={100}
                 enabled={toolMode !== 'EXPLORAR'} 
              />
              {!isMobile && (
                  <EffectComposer disableNormalPass multisampling={0}>
                     <N8AO aoRadius={4} intensity={2.5} color="#0a0a0a" distanceFalloff={1} />
                     <Bloom luminanceThreshold={0.8} mipmapBlur intensity={2.5} radius={0.8} />
                     <DepthOfField focusDistance={0.015} focalLength={0.02} bokehScale={2} height={480} />
                     <ToneMapping adaptive resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={1.0} />
                  </EffectComposer>
              )}
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
        
        {isAssetModalOpen && (
            <div className="absolute inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                <div className="bg-[#121B2A] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                    <button onClick={() => setIsAssetModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                    <h3 className="text-[#D4AF37] font-bold text-lg mb-4 flex items-center gap-2">
                        <DownloadCloud size={20} /> Importar Asset
                    </h3>
                    
                    <div className="flex bg-black/40 rounded-lg p-1 mb-4">
                        <button onClick={() => setImportMode('url_file')} className={`flex-1 py-1.5 text-xs rounded-md font-bold transition-colors ${importMode === 'url_file' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Archivo / URL</button>
                        <button onClick={() => setImportMode('sketchfab')} className={`flex-1 py-1.5 text-xs rounded-md font-bold transition-colors ${importMode === 'sketchfab' ? 'bg-[#1CAAD9]/20 text-[#1CAAD9]' : 'text-gray-500 hover:text-gray-300'}`}>Sketchfab (API)</button>
                    </div>

                    <div className="space-y-4">
                        {importMode === 'url_file' ? (
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Enlace Directo (.jpg, .png, .glb)</label>
                                <input 
                                    type="text" 
                                    value={newAssetUrl}
                                    onChange={e => setNewAssetUrl(e.target.value)}
                                    placeholder="https://ejemplo.com/textura.jpg"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs text-[#1CAAD9] font-bold uppercase block mb-1">UID del Modelo Sketchfab</label>
                                <input 
                                    type="text" 
                                    value={sketchfabUid}
                                    onChange={e => setSketchfabUid(e.target.value.trim())}
                                    placeholder="Ej: 731235038f6945d19f10d9331b78ea09"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1CAAD9]"
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nombre del Asset</label>
                            <input 
                                type="text" 
                                value={newAssetName}
                                onChange={e => setNewAssetName(e.target.value)}
                                placeholder="Ej: Muro de Piedra / Sofá Moderno"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Categoría</label>
                            <select 
                                value={newAssetCategory}
                                onChange={e => setNewAssetCategory(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] [&>optgroup]:font-bold [&>optgroup]:text-[#D4AF37]"
                            >
                                <optgroup label="Texturas de Pared/Piso">
                                    <option value="Pisos">Pisos (Suelos)</option>
                                    <option value="Paredes">Paredes (Muros)</option>
                                </optgroup>
                                <optgroup label="Muebles / Decoración">
                                    <option value="Mobiliario">Mobiliario General</option>
                                    <option value="Electrodomésticos">Electrodomésticos</option>
                                    <option value="Electrónica">Electrónica</option>
                                    <option value="Vegetación">Vegetación / Plantas</option>
                                </optgroup>
                                <optgroup label="Estructuras / Prefabricados">
                                    <option value="Plantillas">Casas Completas</option>
                                    <option value="Techos">Techos</option>
                                    <option value="Escaleras">Escaleras / Ascensores</option>
                                    <option value="Piscinas">Piscinas</option>
                                </optgroup>
                                <optgroup label="Puertas y Ventanas">
                                    <option value="Puertas">Puertas</option>
                                    <option value="Ventanas">Ventanas</option>
                                </optgroup>
                            </select>
                        </div>
                        
                        {downloadError && (
                            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-2 rounded">
                                {downloadError}
                            </div>
                        )}
                        
                        {importMode === 'sketchfab' ? (
                            <>
                                <button 
                                    onClick={handleSaveSketchfab}
                                    disabled={isDownloading || !sketchfabUid || !newAssetName}
                                    className="w-full bg-[#1CAAD9] hover:bg-[#158bb3] text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    Guardar Referencia Sketchfab
                                </button>
                                <p className="text-[10px] text-gray-500 text-center leading-tight">
                                    El modelo de Sketchfab se renderizará en vivo dentro del espacio 3D ahorrando memoria local.
                                </p>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={handleDownloadAsset}
                                    disabled={isDownloading || !newAssetUrl || !newAssetName}
                                    className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDownloading ? 'Descargando...' : 'Descargar y Guardar (Memoria)'}
                                </button>
                                
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase font-bold">O alternativamente</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isDownloading}
                                    className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Upload size={16} />
                                    {isDownloading ? 'Procesando...' : 'Cargar archivo local (.glb, .png, .jpg)'}
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".glb,.gltf,.jpg,.jpeg,.png,image/png,image/jpeg"
                                    className="hidden"
                                />

                                <p className="text-[10px] text-gray-500 text-center leading-tight">
                                    Se guardará en IndexedDB para no usar el almacenamiento de archivos visible de tu teléfono.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}
        
        {/* Toast Notification */}
        {toastMessage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[11000] bg-emerald-500/90 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-sm border border-emerald-400/30 flex items-center gap-2 animate-[slideDown_0.3s_ease-out]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span className="font-medium text-sm">{toastMessage}</span>
            </div>
        )}
    </KeyboardControls>
  );
}
