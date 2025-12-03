import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../types';

interface TreeParticlesProps {
  explodeFactor: number;
}

export const TreeParticles: React.FC<TreeParticlesProps> = ({ explodeFactor }) => {
  const count = 25000;
  const mesh = useRef<THREE.Points>(null);
  
  // Generate cone-shaped particles
  const { positions, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    
    const height = 15;
    const baseRadius = 6;

    for (let i = 0; i < count; i++) {
      // Height from 0 to 15, biased towards bottom for fullness? No, cone is standard.
      const y = Math.random() * height; 
      
      // Radius at this height
      const rMax = (1 - y / height) * baseRadius;
      // Random radius within the cone volume (square root for uniform disk distribution logic applied to cone slices)
      const r = rMax * Math.sqrt(Math.random());
      
      const theta = Math.random() * Math.PI * 2;

      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      
      // Center the tree vertically
      const py = y - height / 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = py;
      originalPositions[i * 3 + 2] = z;
    }
    return { positions, originalPositions };
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsAttr = mesh.current.geometry.attributes.position;
    
    // Animation Loop
    for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const ox = originalPositions[ix];
        const oy = originalPositions[iy];
        const oz = originalPositions[iz];

        // Explode logic: Push outwards from center (0, y, 0)
        // Also add a slight floaty rotation when exploded
        
        let targetX = ox;
        let targetY = oy;
        let targetZ = oz;

        if (explodeFactor > 0.01) {
             const dist = Math.sqrt(ox * ox + oz * oz);
             const dirX = dist === 0 ? 0 : ox / dist;
             const dirZ = dist === 0 ? 0 : oz / dist;
             
             // Expand outwards
             targetX = ox + dirX * explodeFactor * 5; // Expand up to 5 units out
             targetZ = oz + dirZ * explodeFactor * 5;
             // Levitate/Float effect
             targetY = oy + Math.sin(time + i) * 0.5 * explodeFactor;
        }

        // Apply
        positionsAttr.setXYZ(i, targetX, targetY, targetZ);
    }
    positionsAttr.needsUpdate = true;
    
    // Subtle rotation of the whole tree handled by parent or camera, but we can shimmer here
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={COLORS.TREE_GREEN}
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
