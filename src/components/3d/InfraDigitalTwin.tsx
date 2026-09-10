import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Rotating Radar Beacon Ring
function RadarScanner() {
  const ringRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.4;
    }
    if (pulseRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      pulseRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group ref={ringRef} position={[0, 0.2, 0]}>
      {/* Outer Scanner Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.25, 48]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner Tick Ring */}
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.82, 32]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Elevated Highway / High-Speed Rail Pylons
function InfrastructurePylons() {
  const pylonPositions = useMemo(
    () => [
      [-2.4, 0, -1.2],
      [-1.2, 0, -0.6],
      [0, 0, 0],
      [1.2, 0, 0.6],
      [2.4, 0, 1.2],
    ],
    []
  );

  return (
    <group>
      {pylonPositions.map(([x, y, z], idx) => {
        const height = 1.0 + Math.sin(idx * 0.8) * 0.3;
        return (
          <group key={idx} position={[x, y + height / 2, z]}>
            {/* Structural Column */}
            <mesh>
              <cylinderGeometry args={[0.07, 0.09, height, 8]} />
              <meshStandardMaterial color="#1F2937" roughness={0.6} metalness={0.8} />
            </mesh>
            {/* Telemetry Sensor Head */}
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[0.3, 0.08, 0.2]} />
              <meshStandardMaterial color="#0E131F" roughness={0.4} metalness={0.9} />
            </mesh>
            {/* Glowing Status Light */}
            <mesh position={[0, height / 2 + 0.06, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#10B981' : '#06B6D4'} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Curved Elevated Viaduct Corridor
function ViaductBeam() {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.2, 0.8, -1.6),
      new THREE.Vector3(-1.6, 1.1, -0.8),
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(1.6, 1.3, 0.8),
      new THREE.Vector3(3.2, 1.0, 1.6),
    ]);
  }, []);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.05, 6, false), [curve]);

  return (
    <group>
      {/* Primary Rail Deck */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial color="#374151" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Laser Telemetry Guidance Beam */}
      <mesh geometry={tubeGeo} position={[0, 0.08, 0]}>
        <meshBasicMaterial color="#10B981" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// Floating Telemetry Satellites
function TelemetrySatellites() {
  const satRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (satRef.current) {
      const t = state.clock.elapsedTime * 0.5;
      satRef.current.position.y = Math.sin(t) * 0.15;
      satRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group ref={satRef}>
      {/* Node 1 - Western Corridor */}
      <mesh position={[-1.8, 2.0, 0.8]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#06B6D4" wireframe />
      </mesh>
      {/* Node 2 - Eastern Express Hub */}
      <mesh position={[2.0, 1.8, -0.6]}>
        <dodecahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#10B981" wireframe />
      </mesh>
    </group>
  );
}

// Ground Topographic Digital Grid
function GroundDigitalGrid() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Main Grid Plane */}
      <gridHelper args={[10, 20, '#10B981', '#1F2937']} position={[0, 0, 0]} />
      {/* Low-intensity dark ground reflector */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial color="#07090E" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

export function InfraDigitalTwinScene() {
  return (
    <div className="w-full h-full min-h-[420px] relative select-none">
      <Canvas
        camera={{ position: [3.5, 3.2, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} color="#E0F2FE" />
        <pointLight position={[-3, 2, -2]} intensity={0.8} color="#10B981" />
        <pointLight position={[3, 2, 2]} intensity={0.8} color="#06B6D4" />

        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.3}>
          <group position={[0, -0.6, 0]}>
            <GroundDigitalGrid />
            <RadarScanner />
            <InfrastructurePylons />
            <ViaductBeam />
            <TelemetrySatellites />
          </group>
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>

      {/* Cyberpunk Telemetry Overlay Indicators */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 font-mono text-[10px] text-emerald-400/80 bg-gray-950/60 p-2.5 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SCADA DIGITAL TWIN v2.6</span>
        </div>
        <div className="text-gray-400 text-[9px]">SURFACE SCAN: 4.8 GHz LIDAR</div>
        <div className="text-gray-400 text-[9px]">S-CURVE ACCURACY: 99.4%</div>
      </div>
    </div>
  );
}

// Fallback component for SSR, low-end devices, or while Canvas is loading
export function InfraDigitalTwinFallback() {
  return (
    <div className="w-full h-full min-h-[420px] flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-950 to-[#07090E] rounded-2xl border border-gray-800">
      {/* Radar concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full border border-emerald-500/20 animate-ping opacity-25" />
        <div className="w-56 h-56 rounded-full border border-teal-500/30" />
        <div className="w-40 h-40 rounded-full border border-emerald-500/40" />
        <div className="w-24 h-24 rounded-full border border-cyan-500/50" />
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500" />
      </div>

      <div className="relative z-10 text-center space-y-2 p-6">
        <div className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-widest">
          Telemetry Initializing
        </div>
        <p className="text-xs text-gray-400 max-w-xs">
          Connecting to National Infrastructure Real-Time Feed...
        </p>
      </div>
    </div>
  );
}

export default InfraDigitalTwinScene;
