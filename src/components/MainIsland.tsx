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
const ISLAND_SIZE = 600; // Increased by 100% (was 300)
const SEGMENTS = 250;

// Soft natural lakes, no sharp trenches
const lakes = [
    { cx: 80, cz: 80, r: 50, depth: 6 },
    { cx: -100, cz: 60, r: 40, depth: 4 },
    { cx: 50, cz: -140, r: 60, depth: 5 },
    { cx: -150, cz: -100, r: 35, depth: 3 },
    { cx: 15, cz: 15, r: 30, depth: 8 } // Central crater
];

function getTerrainData(x: number, z: number, noiseGen: SimpleNoise) {
    const d = Math.hypot(x, z);
    const maxRadius = ISLAND_SIZE * 0.45;
    
    // Base dome
    let h = Math.max(0, maxRadius - d) * 0.25;
    
    // Terrain Noise
    const n = noiseGen.fbm(x * 0.015, z * 0.015, 6);
    h += n * 35;
    
    // Edge falloff
    const edgeFalloff = Math.max(0, 1 - Math.pow(d / maxRadius, 2));
    h *= edgeFalloff;
    
    // Mountain peak
    if (d < maxRadius * 0.5) {
        h += Math.pow(maxRadius * 0.5 - d, 1.3) * 0.08 * (noiseGen.noise(x * 0.03, z * 0.03) + 0.5);
    }

    // Carve lakes smoothly
    let waterDepth = 0;
    for (let l of lakes) {
        let ld = Math.hypot(x - l.cx, z - l.cz);
        if (ld < l.r) {
            // Smooth cosine carve to prevent ugly sharp walls
            let carve = Math.cos((ld / l.r) * (Math.PI / 2)) * l.depth;
            waterDepth = Math.max(waterDepth, carve);
        }
    }
    
    h -= waterDepth;

    // Biome mapping
    const temp = noiseGen.fbm(x * 0.005 + 100, z * 0.005 + 100, 3);
    const moist = noiseGen.fbm(x * 0.005 - 100, z * 0.005 - 100, 3);

    let biome = 'ocean';
    if (h >= 0.5 && h < 4) biome = 'beach';
    else if (h >= 4 && h < 20) {
        if (temp > 0.2 && moist < -0.1) biome = 'savanna';
        else if (temp > 0.2 && moist > 0.1) biome = 'jungle';
        else if (temp < -0.2) biome = 'taiga';
        else if (moist > 0.15) biome = 'forest';
        else biome = 'plains';
    } else if (h >= 20 && h < 45) {
        if (temp < -0.1) biome = 'snow_forest';
        else if (temp > 0.2) biome = 'autumn_forest';
        else biome = 'forest';
    } else if (h >= 45 && h < 75) biome = 'rock';
    else if (h >= 75) biome = 'snow';

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
        
        const cRiverbed = new THREE.Color("#0891b2");
        const cBeach = new THREE.Color("#fef08a");
        const cSavanna = new THREE.Color("#d9f99d");
        const cJungle = new THREE.Color("#14532d");
        const cTaiga = new THREE.Color("#0f766e");
        const cPlains = new THREE.Color("#86efac");
        const cForest = new THREE.Color("#15803d");
        const cAutumn = new THREE.Color("#9a3412");
        const cRock = new THREE.Color("#52525b");
        const cSnow = new THREE.Color("#ffffff");
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            
            const { h, biome } = getTerrainData(x, z, noiseGen);
            pos.setY(i, h);
            
            // Color mapping based on exact biome
            if (h < 0.5) {
                colorObj.copy(cRiverbed).lerp(cBeach, (h + 3) / 3.5);
            } else if (biome === 'beach') colorObj.copy(cBeach);
            else if (biome === 'savanna') colorObj.copy(cSavanna);
            else if (biome === 'jungle') colorObj.copy(cJungle);
            else if (biome === 'taiga' || biome === 'snow_forest') colorObj.copy(cTaiga);
            else if (biome === 'plains') colorObj.copy(cPlains);
            else if (biome === 'forest') colorObj.copy(cForest);
            else if (biome === 'autumn_forest') colorObj.copy(cAutumn);
            else if (biome === 'rock') {
                const blend = Math.max(0, Math.min(1, (h - 45) / 10));
                if (tempForBlend(x, z, noiseGen) < -0.1) colorObj.copy(cTaiga).lerp(cRock, blend);
                else colorObj.copy(cForest).lerp(cRock, blend);
            }
            else if (biome === 'snow') {
                const blend = Math.max(0, Math.min(1, (h - 75) / 10));
                colorObj.copy(cRock).lerp(cSnow, blend);
            }
            else colorObj.copy(cPlains); // Fallback
            
            // Add some noise to colors
            const cn = noiseGen.noise(x, z) * 0.05;
            colorObj.r = Math.min(1, Math.max(0, colorObj.r + cn));
            colorObj.g = Math.min(1, Math.max(0, colorObj.g + cn));
            colorObj.b = Math.min(1, Math.max(0, colorObj.b + cn));

            colors.push(colorObj.r, colorObj.g, colorObj.b);
        }
        
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh geometry={geometry} receiveShadow castShadow>
            <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
    );
}

