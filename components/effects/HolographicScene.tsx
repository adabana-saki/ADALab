'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function HolographicSphere({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2 * speed}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  );
}

function RotatingRing({ position, color, axis = 'y' }: { position: [number, number, number]; color: string; axis?: 'x' | 'y' | 'z' }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (axis === 'x') meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      if (axis === 'y') meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      if (axis === 'z') meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[2, 0.1, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function DNA_Helix() {
  const groupRef = useRef<THREE.Group>(null);
  const spheres = 20;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[8, 0, -5]}>
      {Array.from({ length: spheres }).map((_, i) => {
        const t = (i / spheres) * Math.PI * 4;
        const x = Math.cos(t) * 1.5;
        const y = (i / spheres) * 6 - 3;
        const z = Math.sin(t) * 1.5;

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#06b6d4' : '#d946ef'}
              emissive={i % 2 === 0 ? '#06b6d4' : '#d946ef'}
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingCrystals() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[-6, 2, -8]}>
      {/* Crystal cluster */}
      <mesh position={[0, 0, 0]} rotation={[0.5, 0, 0.3]}>
        <octahedronGeometry args={[0.8]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[1, 0.5, 0]} rotation={[0.3, 0.5, 0.1]}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[-0.8, 0.3, 0.5]} rotation={[0.1, 0.8, 0.4]}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial
          color="#d946ef"
          emissive="#d946ef"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export function HolographicScene() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#d946ef" />
        <pointLight position={[0, 5, 5]} intensity={0.6} color="#8b5cf6" />

        {/* Holographic spheres */}
        <HolographicSphere position={[-5, 3, -5]} color="#06b6d4" speed={0.8} />
        <HolographicSphere position={[5, -2, -8]} color="#d946ef" speed={1.2} />
        <HolographicSphere position={[0, 4, -10]} color="#8b5cf6" speed={1} />

        {/* Rotating rings */}
        <RotatingRing position={[0, 0, -15]} color="#06b6d4" axis="x" />
        <RotatingRing position={[0, 0, -15]} color="#d946ef" axis="y" />
        <RotatingRing position={[0, 0, -15]} color="#8b5cf6" axis="z" />

        {/* DNA Helix */}
        <DNA_Helix />

        {/* Floating crystals */}
        <FloatingCrystals />

        {/* Additional geometric shapes */}
        <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
          <mesh position={[-8, -3, -6]}>
            <dodecahedronGeometry args={[1.2]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={0.4}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>

        <Float speed={1.8} rotationIntensity={0.8} floatIntensity={0.6}>
          <mesh position={[7, 3, -7]} rotation={[0.5, 0.5, 0]}>
            <icosahedronGeometry args={[0.9]} />
            <meshStandardMaterial
              color="#d946ef"
              emissive="#d946ef"
              emissiveIntensity={0.4}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      </Canvas>
    </div>
  );
}
