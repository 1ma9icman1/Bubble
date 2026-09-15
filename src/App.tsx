/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';
import { DriveGameSelector } from './components/DriveGameSelector';
import { Emulator } from './components/Emulator';
import { ControllerOverlay } from './components/ControllerOverlay';

const ControllerView = ({ socket }: { socket: Socket | null }) => {
  const { sessionId, playerId } = useParams();

  const sendInput = (button: number, type: 'down' | 'up') => {
    socket?.emit('controller-input', { sessionId, playerId: parseInt(playerId || '1'), button, type });
  };

  return (
    <div className="w-screen h-screen bg-stone-900 flex flex-col items-center justify-center">
      <h2 className="text-white mb-4">Controller P{playerId}</h2>
      <ControllerOverlay 
        onButtonDown={(btn) => sendInput(btn, 'down')}
        onButtonUp={(btn) => sendInput(btn, 'up')}
        onExit={() => {}}
      />
    </div>
  );
};

const EmulatorView = ({ socket, sessionId, player1Connected, player2Connected, romData, setRomData }: any) => {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const emulatorRef = useRef<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    socket?.on('game-input', (data: any) => {
        if (data.type === 'down') {
            emulatorRef.current?.buttonDown(data.playerId, data.button);
        } else {
            emulatorRef.current?.buttonUp(data.playerId, data.button);
        }
    });
  }, [socket]);

  const triggerFullScreen = () => {
    if (appContainerRef.current && !isFullScreen) {
      appContainerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(console.error);
    }
  };

  return (
    <div ref={appContainerRef} className={`w-screen h-screen flex flex-col items-center justify-center text-white bg-gray-950 ${isFullScreen ? '!p-0' : 'p-4'}`}>
      <div className={`flex flex-col items-center justify-center text-center ${isFullScreen ? 'w-screen h-screen !p-0' : 'bg-black/70 p-8 rounded-lg border-2 border-amber-500 backdrop-blur-sm shadow-xl'}`}>
        <h1 className="text-4xl font-bold mb-6 tracking-tight text-white">NES EMULATOR</h1>
        
        {!isFullScreen && <DriveGameSelector onGameSelected={setRomData} />}
        
        {!isFullScreen && (
          <div className="flex gap-8 justify-center my-8">
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG value={`${window.location.origin}/controller/${sessionId}/1`} size={100} />
              <div className={`flex items-center gap-2 text-sm ${player1Connected ? 'text-green-400' : 'text-gray-400'}`}>
                <Gamepad2 size={16} /> P1: {player1Connected ? 'CONNECTED' : 'DISCONNECTED'}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG value={`${window.location.origin}/controller/${sessionId}/2`} size={100} />
              <div className={`flex items-center gap-2 text-sm ${player2Connected ? 'text-green-400' : 'text-gray-400'}`}>
                <Gamepad2 size={16} /> P2: {player2Connected ? 'CONNECTED' : 'DISCONNECTED'}
              </div>
            </div>
          </div>
        )}

        <div className={`mt-8 ${isFullScreen ? 'w-full h-full' : 'w-full max-w-3xl'}`} onClick={triggerFullScreen}>
          <Emulator ref={emulatorRef} romData={romData} onStart={triggerFullScreen} />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [romData, setRomData] = useState<Uint8Array | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [player1Connected, setPlayer1Connected] = useState(false);
  const [player2Connected, setPlayer2Connected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join-session', sessionId);
    });
    return () => { socketRef.current?.disconnect(); };
  }, [sessionId]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/controller/:sessionId/:playerId" element={<ControllerView socket={socketRef.current} />} />
        <Route path="/" element={<EmulatorView 
          socket={socketRef.current} 
          sessionId={sessionId}
          player1Connected={player1Connected}
          player2Connected={player2Connected}
          romData={romData}
          setRomData={setRomData}
        />} />
      </Routes>
    </BrowserRouter>
  );
}

