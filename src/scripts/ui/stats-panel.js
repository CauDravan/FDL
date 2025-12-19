// ui/stats-panel.js - Update stats panel (left sidebar)

import { animateNumber } from '../utils.js';

/**
 * Update the stats panel with computed statistics
 */
export function updateStatsPanel(stats) {
  const elements = {
    totalRows: document.getElementById('totalRows'),
    totalExp: document.getElementById('totalExp'),
    topGenre: document.getElementById('topGenre'),
    totalUniqueGames: document.getElementById('totalUniqueGames')
  };

  // Update with animation
  if (elements.totalRows) {
    animateNumber(elements.totalRows, stats.totalRows);
  }

  if (elements.totalExp) {
    animateNumber(elements.totalExp, stats.totalExp);
  }

  if (elements.topGenre) {
    elements.topGenre.textContent = stats.topGenre;
  }

  if (elements.totalUniqueGames) {
    animateNumber(elements.totalUniqueGames, stats.totalUniqueGames);
  }
}