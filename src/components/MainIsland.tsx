import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

// --------------------------------------------------------
// Pseudo-Random & Noise Generator
// --------------------------------------------------------
class SimpleNoise {
    private seed: number;
    constructor(seed = 1) {
        this.seed = seed;
    }
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
    noise(x: number, y: number) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;
        
        const dot = (xi: number, yi: number) => {
            const s = this.seed;
            this.seed = xi * 12.9898 + yi * 78.233 + s;
            const r = this.random();
            this.seed = s;
            return r;
        };
        
        const a = dot(ix, iy);
        const b = dot(ix + 1, iy);
        const c = dot(ix, iy + 1);
        const d = dot(ix + 1, iy + 1);
        
        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uy = fy * fy * (3.0 - 2.0 * fy);
        
        return a + ux * (b - a) + uy * (c - a) + ux * uy * (a - b - c + d);
    }
    fbm(x: number, y: number, octaves: number) {
        let val = 0;
        let amp = 0.5;
        let freq = 1;
        for (let i = 0; i < octaves; i++) {
            val += this.noise(x * freq, y * freq) * amp;
            amp *= 0.5;
            freq *= 2;
        }
        return val;
    }
}

// --------------------------------------------------------
// Configuration
// --------------------------------------------------------
const ISLAND_SIZE = 300; // 50% larger
const SEGMENTS = 200;

const lakes = [
    { cx: 40, cz: 40, r: 25, depth: 4 },
    { cx: -60, cz: 30, r: 20, depth: 3 },
    { cx: 20, cz: -80, r: 35, depth: 5 },
    { cx: -80, cz: -50, r: 18, depth: 2 },
    { cx: 10, cz: 10, r: 15, depth: 6 } // Central crater lake
];

const rivers = [
    { angle: 0.2, amp: 15, freq: 0.05, width: 4.5, depth: 3.5 },
    { angle: Math.PI * 0.7, amp: 25, freq: 0.03, width: 5.5, depth: 4 },
    { angle: -Math.PI * 0.6, amp: 12, freq: 0.06, width: 4, depth: 3 },
    { angle: Math.PI * -0.2, amp: 20, freq: 0.04, width: 6, depth: 4 }
];

function getTerrainData(x: number, z: number, noiseGen: SimpleNoise) {
    const d = Math.hypot(x, z);
    const maxRadius = ISLAND_SIZE * 0.45;
    
    // Base dome
    let h = Math.max(0, maxRadius - d) * 0.2;
    
    // Terrain Noise
    const n = noiseGen.fbm(x * 0.02, z * 0.02, 5);
    h += n * 25;
    
    // Edge falloff
    const edgeFalloff = Math.max(0, 1 - Math.pow(d / maxRadius, 2));
    h *= edgeFalloff;
    
    // Mountain peak
    if (d < maxRadius * 0.5) {
        h += Math.pow(maxRadius * 0.5 - d, 1.4) * 0.06 * (noiseGen.noise(x * 0.05, z * 0.05) + 0.5);
    }

    // Carve lakes
    let waterDepth = 0;
    for (let l of lakes) {
        let ld = Math.hypot(x - l.cx, z - l.cz);
        if (ld < l.r) {
            let carve = (l.r - ld) * 0.5;
            if (carve > l.depth) carve = l.depth;
            waterDepth = Math.max(waterDepth, carve);
        }
    }
    
    // Carve rivers
    for (let r of rivers) {
        let rx = x * Math.cos(-r.angle) - z * Math.sin(-r.angle);
        let rz = x * Math.sin(-r.angle) + z * Math.cos(-r.angle);
        if (rz > 0) { // flows outward
            let riverPath = Math.sin(rz * r.freq) * r.amp;
            let riverDist = Math.abs(rx - riverPath);
            if (riverDist < r.width) {
                let carve = (r.width - riverDist) * 1.5;
                if (carve > r.depth) carve = r.depth;
                waterDepth = Math.max(waterDepth, carve);
            }
        }
    }
    
    h -= waterDepth;

    // Biome mapping
    const temp = noiseGen.fbm(x * 0.01 + 100, z * 0.01 + 100, 3);
    const moist = noiseGen.fbm(x * 0.01 - 100, z * 0.01 - 100, 3);

    let biome = 'ocean';
    if (h >= 0.5 && h < 3.5) biome = 'beach';
    else if (h >= 3.5 && h < 14) {
        if (temp > 0.1 && moist < -0.1) biome = 'desert';
        else if (moist > 0.1) biome = 'forest';
        else biome = 'plains';
    } else if (h >= 14 && h < 28) {
        if (temp < 0) biome = 'taiga';
        else biome = 'forest';
    } else if (h >= 28 && h < 45) biome = 'rock';
    else if (h >= 45) biome = 'snow';

    return { h, biome, isWater: waterDepth > 0 || h < 0.5, temp, moist };
}

