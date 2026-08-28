import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, useGLTF, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

// A simple deterministic pseudo-random number generator and noise function
// to avoid external dependencies for noise.
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
        // Very basic value noise
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

const ISLAND_SIZE = 200;
const SEGMENTS = 128;

function Terrain() {
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(ISLAND_SIZE, ISLAND_SIZE, SEGMENTS, SEGMENTS);
        geo.rotateX(-Math.PI / 2);
        
        const pos = geo.attributes.position;
        const colors = [];
        const colorObj = new THREE.Color();
        const noiseGen = new SimpleNoise(12345);
        
        const sandColor = new THREE.Color("#e6d5a1");
        const grassColor = new THREE.Color("#4ade80");
        const forestColor = new THREE.Color("#166534");
        const rockColor = new THREE.Color("#71717a");
        const snowColor = new THREE.Color("#ffffff");
        const riverBedColor = new THREE.Color("#3b82f6");
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            
            // Distance from center
            const d = Math.sqrt(x*x + z*z);
            const maxRadius = ISLAND_SIZE * 0.45;
            
            // Base island shape (dome)
            let h = Math.max(0, maxRadius - d) * 0.2;
            
            // Add noise
            const n = noiseGen.fbm(x * 0.05, z * 0.05, 4);
            h += n * 15;
            
            // Flatten edges
            const edgeFalloff = Math.max(0, 1 - Math.pow(d / maxRadius, 2));
            h *= edgeFalloff;
            
            // Mountain peak in center
            if (d < maxRadius * 0.5) {
                h += Math.pow(maxRadius * 0.5 - d, 1.5) * 0.05 * (noiseGen.noise(x*0.1, z*0.1) + 0.5);
            }
            
            // River (flowing from mountain to coast)
            const riverPath = Math.sin(d * 0.1) * 10;
            const riverDist = Math.abs((x - riverPath) - (z * 0.5)); // diagonal river
            let isRiver = false;
            
            if (riverDist < 3 && x > 0 && z > 0) {
                // River carve
                h -= (3 - riverDist) * 2;
                if (h < -2) h = -2;
                isRiver = true;
            }
            
            // Lake (in the middle of the river path)
            const lakeDist = Math.sqrt(Math.pow(x - 20, 2) + Math.pow(z - 20, 2));
            if (lakeDist < 12) {
                h -= (12 - lakeDist) * 0.5;
                if (h < -3) h = -3;
                isRiver = true;
            }
            
            pos.setY(i, h);
            
            // Biome coloring based on height and river
            if (h < 1) { // Coastal / Sand
                colorObj.copy(sandColor).lerp(new THREE.Color("#d4b872"), n);
            } else if (h < 8) { // Plains
                colorObj.copy(grassColor).lerp(forestColor, n * 0.5);
            } else if (h < 18) { // Forest
                colorObj.copy(forestColor).lerp(rockColor, (h - 8) / 10);
            } else if (h < 28) { // Mountain Rock
                colorObj.copy(rockColor).lerp(snowColor, (h - 18) / 10);
            } else { // Snow
                colorObj.copy(snowColor);
            }
            
            if (h < 0) { // Underwater / Riverbed
                colorObj.copy(riverBedColor);
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

function WaterLayer() {
    // A simple water plane
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow>
            <planeGeometry args={[ISLAND_SIZE * 1.5, ISLAND_SIZE * 1.5]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} roughness={0.1} metalness={0.8} />
        </mesh>
    );
}

export function MainIsland({ onClose }: { onClose?: () => void }) {
    return (
        <div className="w-full h-full relative bg-[#87CEEB]">
            {onClose && (
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg transition-colors">
                    Cerrar Isla
                </button>
            )}
            <Canvas shadows camera={{ position: [50, 40, 50], fov: 45 }}>
                <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
                <ambientLight intensity={0.4} />
                <directionalLight 
                    position={[50, 50, 20]} 
                    intensity={1.2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]} 
                    shadow-camera-left={-100}
                    shadow-camera-right={100}
                    shadow-camera-top={100}
                    shadow-camera-bottom={-100}
                />
                
                <Terrain />
                <WaterLayer />
                
                {/* 
                  Instead of generating individual tree meshes which might be slow,
                  we could use Instances if we had models.
                  For now, we can create simple geometric trees.
                */}
                <Vegetation />
                
                <OrbitControls 
                    maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
                    minDistance={10}
                    maxDistance={150}
                />
            </Canvas>
        </div>
    );
}

