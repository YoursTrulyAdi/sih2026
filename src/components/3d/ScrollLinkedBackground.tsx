import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/lib/theme-context';

// Layer 1: Deep Constellation / Topo Grid (Far Depth)
function DeepSpaceLayer({ scroll, isLight }: { scroll: number; isLight: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = -8 + (Math.random() - 0.5) * 4;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta * 0.02;
      pointsRef.current.position.y = THREE.MathUtils.lerp(
        pointsRef.current.position.y,
        scroll * 2.0,
        0.05
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={isLight ? '#0284C7' : '#10B981'}
        transparent
        opacity={isLight ? 0.45 : 0.35}
        sizeAttenuation
      />
    </points>
  );
}

// Layer 2: Holographic Radar Rings & Coordinate Beams (Mid Depth)
function MidDepthRadarRings({ scroll, isLight }: { scroll: number; isLight: boolean }) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -scroll * 5.0,
        0.08
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        scroll * 0.8,
        0.08
      );
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.2;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.25;
  });

  return (
    <group ref={groupRef} position={[2.5, 0, -3.5]}>
      {/* Outer Telemetry Ring */}
      <mesh ref={ring1} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[2.2, 2.24, 48]} />
        <meshBasicMaterial 
          color={isLight ? '#0284C7' : '#06B6D4'} 
          transparent 
          opacity={isLight ? 0.35 : 0.22} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Inner Scanner Disc */}
      <mesh ref={ring2} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.4, 1.43, 32]} />
        <meshBasicMaterial 
          color={isLight ? '#059669' : '#10B981'} 
          transparent 
          opacity={isLight ? 0.38 : 0.28} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Coordinate Crosswire */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[3.2, 0.015, 0.015]} />
        <meshBasicMaterial 
          color={isLight ? '#0284C7' : '#10B981'} 
          transparent 
          opacity={isLight ? 0.25 : 0.15} 
        />
      </mesh>
    </group>
  );
}

// Layer 3: Floating Infrastructure Digital Nodes (Near Depth)
function NearNodesLayer({ scroll, isLight }: { scroll: number; isLight: boolean }) {
  const nodesGroup = useRef<THREE.Group>(null);

  const nodeOffsets = useMemo(
    () => [
      [-3.2, 2.0, 0.5],
      [3.0, -1.5, 0.2],
      [-2.0, -3.5, 0.8],
      [2.2, -6.0, 0.4],
      [-2.8, -9.0, 0.6],
    ],
    []
  );

  useFrame((state, delta) => {
    if (nodesGroup.current) {
      nodesGroup.current.position.y = THREE.MathUtils.lerp(
        nodesGroup.current.position.y,
        scroll * 8.5,
        0.1
      );
      nodesGroup.current.rotation.y = THREE.MathUtils.lerp(
        nodesGroup.current.rotation.y,
        scroll * 0.5,
        0.05
      );
    }
  });

  return (
    <group ref={nodesGroup} position={[0, 0, 0]}>
      {nodeOffsets.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh rotation={[idx * 0.4, idx * 0.6, 0]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={
                isLight 
                  ? (idx % 2 === 0 ? '#059669' : '#0284C7')
                  : (idx % 2 === 0 ? '#10B981' : '#06B6D4')
              }
              wireframe
              transparent
              opacity={isLight ? 0.45 : 0.35}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function ScrollLinkedBackgroundContent() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            const progress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  if (reducedMotion) {
    return (
      <div 
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-0 ${isLight ? 'bg-slate-50' : 'bg-[#07090E]'}`} 
      />
    );
  }

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.25]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <ambientLight intensity={isLight ? 0.7 : 0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.6} 
          color={isLight ? '#059669' : '#10B981'} 
        />
        <directionalLight 
          position={[-5, -5, 2]} 
          intensity={0.4} 
          color={isLight ? '#0284C7' : '#06B6D4'} 
        />

        <DeepSpaceLayer scroll={scrollProgress} isLight={isLight} />
        <MidDepthRadarRings scroll={scrollProgress} isLight={isLight} />
        <NearNodesLayer scroll={scrollProgress} isLight={isLight} />
      </Canvas>
    </div>
  );
}

export default ScrollLinkedBackgroundContent;
