import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import { PhotoData } from '../types';

interface PhotoSpiralProps {
  photos: PhotoData[];
  explodeFactor: number;
}

export const PhotoSpiral: React.FC<PhotoSpiralProps> = ({ photos, explodeFactor }) => {
  // We need placeholder photos if not enough user photos
  const displayPhotos = useMemo(() => {
    const slots = 20; // Number of slots in the spiral
    const result = [...photos];
    // Fill remaining with placeholders or cycle
    for (let i = result.length; i < slots; i++) {
        // Placeholder or repeat
        // Using a solid white texture style for "Polaroid" placeholder feel if no image
        result.push({ id: `placeholder-${i}`, url: '' }); // Logic inside map handles empty url
    }
    return result;
  }, [photos]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((child, i) => {
        // Spiral Math
        const progress = i / displayPhotos.length; // 0 to 1 top to bottom
        const height = 15;
        const yBase = (1 - progress) * height - (height / 2); 
        
        const spirals = 3; // How many wraps
        const theta = progress * Math.PI * 2 * spirals;
        
        const baseRadius = 6.5; // Outside the ornaments
        const radiusAtHeight = (1 - (yBase + height/2)/height) * baseRadius + 1.0; 
        
        let x = radiusAtHeight * Math.cos(theta);
        let z = radiusAtHeight * Math.sin(theta);
        let y = yBase;

        let scale = 1.0;

        if (explodeFactor > 0.001) {
             const dist = Math.sqrt(x * x + z * z);
             const dirX = x / dist;
             const dirZ = z / dist;
             
             // Expand significantly
             x = x + dirX * explodeFactor * 8;
             z = z + dirZ * explodeFactor * 8;
             
             // Scale up 3x as requested
             scale = 1.0 + (explodeFactor * 2.0);
             
             // Float effect
             y += Math.sin(time * 0.5 + i) * 0.5 * explodeFactor;
        }

        child.position.set(x, y, z);
        
        // Orientation: Look away from center
        child.lookAt(x * 2, y, z * 2);
        
        // Apply tilt based on spiral slope (approximate)
        if (explodeFactor < 0.1) {
            child.rotateZ(0.2); // Slight tilt to match spiral path
        } else {
             // Straighten up when floating
             child.rotation.z = THREE.MathUtils.lerp(child.rotation.z, 0, explodeFactor);
        }

        child.scale.setScalar(scale);
    });
  });

  return (
    <group ref={groupRef}>
      {displayPhotos.map((photo, i) => (
        <PhotoItem key={photo.id} url={photo.url} index={i} />
      ))}
    </group>
  );
};

const PhotoItem: React.FC<{ url: string; index: number }> = ({ url, index }) => {
    // Polaroid Style Frame
    return (
        <group>
            {/* The Photo */}
            <Image 
                url={url || "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=80"} // Fallback festive texture
                transparent
                side={THREE.DoubleSide}
                position={[0, 0.1, 0.01]} // Offset slightly from backing
                scale={[1.3, 1.3]} // Image size
                opacity={url ? 1 : 0.2} // Dim placeholder
                color={url ? 'white' : '#ccc'}
            />
            {/* The White Frame Backing */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.5, 1.8, 0.02]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
        </group>
    )
}
