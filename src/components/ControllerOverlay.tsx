import React from 'react';
import { X } from 'lucide-react';

interface ControllerOverlayProps {
  onButtonDown: (button: number) => void;
  onButtonUp: (button: number) => void;
  onExit: () => void;
}

export const ControllerOverlay: React.FC<ControllerOverlayProps> = ({ onButtonDown, onButtonUp, onExit }) => {
  const createButton = (button: number, label: string, className: string) => (
    <button
      className={`absolute flex items-center justify-center font-bold text-xs ${className}`}
      onTouchStart={() => onButtonDown(button)}
      onTouchEnd={() => onButtonUp(button)}
      onMouseDown={() => onButtonDown(button)}
      onMouseUp={() => onButtonUp(button)}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-stone-900/90 z-50 flex items-center justify-center p-4">
      <button className="absolute top-4 right-4 text-white" onClick={onExit}>
        <X size={32} />
      </button>

      {/* NES Controller Layout */}
      <div className="relative w-full max-w-2xl h-48 bg-stone-700 rounded-3xl border-b-8 border-r-8 border-stone-800 flex items-center justify-between px-12">
        {/* D-Pad */}
        <div className="relative w-24 h-24">
            {createButton(4, '▲', 'top-0 left-8 w-8 h-8 bg-stone-800 rounded-t')}
            {createButton(5, '▼', 'bottom-0 left-8 w-8 h-8 bg-stone-800 rounded-b')}
            {createButton(6, '◀', 'top-8 left-0 w-8 h-8 bg-stone-800 rounded-l')}
            {createButton(7, '▶', 'top-8 right-0 w-8 h-8 bg-stone-800 rounded-r')}
            <div className="absolute top-8 left-8 w-8 h-8 bg-stone-800"></div>
        </div>

        {/* Start/Select */}
        <div className="flex gap-4">
            {createButton(2, 'SELECT', 'w-16 h-4 bg-stone-800 rounded-full')}
            {createButton(3, 'START', 'w-16 h-4 bg-stone-800 rounded-full')}
        </div>

        {/* A/B */}
        <div className="flex gap-4">
            {createButton(1, 'B', 'w-16 h-16 bg-red-800 rounded-full')}
            {createButton(0, 'A', 'w-16 h-16 bg-red-800 rounded-full')}
        </div>
      </div>
    </div>
  );
};
