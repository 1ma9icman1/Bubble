import { useEffect, useState } from 'react';

export const DriveGameSelector = ({ onGameSelected }: { onGameSelected: (data: Uint8Array) => void }) => {
  const [games, setGames] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setGames(data);
      })
      .catch(err => {
        console.error('Error fetching games:', err);
        setError('Failed to load games: ' + err.message);
      });
  }, []);

  const loadGame = async (fileId: string) => {
    try {
      // NOTE: This will require OAuth to download the file if not truly public.
      // Given the previous 403 error, this is expected behavior if the file isn't publicly accessible via API key.
      const response = await fetch(`/api/games/download/${fileId}`);
      if (!response.ok) throw new Error('Failed to download file');
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      onGameSelected(data);
    } catch (err: any) {
      setError('Failed to load game: ' + err.message);
    }
  };

  return (
    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 w-full max-w-sm">
      {error && <div className="text-red-400 mb-1 text-sm">{error}</div>}
      <input 
        type="text" 
        placeholder="Search games..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-1.5 mb-2 bg-black/50 text-white rounded text-sm"
      />
      <div className="max-h-40 overflow-y-auto">
        {games
          .filter(g => g.name.toLowerCase().endsWith('.nes'))
          .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(game => {
            const displayName = game.name
              .split('(')[0]
              .replace(/\.nes$/i, '')
              .trim();
            return (
              <button 
                key={game.id} 
                onClick={() => loadGame(game.id)}
                className="block w-full text-left p-1.5 hover:bg-white/10 text-white text-sm"
              >
                {displayName}
              </button>
            );
          })}
      </div>
    </div>
  );
};
