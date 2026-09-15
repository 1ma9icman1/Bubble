/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Gamepad2, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const [player1Connected, setPlayer1Connected] = useState(false);
  const [player2Connected, setPlayer2Connected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
    });
    // In a real production app, handle controller events from server
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Loading ROM:", file.name);
      // Logic to send ROM file or path to emulator
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
      <div className="bg-black/70 p-8 rounded-lg border-2 border-amber-500 backdrop-blur-sm shadow-xl text-center">
        <h1 className="text-4xl font-bold mb-8 text-amber-300 tracking-widest font-mono">RETRO ARCADE</h1>
        
        <div className="flex gap-4 justify-center mb-8">
          <label className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer">
            <Upload size={20} />
            LOAD ROM
            <input type="file" className="hidden" accept=".nes" onChange={handleFileLoad} />
          </label>
        </div>

        <div className="flex gap-8 justify-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <QRCodeSVG value="P1_CONNECT" size={128} />
            <div className={`flex items-center gap-2 ${player1Connected ? 'text-green-400' : 'text-gray-400'}`}>
              <Gamepad2 /> P1: {player1Connected ? 'CONNECTED' : 'DISCONNECTED'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QRCodeSVG value="P2_CONNECT" size={128} />
            <div className={`flex items-center gap-2 ${player2Connected ? 'text-green-400' : 'text-gray-400'}`}>
              <Gamepad2 /> P2: {player2Connected ? 'CONNECTED' : 'DISCONNECTED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

