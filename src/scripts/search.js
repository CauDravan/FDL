// search.js - Search and filter functionality

/**
 * Filter data based on search query
 */

import gameKeywords from "../data/keyword.json";

export function filterData(allData, query) {
  if (!query.trim()) {
    return allData;
  }

  // Simple game name search
  if (!query.includes('=')) {
    const q = query.toLowerCase();

    return allData.filter(row => {
      const game = (row['Game'] || '').toLowerCase();
      if (game.includes(q)) return true;

      const id = String(row['ID'] || '').toLowerCase();
      const aliases = gameKeywords[id] || [];

      return aliases.some(k => k.includes(q));
    });
  }

  // Advanced filter with key=value pairs
  const parts = query
    .replace(/[()]/g, '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  let filtered = allData.slice();

  parts.forEach(part => {
    const [key, value] = part.split('=').map(s => s.trim().toLowerCase());
    if (!key) return;

    if (key === 'game') {
      filtered = filtered.filter(row => {
        const game = (row['Game'] || '').toLowerCase();
        if (game.includes(value)) return true;

        const id = String(row['ID'] || '').toLowerCase();
        const aliases = gameKeywords[id] || [];

        return aliases.some(k => k.includes(value));
      });
    }
    else if (key === 'genre' || key === 'type') {
      filtered = filtered.filter(row => {
        const raw = String(row['Genres'] || '').toLowerCase();
        return raw.split(/[,;|]+/)
          .map(s => s.trim())
          .some(tag => tag.includes(value));
      });
    } 
    else if (key === 'level') {
      filtered = filtered.filter(row => {
        const bs = parseFloat(
          String(row['BS'] || row['Level'] || '')
            .replace(/[^\d\.\-]/g, '')
        );
        return !isNaN(bs) && Math.floor(bs) === parseInt(value, 10);
      });
    } 
    else if (key === 'id') {
      filtered = filtered.filter(row => 
        String(row['ID'] || '').toLowerCase() === value
      );
    } 
    else if (key === 'idl') {
      filtered = filtered.filter(row => 
        String(row['IDL'] || '').toLowerCase() === value
      );
    }
  });

  return filtered;
}