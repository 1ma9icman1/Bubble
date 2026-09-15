import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { NES } from 'jsnes';

export const DriveGameSelector = forwardRef(({ onGameSelected }: { onGameSelected: (data: Uint8Array) => void }, ref) => {
  const [games, setGames] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    handleInput: (button: number, type: 'down' | 'up') => {
        if (type !== 'down') return;
        
        // Filtered list to match what is displayed
        const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (button === NES.Buttons.UP) setSelectedIndex(prev => Math.max(0, prev - 1)); // Up
        if (button === NES.Buttons.DOWN) setSelectedIndex(prev => Math.min(filteredGames.length - 1, prev + 1)); // Down
        if (button === NES.Buttons.BUTTON_A && filteredGames[selectedIndex]) loadGame(filteredGames[selectedIndex].id); // A (Select)
    }
  }));

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        
        const priorityOrder = ['bubble bobble', 'bubble bobble 2', 'mario', 'excitebike', 'zelda'];
        
        const sortedGames = data.sort((a: any, b: any) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();

          const indexA = priorityOrder.findIndex(p => nameA.includes(p));
          const indexB = priorityOrder.findIndex(p => nameB.includes(p));

          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          return nameA.localeCompare(nameB);
        });

        setGames(sortedGames);
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
          .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((game, index) => {
            return (
              <button 
                key={game.id} 
                onClick={() => loadGame(game.id)}
                className={`block w-full text-left p-1.5 hover:bg-white/10 text-white text-sm ${index === selectedIndex ? 'bg-amber-600' : ''}`}
              >
                {game.name}
              </button>
            );
          })}
      </div>
    </div>
  );
});
