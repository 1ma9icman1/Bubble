/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Gamepad2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';
import { DriveGameSelector } from './components/DriveGameSelector';
import { Emulator } from './components/Emulator';
import { ControllerOverlay } from './components/ControllerOverlay';

export default function App() {
  const [romData, setRomData] = useState<Uint8Array | null>(null);
  const [player1Connected, setPlayer1Connected] = useState(false);
  const [player2Connected, setPlayer2Connected] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const emulatorRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const triggerFullScreen = () => {
    if (appContainerRef.current && !isFullScreen) {
      appContainerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(console.error);
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen().then(() => setIsFullScreen(false)).catch(console.error);
    } else {
        setIsFullScreen(false);
    }
  };

  useEffect(() => {
    if ((player1Connected && player2Connected)) {
      triggerFullScreen();
    }
  }, [player1Connected, player2Connected]);

  const emulatorContent = (
    <div className={`mt-8 ${isFullScreen ? 'w-full h-full' : 'w-full max-w-3xl'}`} onClick={triggerFullScreen}>
      <Emulator ref={emulatorRef} romData={romData} onStart={triggerFullScreen} />
      {isFullScreen && (
        <ControllerOverlay
          onButtonDown={(btn) => emulatorRef.current?.buttonDown(1, btn)}
          onButtonUp={(btn) => emulatorRef.current?.buttonUp(1, btn)}
          onExit={exitFullScreen}
        />
      )}
    </div>
  );

  return (
    <div ref={appContainerRef} className={`w-screen h-screen flex flex-col items-center justify-center text-white bg-gray-950 ${isFullScreen ? '!p-0' : 'p-4'}`}>
      <div className={`flex flex-col items-center justify-center text-center ${isFullScreen ? 'w-screen h-screen !p-0' : 'bg-black/70 p-8 rounded-lg border-2 border-amber-500 backdrop-blur-sm shadow-xl'}`}>
        <h1 className="text-4xl font-bold mb-6 tracking-tight text-white">
          NES EMULATOR
        </h1>
        
        {!isFullScreen && <DriveGameSelector onGameSelected={setRomData} />}
        
        {!isFullScreen && (
          <div className="flex gap-8 justify-center my-8">
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG value="P1_CONNECT" size={100} />
              <div className={`flex items-center gap-2 text-sm ${player1Connected ? 'text-green-400' : 'text-gray-400'}`}>
                <Gamepad2 size={16} /> P1: {player1Connected ? 'CONNECTED' : 'DISCONNECTED'}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG value="P2_CONNECT" size={100} />
              <div className={`flex items-center gap-2 text-sm ${player2Connected ? 'text-green-400' : 'text-gray-400'}`}>
                <Gamepad2 size={16} /> P2: {player2Connected ? 'CONNECTED' : 'DISCONNECTED'}
              </div>
            </div>
          </div>
        )}

        {emulatorContent}
      </div>
    </div>
  );
}

