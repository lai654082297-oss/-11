import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CelebrationParticlesProps {
  trigger: number;
}

export const CelebrationParticles: React.FC<CelebrationParticlesProps> = ({ trigger }) => {
  const count = 1000;
  const mesh = useRef<THREE.Points>(null);
  const startTime = useRef<number>(0);
  const isAnimating = useRef<boolean>(false);

  // Store simulation data
  const { initialVelocities, colors } = useMemo(() => {
    const initialVelocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#D00000'), // Red
      new THREE.Color('#0044AA'), // Blue
      new THREE.Color('#FFFFFF'), // White
      new THREE.Color('#00FF00'), // Green
    ];

    for (let i = 0; i < count; i++) {
        // Random spherical direction
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 4 + Math.random() * 8; // Burst speed

        initialVelocities[i*3] = speed * Math.sin(phi) * Math.cos(theta);
        initialVelocities[i*3+1] = speed * Math.sin(phi) * Math.sin(theta);
        initialVelocities[i*3+2] = speed * Math.cos(phi);

        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
    }

    return { initialVelocities, colors };
  }, []);

  // Use a ref for current velocities to allow mutation during animation
  const currentVelocities = useRef<Float32Array>(new Float32Array(count * 3));

  useEffect(() => {
    if (trigger === 0) return;

    // Reset Animation
    startTime.current = Date.now();
    isAnimating.current = true;

    if (mesh.current) {
        mesh.current.visible = true;
        const posAttr = mesh.current.geometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        
        // Reset positions to center (0,0,0) and restore velocities
        for(let i=0; i<count*3; i++) {
            posArray[i] = 0;
            currentVelocities.current[i] = initialVelocities[i];
        }
        
        posAttr.needsUpdate = true;
        (mesh.current.material as THREE.PointsMaterial).opacity = 1;
    }
  }, [trigger, initialVelocities]);

  useFrame((state, delta) => {
    if (!isAnimating.current || !mesh.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const duration = 2.0;

    if (elapsed > duration) {
        isAnimating.current = false;
        mesh.current.visible = false;
        return;
    }

    const posAttr = mesh.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;
    const velArray = currentVelocities.current;

    for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // Apply Gravity
        velArray[iy] -= 9.8 * delta * 0.8; 
        
        // Apply Drag
        velArray[ix] *= 0.98;
        velArray[iy] *= 0.98;
        velArray[iz] *= 0.98;

        // Update Position
        posArray[ix] += velArray[ix] * delta;
        posArray[iy] += velArray[iy] * delta;
        posArray[iz] += velArray[iz] * delta;
    }

    posAttr.needsUpdate = true;

    // Fade out
    const material = mesh.current.material as THREE.PointsMaterial;
    material.opacity = Math.max(0, 1 - (elapsed / duration));
  });

  return (
    <points ref={mesh} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(count * 3)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};