// --------------------------------------------------------
// Terrain Mesh
// --------------------------------------------------------
function Terrain() {
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(ISLAND_SIZE, ISLAND_SIZE, SEGMENTS, SEGMENTS);
        geo.rotateX(-Math.PI / 2);
        
        const pos = geo.attributes.position;
        const colors = [];
        const colorObj = new THREE.Color();
        const noiseGen = new SimpleNoise(12345);
        
        const cBeach = new THREE.Color("#fef08a");
        const cDesert = new THREE.Color("#fcd34d");
        const cPlains = new THREE.Color("#86efac");
        const cForest = new THREE.Color("#15803d");
        const cTaiga = new THREE.Color("#065f46");
        const cRock = new THREE.Color("#71717a");
        const cSnow = new THREE.Color("#ffffff");
        const cRiverbed = new THREE.Color("#0891b2");
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            
            const { h, temp, moist } = getTerrainData(x, z, noiseGen);
            pos.setY(i, h);
            
            // Color blending
            if (h < 0.5) {
                colorObj.copy(cRiverbed).lerp(cBeach, (h + 3) / 3.5);
            } else if (h < 3.5) {
                colorObj.copy(cBeach);
            } else if (h < 14) {
                if (temp > 0.1 && moist < -0.1) colorObj.copy(cDesert).lerp(cPlains, (h-3.5)/10.5);
                else if (moist > 0.1) colorObj.copy(cForest).lerp(cPlains, 0.5);
                else colorObj.copy(cPlains);
            } else if (h < 28) {
                if (temp < 0) colorObj.copy(cTaiga);
                else colorObj.copy(cForest).lerp(cTaiga, (h-14)/14);
            } else if (h < 45) {
                colorObj.copy(cRock).lerp(cSnow, (h-28)/17);
            } else {
                colorObj.copy(cSnow);
            }
            
            colors.push(colorObj.r, colorObj.g, colorObj.b);
        }
        
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh geometry={geometry} receiveShadow castShadow>
            <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
    );
}

// --------------------------------------------------------
// Instanced Vegetation system
// --------------------------------------------------------
interface ItemProps {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
}

interface InstancedGroupProps {
    items: ItemProps[];
    geometries: THREE.BufferGeometry[];
    materials: THREE.Material[];
}

function InstancedGroup({ items, geometries, materials }: InstancedGroupProps) {
    const groupRef = useRef<THREE.Group>(null);
    
    useEffect(() => {
        if (!groupRef.current) return;
        const meshes = groupRef.current.children as THREE.InstancedMesh[];
        const dummy = new THREE.Object3D();
        
        items.forEach((item, i) => {
            dummy.position.set(...item.position);
            dummy.rotation.set(...item.rotation);
            dummy.scale.set(item.scale, item.scale, item.scale);
            dummy.updateMatrix();
            meshes.forEach(mesh => {
                mesh.setMatrixAt(i, dummy.matrix);
            });
        });
        
        meshes.forEach(mesh => {
            mesh.instanceMatrix.needsUpdate = true;
        });
    }, [items]);

    return (
        <group ref={groupRef}>
            {geometries.map((geo, idx) => (
                <instancedMesh key={idx} args={[geo, materials[idx], items.length]} castShadow receiveShadow />
            ))}
        </group>
    );
}

