
import React from 'react';

interface UIControlsProps {
  explodeFactor: number;
  setExplodeFactor: (val: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleGesture: () => void;
  gestureEnabled: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

export const UIControls: React.FC<UIControlsProps> = ({
  explodeFactor,
  setExplodeFactor,
  onUpload,
  toggleGesture,
  gestureEnabled,
  isMuted,
  toggleMute
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
           <h1 className="text-4xl text-yellow-400 tracking-widest drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            CELESTIAL
          </h1>
          <h2 className="text-xl text-white tracking-wider font-light">CHRISTMAS TREE</h2>
        </div>
        
        <div className="flex gap-4">
             <button 
                onClick={toggleMute}
                className="border border-yellow-500/50 text-yellow-500 px-4 py-2 rounded-sm hover:bg-yellow-500/20 transition-all uppercase text-xs tracking-widest"
             >
                {isMuted ? 'UNMUTE' : 'MUTE AUDIO'}
             </button>
             <button 
                onClick={toggleGesture}
                className={`border px-4 py-2 rounded-sm transition-all uppercase text-xs tracking-widest ${
                    gestureEnabled 
                    ? 'border-green-500 text-green-400 bg-green-900/20 shadow-[0_0_10px_rgba(0,255,0,0.3)]' 
                    : 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20'
                }`}
             >
                {gestureEnabled ? 'Gesture Active' : 'Enable Camera'}
             </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-6 pointer-events-auto w-full max-w-md mx-auto items-center">
        
        {/* Upload Button */}
        <div className="relative group overflow-hidden rounded-sm">
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={onUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                title="Upload photos"
            />
            <button className="relative z-10 bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-8 py-3 rounded-sm uppercase tracking-[0.2em] group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300 backdrop-blur-sm pointer-events-none">
                Add Memories
            </button>
        </div>

        {/* Slider */}
        <div className="w-full bg-black/50 backdrop-blur-md p-4 rounded-lg border border-white/10">
            <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-widest">
                <span>Gather</span>
                <span>Explode</span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
        </div>
        
        <div className="text-white/30 text-[10px] uppercase tracking-widest">
            {gestureEnabled ? 'Show palm to explode • Fist to gather • Move hand L/R to rotate' : 'Drag slider or enable camera'}
        </div>
      </div>
    </div>
  );
};
