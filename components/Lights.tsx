import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../types';

export const Lights: React.FC = () => {
  const fairyLightsRef = useRef<THREE.InstancedMesh>(null);
  const count = 250;
  
  const { positions, colors, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    const height = 15;
    const baseRadius = 5.8;

    for (let i = 0; i < count; i++) {
       const y = Math.random() * height;
       const r = (1 - y/height) * baseRadius * (0.9 + Math.random()*0.1);
       const theta = Math.random() * Math.PI * 2;
       
       positions[i * 3] = r * Math.cos(theta);
       positions[i * 3 + 1] = y - height/2;
       positions[i * 3 + 2] = r * Math.sin(theta);
       
       const c = new THREE.Color();
       const roll = Math.random();
       if(roll < 0.25) c.set(COLORS.RED);
       else if(roll < 0.5) c.set(COLORS.BLUE);
       else if(roll < 0.75) c.set(COLORS.GOLD);
       else c.set('#00ff00'); // Green light
       
       colors[i * 3] = c.r;
       colors[i * 3 + 1] = c.g;
       colors[i * 3 + 2] = c.b;
       
       phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, phases };
  }, []);

  const tempColor = new THREE.Color();

  useFrame((state) => {
      if (!fairyLightsRef.current) return;
      const time = state.clock.getElapsedTime();
      
      for(let i=0; i<count; i++) {
          // Blink logic
          const intensity = (Math.sin(time * 3 + phases[i]) + 1) * 0.5 + 0.5; // 0.5 to 1.5 intensity roughly
          
          tempColor.setRGB(
              colors[i*3] * intensity,
              colors[i*3+1] * intensity,
              colors[i*3+2] * intensity
          );
          
          fairyLightsRef.current.setColorAt(i, tempColor);
      }
      fairyLightsRef.current.instanceColor!.needsUpdate = true;
  });

  // Init positions once
  useMemo(() => {
     // We can set matrix at init since they don't move relative to tree logic in this simple component
     // (Or strictly they should move with explode, but keeping them static inside the tree volume for simplicity 
     // unless we want to copy the explode logic here too. Let's make them static to the tree for now or simple float)
     // To keep code concise, we'll assume they are attached to the tree group which might explode, 
     // but here we are just separate. Let's make them InstancedMesh and set positions.
     const tempObj = new THREE.Object3D();
     setTimeout(() => {
         if(!fairyLightsRef.current) return;
         for(let i=0; i<count; i++) {
             tempObj.position.set(positions[i*3], positions[i*3+1], positions[i*3+2]);
             tempObj.scale.setScalar(0.05); // Tiny bulbs
             tempObj.updateMatrix();
             fairyLightsRef.current.setMatrixAt(i, tempObj.matrix);
         }
         fairyLightsRef.current.instanceMatrix.needsUpdate = true;
     }, 0);
  }, [positions]);

  return (
    <>
      <ambientLight intensity={0.2} color={COLORS.WARM_LIGHT} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={1500} 
        color={COLORS.GOLD} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={500} color="#aaddff" />
      
      <instancedMesh ref={fairyLightsRef} args={[undefined, undefined, count]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial toneMapped={false} /> {/* Basic material for glowing look with Bloom */}
      </instancedMesh>
    </>
  );
};
