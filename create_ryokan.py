import os

code = """
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines, TransformControls } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function buildMergedGeometry(configs: any[]) {
    const geos = configs.map(c => {
        let geo;
        if (c.type === 'box') geo = new THREE.BoxGeometry(...(c.args || []));
        else if (c.type === 'plane') geo = new THREE.PlaneGeometry(...(c.args || []));
        else if (c.type === 'cylinder') geo = new THREE.CylinderGeometry(...(c.args || []));
        else if (c.type === 'sphere') geo = new THREE.SphereGeometry(...(c.args || []));
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
      const x = (Math.random() - 0.5) * 30;
      const y = Math.random() * 10 + 2;
      const z = (Math.random() - 0.5) * 30;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.02 + 0.01, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y -= particle.speed;
      particle.position.x += Math.sin(particle.position.y * 2 + particle.phase) * 0.01;
      particle.position.z += Math.cos(particle.position.y * 2 + particle.phase) * 0.01;
      if (particle.position.y < 0) {
        particle.position.y = 12;
      }
      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.phase + particle.position.y, particle.phase, 0);
      dummy.scale.setScalar(0.2);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial color="#ffb7c5" side={THREE.DoubleSide} transparent opacity={0.8} />
    </instancedMesh>
  );
}

function SteamParticles() {
  const count = 50;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = Math.random() * 2;
      const z = (Math.random() - 0.5) * 8 - 15;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.01 + 0.005, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y += particle.speed;
      particle.position.x += Math.sin(particle.position.y + particle.phase) * 0.005;
      if (particle.position.y > 3) {
        particle.position.y = 0;
      }
      dummy.position.copy(particle.position);
      const scale = 1 + particle.position.y * 0.5;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
        mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0,0.5,0]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.03} depthWrite={false} />
    </instancedMesh>
  );
}

function Avatars() {
    const positions = [
        [-2, 0.5, -13], [2, 0.5, -14], [0, 0.5, -16], [4, 0.5, -15], [-4, 0.5, -15],
        [6, 0.5, -2], [5, 0.5, 2], [-5, 0.5, 2], [-8, 0.5, -12], [8, 0.5, -12]
    ];
    
    return (
        <group>
            {positions.map((pos, i) => (
                <group key={i} position={pos as any}>
                    {/* Body */}
                    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.2, 0.2, 0.8]} />
                        <meshStandardMaterial color={['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff'][i % 5]} roughness={0.8} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                        <sphereGeometry args={[0.15]} />
                        <meshStandardMaterial color="#ffccaa" roughness={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

export function RyokanNeo({ item, isExplore, onSelect, onTransformEnd, isSelected, toolMode }: any) {
    const parentGroupRef = useRef<THREE.Group>(null);

    const tex = useMemo(() => {
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
                    ctx.fillStyle = Math.random() > 0.5 ? color2 : color1;
                    ctx.fillRect(Math.random()*256, Math.random()*256, Math.random()*5+1, Math.random()*5+1);
                }
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        };

        return {
            woodDark: createTex('#2a1a10', '#1c1008', 'wood'),
            woodLight: createTex('#b88a5e', '#8a5a3a', 'wood'),
            stone: createTex('#444a4d', '#2a3033', 'stone'),
            bamboo: createTex('#3a4a2a', '#2a3a1a', 'wood'),
        };
    }, []);

    return (
        <group 
            ref={parentGroupRef} 
            position={item.position as [number, number, number]} 
            rotation={item.rotation as [number, number, number]} 
            onClick={(e) => { if (!isExplore) { e.stopPropagation(); onSelect(item.id); } }}
        >
            <RigidBody type="fixed" colliders="trimesh">
                {/* 1. Main House - Ryokan */}
                <group position={[0, 0.5, 2]}>
                    {/* Base */}
                    <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
                        <boxGeometry args={[30, 0.5, 12]} />
                        <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.8} />
                    </mesh>
                    {/* Walls 1st Floor */}
                    <mesh position={[0, 2, -5.5]} castShadow receiveShadow>
                        <boxGeometry args={[30, 4, 1]} />
                        <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.8} />
                    </mesh>
                    <mesh position={[-14.5, 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, 4, 10]} />
                        <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.8} />
                    </mesh>
                    
                    {/* Shoji Panels 1st Floor */}
                    <mesh position={[0, 2, 5.5]} castShadow receiveShadow>
                        <boxGeometry args={[28, 4, 0.2]} />
                        <meshStandardMaterial color="#fff4e0" emissive="#ffddaa" emissiveIntensity={0.8} transparent opacity={0.85} roughness={0.4} />
                    </mesh>
                    
                    {/* Interiors 1st Floor */}
                    <group position={[-8, 0.2, 0]}>
                        <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[4, 0.2, 3]} /><meshStandardMaterial map={tex.woodLight} /></mesh>
                        <mesh position={[-1.5, 0.1, 0]}><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#aa3333" /></mesh>
                        <mesh position={[1.5, 0.1, 0]}><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#3333aa" /></mesh>
                        {/* Sofas */}
                        <mesh position={[0, 0.4, -3]} castShadow receiveShadow><boxGeometry args={[5, 0.8, 1]} /><meshStandardMaterial color="#222" /></mesh>
                        <mesh position={[0, 0.05, 0]}><boxGeometry args={[8, 0.05, 6]} /><meshStandardMaterial color="#554433" /></mesh>
                    </group>

                    <group position={[8, 0.2, 0]}>
                        <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[4, 0.2, 3]} /><meshStandardMaterial map={tex.woodLight} /></mesh>
                        <mesh position={[-1.5, 0.1, 0]}><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#aa3333" /></mesh>
                        <mesh position={[1.5, 0.1, 0]}><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#3333aa" /></mesh>
                    </group>

                    {/* 2nd Floor Floor */}
                    <mesh position={[0, 4.25, 0]} castShadow receiveShadow>
                        <boxGeometry args={[30, 0.5, 12]} />
                        <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.8} />
                    </mesh>

                    {/* Glass Balcony */}
                    <mesh position={[0, 4.8, 5.8]} castShadow receiveShadow>
                        <boxGeometry args={[30, 1, 0.1]} />
                        <meshPhysicalMaterial color="#aaddff" transmission={0.9} roughness={0.1} ior={1.5} transparent opacity={1} />
                    </mesh>

                    {/* Walls 2nd Floor */}
                    <mesh position={[0, 6, 0]} castShadow receiveShadow>
                        <boxGeometry args={[26, 3, 10]} />
                        <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.8} />
                    </mesh>
                    {/* Shoji 2nd Floor */}
                    <mesh position={[0, 6, 5.1]} castShadow receiveShadow>
                        <boxGeometry args={[24, 3, 0.2]} />
                        <meshStandardMaterial color="#fff4e0" emissive="#ffddaa" emissiveIntensity={0.6} transparent opacity={0.85} roughness={0.4} />
                    </mesh>

                    {/* Roof */}
                    <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
                        <coneGeometry args={[18, 4, 4]} />
                        <meshStandardMaterial color="#1a1c1d" roughness={0.9} />
                    </mesh>
                </group>

                {/* Sauna Building (Right) */}
                <group position={[18, 0.5, 0]}>
                    <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                        <boxGeometry args={[8, 3, 8]} />
                        <meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.05} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 1.5, 4.05]} castShadow receiveShadow>
                        <boxGeometry args={[4, 2, 0.1]} />
                        <meshPhysicalMaterial color="#ffffff" transmission={0.7} roughness={0.6} ior={1.4} transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
                        <coneGeometry args={[6, 2, 4]} />
                        <meshStandardMaterial color="#1a1c1d" roughness={0.9} />
                    </mesh>
                    {/* Door */}
                    <mesh position={[-2.5, 1, 4.05]}>
                        <boxGeometry args={[1.5, 2, 0.15]} />
                        <meshStandardMaterial map={tex.woodLight} />
                    </mesh>
                </group>

                {/* Torii Gate with Neon */}
                <group position={[12, 0, 12]}>
                    <mesh position={[-3, 3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 6]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[3, 3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 6]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0, 5, 0]} castShadow receiveShadow><boxGeometry args={[8, 0.6, 0.6]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><boxGeometry args={[9, 0.8, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
                    
                    {/* Neon Magenta Lines */}
                    <mesh position={[-3.4, 3, 0]}><cylinderGeometry args={[0.05, 0.05, 6]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} /></mesh>
                    <mesh position={[3.4, 3, 0]}><cylinderGeometry args={[0.05, 0.05, 6]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} /></mesh>
                    <mesh position={[0, 5, 0.35]}><boxGeometry args={[8.1, 0.1, 0.1]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} /></mesh>
                    <mesh position={[0, 6.2, 0.45]}><boxGeometry args={[9.1, 0.1, 0.1]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} /></mesh>
                </group>

                {/* Backyard Onsen */}
                <group position={[0, 0, -15]}>
                    {/* Pond Base */}
                    <mesh position={[0, -0.5, 0]} receiveShadow>
                        <boxGeometry args={[20, 1, 12]} />
                        <meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.1} roughness={0.9} />
                    </mesh>
                    
                    {/* Water */}
                    <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[18, 10]} />
                        <meshPhysicalMaterial color="#00ffff" emissive="#0088cc" emissiveIntensity={0.2} transmission={0.9} roughness={0.0} ior={1.33} thickness={2} clearcoat={1} transparent opacity={0.9} />
                    </mesh>

                    {/* Cyan Neon Edge */}
                    <mesh position={[0, 0.3, 5.5]}><boxGeometry args={[19, 0.1, 0.1]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} /></mesh>
                    <mesh position={[0, 0.3, -5.5]}><boxGeometry args={[19, 0.1, 0.1]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} /></mesh>
                    <mesh position={[9.5, 0.3, 0]}><boxGeometry args={[0.1, 0.1, 11]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} /></mesh>
                    <mesh position={[-9.5, 0.3, 0]}><boxGeometry args={[0.1, 0.1, 11]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} /></mesh>

                    {/* Stone Dragon */}
                    <group position={[0, 0.5, -3]}>
                        <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[2, 1, 4]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.1} color="#556b2f" roughness={1} /></mesh>
                        <mesh position={[0, 1.5, 1.5]} castShadow receiveShadow><boxGeometry args={[1.5, 1.5, 2]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.1} color="#556b2f" roughness={1} /></mesh>
                        <mesh position={[0, 2.5, 2.5]} castShadow receiveShadow><boxGeometry args={[1.2, 1.2, 1.5]} /><meshStandardMaterial map={tex.stone} bumpMap={tex.stone} bumpScale={0.1} color="#556b2f" roughness={1} /></mesh>
                        {/* Glowing Eyes */}
                        <mesh position={[0.4, 2.6, 3.3]}><sphereGeometry args={[0.15]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} /></mesh>
                        <mesh position={[-0.4, 2.6, 3.3]}><sphereGeometry args={[0.15]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} /></mesh>
                        <pointLight position={[0, 2.6, 3.5]} color="#00ffff" intensity={2} distance={10} />
                    </group>
                </group>

                {/* Sakura Trees */}
                <group position={[0, 0, -22]}>
                    <mesh position={[0, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 1.2, 10]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.1} roughness={0.9} /></mesh>
                    <mesh position={[0, 10, 0]} castShadow receiveShadow><sphereGeometry args={[7, 16, 16]} /><meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={0.2} transparent opacity={0.9} roughness={0.6} side={THREE.DoubleSide} /></mesh>
                </group>
                <group position={[20, 0, -10]}>
                    <mesh position={[0, 4, 0]} castShadow receiveShadow><cylinderGeometry args={[0.5, 0.8, 8]} /><meshStandardMaterial map={tex.woodDark} bumpMap={tex.woodDark} bumpScale={0.1} roughness={0.9} /></mesh>
                    <mesh position={[0, 8, 0]} castShadow receiveShadow><sphereGeometry args={[5, 16, 16]} /><meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={0.2} transparent opacity={0.9} roughness={0.6} side={THREE.DoubleSide} /></mesh>
                </group>

                {/* Wisteria Pergola */}
                <group position={[-15, 0, -10]}>
                    <mesh position={[-3, 2, -3]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[3, 2, -3]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[-3, 2, 3]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[3, 2, 3]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[0, 4, 0]} castShadow receiveShadow><boxGeometry args={[7, 0.2, 7]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    
                    {/* Hanging Wisteria */}
                    {Array.from({ length: 16 }).map((_, i) => (
                        <mesh key={i} position={[(i%4)*1.5 - 2.25, 3, Math.floor(i/4)*1.5 - 2.25]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.1, 0.3, 1.5]} />
                            <meshStandardMaterial color="#a020f0" emissive="#8a2be2" emissiveIntensity={0.1} roughness={0.6} />
                        </mesh>
                    ))}

                    {/* Warm Lanterns */}
                    <group position={[0, 3.5, 0]}>
                        <mesh position={[-2, 0, -2]}><boxGeometry args={[0.4, 0.6, 0.4]} /><meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={3} /><pointLight color="#ffaa00" intensity={2} distance={10} /></mesh>
                        <mesh position={[2, 0, -2]}><boxGeometry args={[0.4, 0.6, 0.4]} /><meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={3} /><pointLight color="#ffaa00" intensity={2} distance={10} /></mesh>
                        <mesh position={[-2, 0, 2]}><boxGeometry args={[0.4, 0.6, 0.4]} /><meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={3} /><pointLight color="#ffaa00" intensity={2} distance={10} /></mesh>
                        <mesh position={[2, 0, 2]}><boxGeometry args={[0.4, 0.6, 0.4]} /><meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={3} /><pointLight color="#ffaa00" intensity={2} distance={10} /></mesh>
                    </group>
                </group>

                {/* Bamboo Fences merged */}
                <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry([
                    ...Array.from({ length: 120 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 3], position: [-30 + (i * 0.5), 1.5, 20] })),
                    ...Array.from({ length: 120 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 3], position: [-30 + (i * 0.5), 1.5, -30] })),
                    ...Array.from({ length: 100 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 3], position: [-30, 1.5, -30 + (i * 0.5)] })),
                    ...Array.from({ length: 100 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 3], position: [30, 1.5, -30 + (i * 0.5)] }))
                ]), [])}>
                    <meshStandardMaterial map={tex.bamboo} bumpMap={tex.bamboo} bumpScale={0.05} roughness={0.8} />
                </mesh>

                {/* Mountain Background (Stepped) */}
                <mesh castShadow receiveShadow position={[0, -2, -40]}>
                    <boxGeometry args={[100, 10, 20]} />
                    <meshStandardMaterial map={tex.stone} color="#2a3a2a" roughness={1} />
                </mesh>
                <mesh castShadow receiveShadow position={[0, 5, -55]}>
                    <boxGeometry args={[120, 15, 20]} />
                    <meshStandardMaterial map={tex.stone} color="#1a2a1a" roughness={1} />
                </mesh>

                {/* Far Waterfall */}
                <mesh position={[-20, 10, -45]}>
                    <planeGeometry args={[4, 25]} />
                    <meshPhysicalMaterial color="#88ddff" emissive="#00aaff" emissiveIntensity={0.5} transmission={0.9} roughness={0} ior={1.33} />
                    <pointLight position={[0, 0, 5]} color="#00aaff" intensity={2} distance={30} />
                </mesh>
                
                {/* Avatars Socializing */}
                <Avatars />
            </RigidBody>
            
            {/* Ambient Lighting & Lanterns */}
            <pointLight position={[0, 1, -15]} color="#00ffff" intensity={2} distance={20} /> {/* Under pond */}
            <pointLight position={[0, 5, 2]} color="#ffaa00" intensity={2} distance={15} /> {/* Inside house */}
            
            <SteamParticles />
            <SakuraPetals />

            {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR' || toolMode === 'ESCALAR') && (
                <TransformControls 
                    object={parentGroupRef} 
                    mode={toolMode === 'MOVER' ? 'translate' : toolMode === 'ROTAR' ? 'rotate' : 'scale'} 
                    onMouseUp={(e) => {
                        if (parentGroupRef.current) { 
                            const pos: [number,number,number] = [parentGroupRef.current.position.x, parentGroupRef.current.position.y, parentGroupRef.current.position.z]; 
                            const rot: [number,number,number] = [parentGroupRef.current.rotation.x, parentGroupRef.current.rotation.y, parentGroupRef.current.rotation.z]; 
                            const scale: [number,number,number] = [parentGroupRef.current.scale.x, parentGroupRef.current.scale.y, parentGroupRef.current.scale.z]; 
                            onTransformEnd(item.id, pos, rot, scale); 
                        }
                    }} 
                />
            )}
            {isSelected && <Outlines thickness={2} color="#D4AF37" />}
        </group>
    );
}
"""
with open("src/components/RyokanNeo.tsx", "w") as f:
    f.write(code)
