// main.js - Main application entry point

import { loadData } from './api.js';
import { computeStats } from './stats.js';
import { createRow } from './ui/row.js';
import { updateStatsPanel } from './ui/stats-panel.js';
import { renderGenreTable } from './ui/genre-table.js';
import { filterData, loadKeywords } from './search.js';

// Global state
let allData = [];

// DOM elements
const elements = {
  container: document.getElementById('dataContainer'),
  searchInput: document.getElementById('searchInput'),
  hintToggle: document.getElementById('hintToggle'),
  searchHint: document.getElementById('searchHint'),
  genreTable: document.getElementById('genreTable')
};

let visibleCount = 20;

/**
 * Display data rows
 */
function displayData(data) {
  elements.container.innerHTML = '';
  
  if (!data || data.length === 0) {
    elements.container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <svg class="w-16 h-16 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-zinc-500 text-center">No levels found</p>
      </div>
    `;
    return;
  }
  
  data.slice(0, visibleCount).forEach(row => {
    elements.container.appendChild(createRow(row));
  });
}

/**
 * Handle search input
 */
function handleSearch(query) {
  const filtered = filterData(allData, query);
  displayData(filtered);
}

/**
 * Initialize the application
 */
async function initialize() {
  try {
    // Load data
    allData = await loadData();
    await loadKeywords();
    
    // Compute and display statistics
    const stats = computeStats(allData);
    updateStatsPanel(stats);
    renderGenreTable(stats.sortedGenres, stats.genreStats);
    
    // Display all data initially
    displayData(allData);
    
  } catch (error) {
    console.error('Initialization error:', error);
    
    // Show error message
    elements.container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-red-400 text-center">Error loading data: ${String(error)}</p>
        <button onclick="location.reload()" class="px-6 py-2 bg-pink-primary hover:bg-pink-secondary rounded-lg transition-colors">
          Retry
        </button>
      </div>
    `;
    
    if (elements.genreTable) {
      elements.genreTable.innerHTML = `
        <div class="text-center py-10 text-red-400">Error loading stats</div>
      `;
    }
  }
}

/**
 * Set up event listeners
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
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initialize();
});