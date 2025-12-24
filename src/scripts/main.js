// main.js - Main application entry point

import { loadData } from './api.js';
import { computeStats } from './stats.js';
import { createRow } from './ui/row.js';
import { updateStatsPanel } from './ui/stats-panel.js';
import { renderGenreTable } from './ui/genre-table.js';
import { filterData, loadKeywords } from './search.js';

// Global state
let allData = [];
let currentData = [];

// Pagination
const PAGE_SIZE = 20;
let visibleCount = PAGE_SIZE;

// DOM elements
const elements = {
  container: document.getElementById('dataContainer'),
  searchInput: document.getElementById('searchInput'),
  hintToggle: document.getElementById('hintToggle'),
  searchHint: document.getElementById('searchHint'),
  genreTable: document.getElementById('genreTable')
};

/**
 * Display data rows (supports infinite scroll)
 */
function displayData(data, reset = false) {
  if (reset) {
    elements.container.innerHTML = '';
    visibleCount = PAGE_SIZE;
  }

  currentData = data;

  if (!data || data.length === 0) {
    elements.container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <p class="text-zinc-500">No levels found</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  data
    .slice(elements.container.children.length, visibleCount)
    .forEach(row => {
      fragment.appendChild(createRow(row));
    });

  elements.container.appendChild(fragment);
}

/**
 * Handle search input
 */
function handleSearch(query) {
  const filtered = filterData(allData, query);
  displayData(filtered, true);
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Search input
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
  }

  // Hint toggle
  if (elements.hintToggle && elements.searchHint) {
    elements.hintToggle.addEventListener('click', () => {
      elements.searchHint.classList.toggle('hidden');
    });
  }

  // Infinite scroll (middle column)
  const mainScroll = document.querySelector('main');
  if (mainScroll) {
    mainScroll.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = mainScroll;

      if (scrollTop + clientHeight >= scrollHeight - 150) {
        if (visibleCount < currentData.length) {
          visibleCount += PAGE_SIZE;
          displayData(currentData);
        }
      }
    });
  }
}

/**
 * Initialize the application
 */
async function initialize() {
  try {
    allData = await loadData();
    await loadKeywords();

    const stats = computeStats(allData);
    updateStatsPanel(stats);
    renderGenreTable(stats.sortedGenres, stats.genreStats);

    displayData(allData, true);

  } catch (error) {
    console.error('Initialization error:', error);
    elements.container.innerHTML = `<p class="text-red-400">Error loading data</p>`;
  }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initialize();
});