function tempForBlend(x: number, z: number, noiseGen: SimpleNoise) {
    return noiseGen.fbm(x * 0.005 + 100, z * 0.005 + 100, 3);
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

// --------------------------------------------------------
// Geometries (Centered properly so they don't disconnect)
// --------------------------------------------------------
const geoPineTrunk = new THREE.CylinderGeometry(0.2, 0.4, 2).translate(0, 1, 0);
const geoPineLeaves1 = new THREE.ConeGeometry(1.6, 3.5, 6).translate(0, 2.5, 0);
const geoPineLeaves2 = new THREE.ConeGeometry(1.2, 2.5, 6).translate(0, 4.5, 0);

const geoBroadTrunk = new THREE.CylinderGeometry(0.3, 0.5, 2.5).translate(0, 1.25, 0);
const geoBroadLeaves = new THREE.IcosahedronGeometry(2.2, 1).translate(0, 3.5, 0);

const geoAcaciaTrunk = new THREE.CylinderGeometry(0.15, 0.25, 3).translate(0, 1.5, 0);
const geoAcaciaLeaves = new THREE.CylinderGeometry(2.5, 2.5, 0.6, 7).translate(0, 3, 0);

const geoPalmTrunk = new THREE.CylinderGeometry(0.15, 0.25, 3.5).translate(0, 1.75, 0);
const geoPalmLeaves = new THREE.ConeGeometry(2.5, 0.5, 7, 1, true).translate(0, 3.5, 0);

// Sunk into ground deeply so it never floats on slopes
const geoRock = new THREE.DodecahedronGeometry(1.5, 0).translate(0, -0.6, 0); 
const geoBush = new THREE.IcosahedronGeometry(1, 0).translate(0, 0, 0);

// Materials
const matWood = new THREE.MeshStandardMaterial({ color: "#452c21", roughness: 0.9 });
const matPine = new THREE.MeshStandardMaterial({ color: "#064e3b", roughness: 0.9 });
const matBroad = new THREE.MeshStandardMaterial({ color: "#15803d", roughness: 0.8 });
const matAutumn = new THREE.MeshStandardMaterial({ color: "#ca8a04", roughness: 0.8 });
const matAcacia = new THREE.MeshStandardMaterial({ color: "#4d7c0f", roughness: 0.8 });
const matPalmWood = new THREE.MeshStandardMaterial({ color: "#d4a373", roughness: 0.9 });
const matPalm = new THREE.MeshStandardMaterial({ color: "#22c55e", side: THREE.DoubleSide, roughness: 0.7 });
const matRock = new THREE.MeshStandardMaterial({ color: "#52525b", roughness: 0.9 });
const matBush = new THREE.MeshStandardMaterial({ color: "#4ade80", roughness: 0.8 });

function Vegetation() {
    const data = useMemo(() => {
        const noiseGen = new SimpleNoise(999);
        const pines: ItemProps[] = [];
        const broadleafs: ItemProps[] = [];
        const autumns: ItemProps[] = [];
        const acacias: ItemProps[] = [];
        const palms: ItemProps[] = [];
        const rocks: ItemProps[] = [];
        const bushes: ItemProps[] = [];

        // Grid-based placement prevents overlapping/throwing together
        const cellSize = 6;
        const half = ISLAND_SIZE / 2;
        
        for (let cx = -half; cx < half; cx += cellSize) {
            for (let cz = -half; cz < half; cz += cellSize) {
                // Jitter inside the cell
                const x = cx + noiseGen.random() * cellSize;
                const z = cz + noiseGen.random() * cellSize;
                
                const { h, biome, isWater } = getTerrainData(x, z, noiseGen);
                if (isWater) continue;
                
                const pos: [number, number, number] = [x, h, z];
                const scale = 0.6 + noiseGen.random() * 0.8;
                // Only rotate around Y axis so parts don't disconnect
                const rot: [number, number, number] = [0, noiseGen.random() * Math.PI * 2, 0];
                const item = { position: pos, scale, rotation: rot };
                
                const rand = noiseGen.random();

                // Distribution Rules per Biome
                if (biome === 'beach') {
                    if (rand > 0.8) palms.push(item);
                    else if (rand > 0.6) rocks.push({...item, scale: scale * 0.4});
                } else if (biome === 'savanna') {
                    if (rand > 0.9) acacias.push(item);
                    else if (rand > 0.7) bushes.push(item);
                    else if (rand > 0.6) rocks.push({...item, scale: scale * 0.5});
                } else if (biome === 'jungle') {
                    if (rand > 0.3) broadleafs.push({...item, scale: scale * 1.5}); // Giant jungle trees
                    else if (rand > 0.1) bushes.push(item);
                } else if (biome === 'plains') {
                    if (rand > 0.95) broadleafs.push(item); // Sparse trees
                    else if (rand > 0.85) bushes.push(item);
                } else if (biome === 'forest') {
                    if (rand > 0.4) broadleafs.push(item);
                    else if (rand > 0.2) bushes.push(item);
                } else if (biome === 'taiga' || biome === 'snow_forest') {
                    if (rand > 0.4) pines.push(item);
                    else if (rand > 0.2) rocks.push({...item, scale: scale * 0.6});
                } else if (biome === 'autumn_forest') {
                    if (rand > 0.4) autumns.push(item);
                    else if (rand > 0.2) bushes.push(item);
                } else if (biome === 'rock') {
                    if (rand > 0.6) rocks.push({...item, scale: scale * 1.2}); // Big rocks
                    else if (rand > 0.9) pines.push({...item, scale: scale * 0.7}); // Struggling pines
                } else if (biome === 'snow') {
                    if (rand > 0.95) rocks.push(item);
                }
            }
        }
        return { pines, broadleafs, autumns, acacias, palms, rocks, bushes };
    }, []);

    return (
        <group>
            {data.pines.length > 0 && <InstancedGroup items={data.pines} geometries={[geoPineTrunk, geoPineLeaves1, geoPineLeaves2]} materials={[matWood, matPine, matPine]} />}
            {data.broadleafs.length > 0 && <InstancedGroup items={data.broadleafs} geometries={[geoBroadTrunk, geoBroadLeaves]} materials={[matWood, matBroad]} />}
            {data.autumns.length > 0 && <InstancedGroup items={data.autumns} geometries={[geoBroadTrunk, geoBroadLeaves]} materials={[matWood, matAutumn]} />}
            {data.acacias.length > 0 && <InstancedGroup items={data.acacias} geometries={[geoAcaciaTrunk, geoAcaciaLeaves]} materials={[matWood, matAcacia]} />}
            {data.palms.length > 0 && <InstancedGroup items={data.palms} geometries={[geoPalmTrunk, geoPalmLeaves]} materials={[matPalmWood, matPalm]} />}
            {data.rocks.length > 0 && <InstancedGroup items={data.rocks} geometries={[geoRock]} materials={[matRock]} />}
            {data.bushes.length > 0 && <InstancedGroup items={data.bushes} geometries={[geoBush]} materials={[matBush]} />}
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
            <Canvas shadows camera={{ position: [120, 80, 120], fov: 45 }}>
                <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
                <ambientLight intensity={0.4} />
                <directionalLight 
                    position={[100, 150, 50]} 
                    intensity={1.2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]} 
                    shadow-camera-left={-250}
                    shadow-camera-right={250}
                    shadow-camera-top={250}
                    shadow-camera-bottom={-250}
                />
                
                <Terrain />
                
                {/* Enhanced Crystalline Water */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]} receiveShadow>
                    <planeGeometry args={[ISLAND_SIZE * 1.5, ISLAND_SIZE * 1.5]} />
                    <meshPhysicalMaterial 
                        color="#22d3ee" // Crystal cyan 
                        transmission={0.9} // Very transparent glass-like
                        opacity={1}
                        transparent={true}
                        roughness={0.02}
                        ior={1.33}
                        thickness={5.0}
                    />
                </mesh>
                
                <Vegetation />
                
                <OrbitControls 
                    maxPolarAngle={Math.PI / 2 - 0.05} 
                    minDistance={10}
                    maxDistance={400}
                />
            </Canvas>
        </div>
    );
}
