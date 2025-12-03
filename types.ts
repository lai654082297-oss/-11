import * as THREE from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

export interface PhotoData {
  id: string;
  url: string;
}

export enum GestureState {
  NONE = 'None',
  OPEN_PALM = 'Open_Palm',
  CLOSED_FIST = 'Closed_Fist',
  MOVING_LEFT = 'Moving_Left',
  MOVING_RIGHT = 'Moving_Right'
}

export interface AppState {
  explodeFactor: number; // 0 to 1
  rotationSpeed: number;
  isAudioPlaying: boolean;
  gestureControlEnabled: boolean;
}

export const COLORS = {
  RED: '#D00000',
  BLUE: '#0044AA',
  GOLD: '#FFD700',
  SILVER: '#EEEEEE',
  WARM_LIGHT: '#FFD700',
  TREE_GREEN: '#0f2e15' // Deep green
};

// Shim to fix JSX IntrinsicElements errors for R3F components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      color: any;
      group: any;
      mesh: any;
      points: any;
      instancedMesh: any;
      bufferGeometry: any;
      boxGeometry: any;
      sphereGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
    }
  }
}
