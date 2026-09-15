import React from 'react';
import { NES } from 'jsnes';

interface ControllerOverlayProps {
  onButtonDown: (button: number) => void;
  onButtonUp: (button: number) => void;
  onExit: () => void;
}

// NES Buttons based on jsnes
// 0: A
// 1: B
// 2: SELECT
// 3: START
// 4: UP
// 5: DOWN
// 6: LEFT
// 7: RIGHT

export const ControllerOverlay: React.FC<ControllerOverlayProps> = ({ onButtonDown, onButtonUp, onExit }) => {
  const createButton = (button: number, label: string, className: string, shape: 'circle' | 'rect' | 'dpad' = 'rect') => (
    <button
      className={`flex items-center justify-center font-bold text-xs select-none ${className} ${shape === 'circle' ? 'rounded-full' : shape === 'dpad' ? '' : 'rounded'}`}
      onTouchStart={(e) => { e.preventDefault(); onButtonDown(button); }}
      onTouchEnd={(e) => { e.preventDefault(); onButtonUp(button); }}
      onMouseDown={() => onButtonDown(button)}
      onMouseUp={() => onButtonUp(button)}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-stone-800 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-[600px] aspect-[2/1] bg-stone-300 rounded-xl shadow-2xl flex items-center justify-between px-8 py-4 border-b-8 border-r-8 border-stone-400">
        
        {/* D-Pad - using NES Constants */}
        <div className="relative w-32 h-32 ml-4">
            {createButton(NES.Buttons.UP, '', 'absolute top-0 left-10 w-12 h-12 bg-black rounded-t-sm', 'dpad')}
            {createButton(NES.Buttons.DOWN, '', 'absolute bottom-0 left-10 w-12 h-12 bg-black rounded-b-sm', 'dpad')}
            {createButton(NES.Buttons.LEFT, '', 'absolute top-10 left-0 w-12 h-12 bg-black rounded-l-sm', 'dpad')}
            {createButton(NES.Buttons.RIGHT, '', 'absolute top-10 right-0 w-12 h-12 bg-black rounded-r-sm', 'dpad')}
            <div className="absolute top-10 left-10 w-12 h-12 bg-black"></div>
        </div>

        {/* Start/Select Panel - using NES Constants 2,3 */}
        <div className="flex flex-col gap-6 items-center">
            <div className="flex gap-4">
                {createButton(NES.Buttons.SELECT, 'SELECT', 'w-16 h-6 bg-stone-600 text-stone-200 text-[10px]')}
                {createButton(NES.Buttons.START, 'START', 'w-16 h-6 bg-stone-600 text-stone-200 text-[10px]')}
            </div>
            <div className="text-stone-700 font-bold tracking-widest text-xl">Nintendo</div>
        </div>

        {/* A/B Buttons - using NES Constants 0,1 */}
        <div className="flex gap-6 mr-4">
            {createButton(NES.Buttons.BUTTON_B, 'B', 'w-20 h-20 bg-red-600 text-white shadow-inner', 'circle')}
            {createButton(NES.Buttons.BUTTON_A, 'A', 'w-20 h-20 bg-red-600 text-white shadow-inner', 'circle')}
        </div>
      </div>
    </div>
  );
};
