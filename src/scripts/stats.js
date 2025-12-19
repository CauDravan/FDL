// stats.js - Statistics computation

import { safeParseExp } from './utils.js';

/**
 * Compute statistics from data rows
 */
export function computeStats(rows) {
  const uniqueIdl = new Set();
  const uniqueGames = new Set();
  let totalExp = 0;
  const genreStats = {};

  rows.forEach(row => {
    // Track unique IDL and Games
    if (row['IDL']) uniqueIdl.add(String(row['IDL']));
    if (row['ID']) uniqueGames.add(String(row['ID']));
    
    // Sum total exp
    totalExp += safeParseExp(row['Exp']);

    // Process genres
    const raw = String(row['Genres'] || '').trim();
    const genres = raw === '' ? ['#unknown'] : raw.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);

    genres.forEach(genre => {
      if (!genreStats[genre]) {
        genreStats[genre] = {
          played: 0,
          games: new Set(),
          exp: 0
        };
      }
      
      genreStats[genre].played += 1;
      
      if (row['ID']) {
        genreStats[genre].games.add(String(row['ID']));
      }
      
      genreStats[genre].exp += safeParseExp(row['Exp']);
    });
  });

  // Sort genres by exp (descending)
  const sortedGenres = Object.keys(genreStats).sort(
    (a, b) => genreStats[b].exp - genreStats[a].exp
  );

  const topGenre = sortedGenres.length ? sortedGenres[0] : '—';

  return {
    totalRows: rows.length,
    totalExp: Math.round(totalExp),
    topGenre,
    totalUniqueGames: uniqueGames.size,
    genreStats,
    sortedGenres
  };
}