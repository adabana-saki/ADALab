'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isWebGLAvailable } from '@/lib/webgl';

function Particles() {
  const ref = useRef<THREE.Points>(null);

  const particlesCount = 2000;
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.075;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color="#3b82f6"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </points>
  );
}

export function ParticleField() {
  const [isMounted, setIsMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(false);
  // コンテキストロストから復帰したら Canvas を作り直すためのキー
  const [glKey, setGlKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    setWebGLSupported(isWebGLAvailable());
  }, []);

  if (!isMounted || !webGLSupported) return null;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        key={glKey}
        camera={{ position: [0, 0, 3], fov: 75 }}
        // 装飾背景なので低電力 GPU を指定し、コンテキストロストの発生自体を減らす
        gl={{ alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          // preventDefault しないとブラウザは webglcontextrestored を発火しない
          canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
          // 復帰したら Canvas ごと作り直して背景が固まったままになるのを防ぐ
          canvas.addEventListener('webglcontextrestored', () => setGlKey((k) => k + 1));
        }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
