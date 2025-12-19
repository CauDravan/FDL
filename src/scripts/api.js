// api.js - API calls and data fetching

import { CONFIG } from './config.js';

/**
 * Load data from Google Sheets via OpenSheet API
 */
export async function loadData() {
  try {
    const url = `https://opensheet.elk.sh/${CONFIG.sheetId}/${CONFIG.sheetName}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const json = await response.json();
    
    if (!Array.isArray(json)) {
      throw new Error('Unexpected data format');
    }
    
    return json;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}