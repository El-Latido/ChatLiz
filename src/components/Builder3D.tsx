import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { UserObj } from '../types';

interface Builder3DProps {
  user: UserObj;
}

export function Builder3D({ user }: Builder3DProps) {
  // Validar si tiene acceso (solo usuario AXISS)
  const hasAccess = user && user.username?.toUpperCase() === 'AXISS';

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#0a0f1c]">
        <div className="bg-[#121B2A] border border-red-500/50 rounded-2xl p-8 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso Restringido</h1>
          <p className="text-gray-300">Área de construcción - Solo para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black fixed inset-0 z-[300]">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        {/* Background color */}
        <color attach="background" args={['#e0e0e0']} />

        {/* Basic lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />

        {/* Large floor plane */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>

        {/* Orbit Controls for camera rotation */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
