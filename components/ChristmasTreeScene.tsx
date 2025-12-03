import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeParticles } from './TreeParticles';
import { Ornaments } from './Ornaments';
import { PhotoSpiral } from './PhotoSpiral';
import { Lights } from './Lights';
import { CelebrationParticles } from './CelebrationParticles';
import { PhotoData, GestureState } from '../types';
import { audioManager } from '../services/audio';

interface SceneProps {
  explodeFactor: number;
  rotationSpeed: number;
  photos: PhotoData[];
  gestureState: GestureState;
  celebrationTrigger: number;
}

const SceneContent: React.FC<SceneProps> = ({ explodeFactor, rotationSpeed, photos, gestureState, celebrationTrigger }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation logic: Auto rotate slowly, modify by gesture
      let speed = 0.1; // Base slow rotation
      
      if (gestureState === GestureState.MOVING_LEFT) {
          speed = -0.5;
      } else if (gestureState === GestureState.MOVING_RIGHT) {
          speed = 0.5;
      }
      
      // Smoothly interpolate rotation speed could be nice, but direct is responsive
      groupRef.current.rotation.y += speed * delta * (1 - explodeFactor * 0.8); // Slow down rotation when exploded
    }
  });

  return (
    <group ref={groupRef}>
      <TreeParticles explodeFactor={explodeFactor} />
      <Ornaments explodeFactor={explodeFactor} />
      <PhotoSpiral photos={photos} explodeFactor={explodeFactor} />
      <Lights />
      <CelebrationParticles trigger={celebrationTrigger} />
    </group>
  );
};

export const ChristmasTreeScene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ 
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: true
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={50} />
      
      <color attach="background" args={['#000000']} />
      
      {/* Starfield */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <SceneContent {...props} />
      
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={0.4} 
            radius={0.6}
        />
      </EffectComposer>
    </Canvas>
  );
};