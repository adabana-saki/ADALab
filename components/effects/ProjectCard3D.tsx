'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Card3DProps {
  index: number;
  color: string;
  emissiveColor: string;
}

function Card3D({ index, color, emissiveColor }: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      const offset = index * 2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + offset) * 0.1;

      // Auto-rotation when not hovered
      if (!hovered) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + index;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
      }
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <RoundedBox
        ref={meshRef}
        args={[1.5, 2, 0.1]}
        radius={0.05}
        smoothness={4}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.8}
        />
      </RoundedBox>

      {/* Wireframe overlay */}
      <RoundedBox
        args={[1.52, 2.02, 0.12]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial color={emissiveColor} wireframe opacity={hovered ? 1 : 0.3} transparent />
      </RoundedBox>
    </Float>
  );
}

export function ProjectCard3D() {
  const [isMounted, setIsMounted] = useState(false);

  useState(() => {
    setIsMounted(true);
  });

  if (!isMounted) return null;

  return (
    <div className="w-full h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#d946ef" />

        {/* Three project cards */}
        <group position={[-2.5, 0, 0]}>
          <Card3D index={0} color="#0a0a0a" emissiveColor="#06b6d4" />
        </group>
        <group position={[0, 0, 0]}>
          <Card3D index={1} color="#0a0a0a" emissiveColor="#d946ef" />
        </group>
        <group position={[2.5, 0, 0]}>
          <Card3D index={2} color="#0a0a0a" emissiveColor="#8b5cf6" />
        </group>
      </Canvas>
    </div>
  );
}