// Pre-create geometries and materials to avoid recreation
const geoPineTrunk = new THREE.CylinderGeometry(0.2, 0.4, 2).translate(0, 1, 0);
const geoPineLeaves1 = new THREE.ConeGeometry(1.8, 3.5, 6).translate(0, 2.5, 0);
const geoPineLeaves2 = new THREE.ConeGeometry(1.2, 2.5, 6).translate(0, 4.5, 0);

const geoBroadTrunk = new THREE.CylinderGeometry(0.3, 0.5, 2.5).translate(0, 1.25, 0);
const geoBroadLeaves = new THREE.SphereGeometry(2.2, 8, 8).translate(0, 3.5, 0);

const geoPalmTrunk = new THREE.CylinderGeometry(0.15, 0.25, 4).translate(0, 2, 0).rotateZ(0.15);
const geoPalmLeaves = new THREE.ConeGeometry(2, 0.8, 6, 1, true).translate(0, 4, 0).rotateX(Math.PI);

const geoRock = new THREE.DodecahedronGeometry(1).translate(0, 0.5, 0);
const geoBush = new THREE.SphereGeometry(0.9, 6, 6).translate(0, 0.4, 0);

const geoCactusMain = new THREE.CylinderGeometry(0.2, 0.2, 2.5).translate(0, 1.25, 0);
const geoCactusArm1 = new THREE.CylinderGeometry(0.15, 0.15, 1).translate(0.4, 1.5, 0).rotateZ(0.4);
const geoCactusArm2 = new THREE.CylinderGeometry(0.15, 0.15, 0.8).translate(-0.4, 1.8, 0).rotateZ(-0.4);

const matWood = new THREE.MeshStandardMaterial({ color: "#5c4033", roughness: 0.9 });
const matPine = new THREE.MeshStandardMaterial({ color: "#064e3b", roughness: 0.8 });
const matBroad = new THREE.MeshStandardMaterial({ color: "#15803d", roughness: 0.8 });
const matPalmWood = new THREE.MeshStandardMaterial({ color: "#d4a373", roughness: 0.9 });
const matPalm = new THREE.MeshStandardMaterial({ color: "#4ade80", side: THREE.DoubleSide, roughness: 0.7 });
const matRock = new THREE.MeshStandardMaterial({ color: "#71717a", roughness: 0.8 });
const matBush = new THREE.MeshStandardMaterial({ color: "#22c55e", roughness: 0.8 });
const matCactus = new THREE.MeshStandardMaterial({ color: "#16a34a", roughness: 0.7 });

