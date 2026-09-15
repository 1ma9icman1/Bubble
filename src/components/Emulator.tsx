import { useEffect, useRef } from 'react';
import { NES } from 'jsnes';

export const Emulator = ({ romData, onStart }: { romData: Uint8Array | null, onStart?: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nesRef = useRef<NES | null>(null);

  useEffect(() => {
    if (!romData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nes = new NES({
      onFrame: (buffer: Uint32Array) => {
        const imageData = ctx.createImageData(256, 240);
        for (let i = 0; i < buffer.length; i++) {
          imageData.data[i * 4] = (buffer[i] >> 16) & 0xFF;
          imageData.data[i * 4 + 1] = (buffer[i] >> 8) & 0xFF;
          imageData.data[i * 4 + 2] = buffer[i] & 0xFF;
          imageData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      },
      onStatusUpdate: () => {},
      sampleRate: 44100,
    });

    nes.loadROM(romData);
    nesRef.current = nes;

    const interval = setInterval(() => {
      nes.frame();
    }, 1000 / 60);

    return () => {
      clearInterval(interval);
      nesRef.current = null;
    };
  }, [romData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!nesRef.current) return;
      const controller = 1;
      switch (e.key) {
        case 'ArrowUp': nesRef.current.buttonDown(controller, NES.Buttons.UP); break;
        case 'ArrowDown': nesRef.current.buttonDown(controller, NES.Buttons.DOWN); break;
        case 'ArrowLeft': nesRef.current.buttonDown(controller, NES.Buttons.LEFT); break;
        case 'ArrowRight': nesRef.current.buttonDown(controller, NES.Buttons.RIGHT); break;
        case 'z': nesRef.current.buttonDown(controller, NES.Buttons.A); break;
        case 'x': nesRef.current.buttonDown(controller, NES.Buttons.B); break;
        case 'Enter': 
          nesRef.current.buttonDown(controller, NES.Buttons.START); 
          onStart?.();
          break;
        case 'Shift': nesRef.current.buttonDown(controller, NES.Buttons.SELECT); break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!nesRef.current) return;
      const controller = 1;
      switch (e.key) {
        case 'ArrowUp': nesRef.current.buttonUp(controller, NES.Buttons.UP); break;
        case 'ArrowDown': nesRef.current.buttonUp(controller, NES.Buttons.DOWN); break;
        case 'ArrowLeft': nesRef.current.buttonUp(controller, NES.Buttons.LEFT); break;
        case 'ArrowRight': nesRef.current.buttonUp(controller, NES.Buttons.RIGHT); break;
        case 'z': nesRef.current.buttonUp(controller, NES.Buttons.A); break;
        case 'x': nesRef.current.buttonUp(controller, NES.Buttons.B); break;
        case 'Enter': nesRef.current.buttonUp(controller, NES.Buttons.START); break;
        case 'Shift': nesRef.current.buttonUp(controller, NES.Buttons.SELECT); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onStart]);

  return <canvas ref={canvasRef} width="256" height="240" className="w-full h-auto aspect-[256/240] bg-black border-4 border-white/10" />;
};
