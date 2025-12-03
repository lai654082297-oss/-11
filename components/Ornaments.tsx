import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../types';

interface OrnamentsProps {
  explodeFactor: number;
}

const TEMP_OBJECT = new THREE.Object3D();
const TEMP_COLOR = new THREE.Color();

export const Ornaments: React.FC<OrnamentsProps> = ({ explodeFactor }) => {
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const sphereRef = useRef<THREE.InstancedMesh>(null);
  
  const count = 1200; // Total ornaments split between shapes
  const sphereCount = Math.floor(count * 0.6);
  const boxCount = count - sphereCount;

  // Generate data
  const { sphereData, boxData } = useMemo(() => {
    const generateData = (cnt: number) => {
        const data = [];
        const height = 15;
        const baseRadius = 5.5; // Slightly inside the needle tips
        
        for (let i = 0; i < cnt; i++) {
            const y = Math.random() * height;
            const r = (1 - y / height) * baseRadius * (0.8 + Math.random() * 0.2); // Mostly on surface
            const theta = Math.random() * Math.PI * 2;
            
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            const py = y - height / 2;
            
            // Random color from palette
            const palette = [COLORS.RED, COLORS.BLUE, COLORS.GOLD, COLORS.SILVER];
            const color = palette[Math.floor(Math.random() * palette.length)];

            data.push({ x, y: py, z, color, r, theta, scale: 0.15 + Math.random() * 0.15 });
        }
        return data;
    };

    return {
        sphereData: generateData(sphereCount),
        boxData: generateData(boxCount)
    };
  }, []);

  useLayoutEffect(() => {
     // Initial Color Set
     if (sphereRef.current) {
        sphereData.forEach((d, i) => {
            TEMP_COLOR.set(d.color);
            sphereRef.current!.setColorAt(i, TEMP_COLOR);
        });
        sphereRef.current.instanceColor!.needsUpdate = true;
     }
     if (boxRef.current) {
        boxData.forEach((d, i) => {
            TEMP_COLOR.set(d.color);
            boxRef.current!.setColorAt(i, TEMP_COLOR);
        });
        boxRef.current.instanceColor!.needsUpdate = true;
     }
  }, [sphereData, boxData]);

  useFrame((state) => {
      const time = state.clock.getElapsedTime();
      
      const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, data: any[]) => {
          if (!ref.current) return;
          
          data.forEach((d, i) => {
              let { x, y, z, scale } = d;
              
              if (explodeFactor > 0.001) {
                  // Explode logic similar to particles but with independent rotation
                  const dist = Math.sqrt(x * x + z * z);
                  const dirX = dist === 0 ? 0 : x / dist;
                  const dirZ = dist === 0 ? 0 : z / dist;

                  x = x + dirX * explodeFactor * 6; // Push further than needles
                  z = z + dirZ * explodeFactor * 6;
                  y = y + Math.sin(time * 0.5 + i) * 1.0 * explodeFactor; // Float
                  
                  // Spin while floating
                  TEMP_OBJECT.rotation.set(time + i, time + i, 0);
              } else {
                  TEMP_OBJECT.rotation.set(0, 0, 0);
              }
              
              TEMP_OBJECT.position.set(x, y, z);
              TEMP_OBJECT.scale.setScalar(scale);
              TEMP_OBJECT.updateMatrix();
              ref.current!.setMatrixAt(i, TEMP_OBJECT.matrix);
          });
          ref.current.instanceMatrix.needsUpdate = true;
      };

      updateMesh(sphereRef, sphereData);
      updateMesh(boxRef, boxData);
  });

  const materialProps = {
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1,
  };

  return (
    <group>
        <instancedMesh ref={sphereRef} args={[undefined, undefined, sphereCount]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial {...materialProps} />
        </instancedMesh>
        <instancedMesh ref={boxRef} args={[undefined, undefined, boxCount]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial {...materialProps} />
        </instancedMesh>
    </group>
  );
};