// Simple geometric vegetation
function Vegetation() {
    // Generate tree positions based on the same noise/height logic
    const trees = useMemo(() => {
        const items = [];
        const noiseGen = new SimpleNoise(999);
        
        for(let i=0; i<1000; i++) {
            const x = (noiseGen.random() - 0.5) * ISLAND_SIZE * 0.8;
            const z = (noiseGen.random() - 0.5) * ISLAND_SIZE * 0.8;
            
            const d = Math.sqrt(x*x + z*z);
            const maxRadius = ISLAND_SIZE * 0.45;
            let h = Math.max(0, maxRadius - d) * 0.2;
            const n = noiseGen.fbm(x * 0.05, z * 0.05, 4);
            h += n * 15;
            const edgeFalloff = Math.max(0, 1 - Math.pow(d / maxRadius, 2));
            h *= edgeFalloff;
            if (d < maxRadius * 0.5) {
                h += Math.pow(maxRadius * 0.5 - d, 1.5) * 0.05 * (noiseGen.noise(x*0.1, z*0.1) + 0.5);
            }
            
            // River check (don't place trees in river)
            const riverPath = Math.sin(d * 0.1) * 10;
            const riverDist = Math.abs((x - riverPath) - (z * 0.5));
            if (riverDist < 4 && x > 0 && z > 0) continue;
            const lakeDist = Math.sqrt(Math.pow(x - 20, 2) + Math.pow(z - 20, 2));
            if (lakeDist < 13) continue;
            
            if (h > 1 && h < 8) {
                // Plains -> broadleaf trees
                if (noiseGen.random() > 0.5) {
                    items.push({ type: 'broadleaf', position: [x, h, z], scale: 0.5 + noiseGen.random() * 0.5 });
                }
            } else if (h >= 8 && h < 18) {
                // Forest -> pines
                if (noiseGen.random() > 0.3) {
                    items.push({ type: 'pine', position: [x, h, z], scale: 0.8 + noiseGen.random() * 0.6 });
                }
            } else if (h > 0.2 && h <= 1) {
                // Coastal -> Palms
                if (noiseGen.random() > 0.8) {
                    items.push({ type: 'palm', position: [x, h, z], scale: 0.7 + noiseGen.random() * 0.4 });
                }
            }
        }
        return items;
    }, []);

    return (
        <group>
            {trees.map((t, i) => {
                if (t.type === 'pine') {
                    return (
                        <group key={i} position={t.position as [number,number,number]} scale={t.scale}>
                            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                                <cylinderGeometry args={[0.2, 0.2, 2]} />
                                <meshStandardMaterial color="#5c4033" />
                            </mesh>
                            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                                <coneGeometry args={[1.5, 3, 5]} />
                                <meshStandardMaterial color="#166534" />
                            </mesh>
                            <mesh position={[0, 4, 0]} castShadow receiveShadow>
                                <coneGeometry args={[1, 2, 5]} />
                                <meshStandardMaterial color="#166534" />
                            </mesh>
                        </group>
                    );
                } else if (t.type === 'broadleaf') {
                    return (
                        <group key={i} position={t.position as [number,number,number]} scale={t.scale}>
                            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                                <cylinderGeometry args={[0.2, 0.2, 2]} />
                                <meshStandardMaterial color="#8b5a2b" />
                            </mesh>
                            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                                <sphereGeometry args={[1.5, 7, 7]} />
                                <meshStandardMaterial color="#4ade80" />
                            </mesh>
                        </group>
                    );
                } else if (t.type === 'palm') {
                    return (
                        <group key={i} position={t.position as [number,number,number]} scale={t.scale}>
                            <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
                                <cylinderGeometry args={[0.15, 0.25, 3]} />
                                <meshStandardMaterial color="#c2b280" />
                            </mesh>
                            {/* Palm leaves */}
                            {[0, 1, 2, 3, 4].map(l => (
                                <mesh key={l} position={[0, 3, 0]} rotation={[0.4, (l * Math.PI * 2) / 5, 0]} castShadow receiveShadow>
                                    <planeGeometry args={[0.5, 2]} />
                                    <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
                                </mesh>
                            ))}
                        </group>
                    );
                }
                return null;
            })}
        </group>
    );
}
