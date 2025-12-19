// ui/genre-table.js - Render genre statistics table

/**
 * Render the genre statistics table
 */
export function renderGenreTable(sortedGenres, genreStats) {
  const genreTable = document.getElementById('genreTable');
  
  if (!genreTable) return;
  
  genreTable.innerHTML = '';
  
  sortedGenres.forEach(genre => {
    const stats = genreStats[genre];
    
    const row = document.createElement('div');
    row.className ='grid grid-cols-[2.5fr_1fr_1fr_1.2fr] gap-3 px-3 py-3.5 bg-gradient-to-r from-pink-primary/5 to-pink-primary/2 border border-zinc-800 rounded-lg text-xs transition-all hover:border-pink-primary hover:bg-pink-primary/12 hover:translate-x-0.5 group relative overflow-hidden';

    // Left border effect
    const leftBorder = document.createElement('div');
    leftBorder.className = 'absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-pink-primary to-pink-dark opacity-0 group-hover:opacity-100 transition-opacity';
    row.appendChild(leftBorder);

    // Type column with truncation and tooltip
    const typeDiv = document.createElement('div');
    typeDiv.className = 'text-pink-secondary font-semibold truncate text-[11px]';
    typeDiv.textContent = genre;
    typeDiv.title = genre; // Show full text on hover

    const playedDiv = document.createElement('div');
    playedDiv.className = 'text-right text-zinc-300 tabular-nums font-medium';
    playedDiv.textContent = stats.played;

    const gamesDiv = document.createElement('div');
    gamesDiv.className = 'text-right text-zinc-300 tabular-nums font-medium';
    gamesDiv.textContent = stats.games.size;

    const expDiv = document.createElement('div');
    expDiv.className = 'text-right text-zinc-300 tabular-nums font-medium';
    expDiv.textContent = Math.round(stats.exp).toLocaleString();

    row.appendChild(typeDiv);
    row.appendChild(playedDiv);
    row.appendChild(gamesDiv);
    row.appendChild(expDiv);

    genreTable.appendChild(row);
  });
}