function Vegetation() {
    const data = useMemo(() => {
        const noiseGen = new SimpleNoise(999);
        const pines: ItemProps[] = [];
        const broadleafs: ItemProps[] = [];
        const palms: ItemProps[] = [];
        const rocks: ItemProps[] = [];
        const bushes: ItemProps[] = [];
        const cacti: ItemProps[] = [];

        // Increase plant count significantly to ~15,000 attempts
        for (let i = 0; i < 15000; i++) {
            const x = (noiseGen.random() - 0.5) * ISLAND_SIZE * 0.85;
            const z = (noiseGen.random() - 0.5) * ISLAND_SIZE * 0.85;
            
            const { h, biome, isWater } = getTerrainData(x, z, noiseGen);
            if (isWater) continue;
            
            const pos: [number, number, number] = [x, h, z];
            const scale = 0.5 + noiseGen.random() * 0.8;
            const rot: [number, number, number] = [0, noiseGen.random() * Math.PI * 2, 0];
            const item = { position: pos, scale, rotation: rot };
            const rand = noiseGen.random();

            if (biome === 'beach') {
                if (rand > 0.7) palms.push(item);
                else if (rand > 0.5) rocks.push({...item, scale: scale * 0.3});
            } else if (biome === 'desert') {
                if (rand > 0.6) cacti.push(item);
                else if (rand > 0.3) rocks.push({...item, scale: scale * 0.5});
            } else if (biome === 'plains') {
                if (rand > 0.7) bushes.push(item);
                else if (rand > 0.9) broadleafs.push(item);
            } else if (biome === 'forest') {
                if (rand > 0.25) broadleafs.push(item);
                else if (rand > 0.1) bushes.push(item);
            } else if (biome === 'taiga') {
                if (rand > 0.2) pines.push(item);
                else if (rand > 0.1) rocks.push({...item, scale: scale * 0.5});
            } else if (biome === 'rock') {
                if (rand > 0.6) rocks.push(item);
                else if (rand > 0.9) pines.push({...item, scale: scale * 0.7});
            } else if (biome === 'snow') {
                if (rand > 0.9) rocks.push(item);
            }
        }
        return { pines, broadleafs, palms, rocks, bushes, cacti };
    }, []);

    return (
        <group>
            {data.pines.length > 0 && <InstancedGroup items={data.pines} geometries={[geoPineTrunk, geoPineLeaves1, geoPineLeaves2]} materials={[matWood, matPine, matPine]} />}
            {data.broadleafs.length > 0 && <InstancedGroup items={data.broadleafs} geometries={[geoBroadTrunk, geoBroadLeaves]} materials={[matWood, matBroad]} />}
            {data.palms.length > 0 && <InstancedGroup items={data.palms} geometries={[geoPalmTrunk, geoPalmLeaves]} materials={[matPalmWood, matPalm]} />}
            {data.rocks.length > 0 && <InstancedGroup items={data.rocks} geometries={[geoRock]} materials={[matRock]} />}
            {data.bushes.length > 0 && <InstancedGroup items={data.bushes} geometries={[geoBush]} materials={[matBush]} />}
            {data.cacti.length > 0 && <InstancedGroup items={data.cacti} geometries={[geoCactusMain, geoCactusArm1, geoCactusArm2]} materials={[matCactus, matCactus, matCactus]} />}
        </group>
    );
}

// --------------------------------------------------------
// Main Component
// --------------------------------------------------------
export function MainIsland({ onClose }: { onClose?: () => void }) {
    return (
        <div className="w-full h-full relative bg-[#87CEEB]">
            {onClose && (
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg transition-colors">
                    Cerrar Isla
                </button>
            )}
            <Canvas shadows camera={{ position: [80, 60, 80], fov: 45 }}>
                <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
                <ambientLight intensity={0.4} />
                <directionalLight 
                    position={[50, 80, 20]} 
                    intensity={1.2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]} 
                    shadow-camera-left={-150}
                    shadow-camera-right={150}
                    shadow-camera-top={150}
                    shadow-camera-bottom={-150}
                />
                
                <Terrain />
                
                {/* Crystalline Water Layer */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]} receiveShadow>
                    <planeGeometry args={[ISLAND_SIZE * 1.5, ISLAND_SIZE * 1.5]} />
                    <meshPhysicalMaterial 
                        color="#67e8f9" // Bright cyan 
                        transmission={0.8} // Glass-like transparency
                        opacity={1}
                        transparent={true}
                        roughness={0.05}
                        ior={1.33}
                        thickness={2.0}
                    />
                </mesh>
                
                <Vegetation />
                
                <OrbitControls 
                    maxPolarAngle={Math.PI / 2 - 0.05} 
                    minDistance={10}
                    maxDistance={250}
                />
            </Canvas>
        </div>
    );
}
