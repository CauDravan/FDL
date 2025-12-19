// utils.js - Utility functions

import { CONFIG } from './config.js';

/**
 * Get icon file path based on level
 */
export function getIconFile(level) {
  if (level == null) return 'src/assets/icons/lv_unknown.png';
  
  const trimmed = String(level).trim();
  
  // Check if it's a special icon
  if (CONFIG.iconMap[trimmed]) {
    return `src/assets/icons/${CONFIG.iconMap[trimmed]}.png`;
  }
  
  // Parse as number and get floor value
  const numLevel = parseFloat(trimmed);
  if (!isNaN(numLevel)) {
    return `src/assets/icons/lv${Math.floor(numLevel)}.png`;
  }
  
  // Default fallback
  return `src/assets/icons/lv${trimmed}.png`;
}

/**
 * Safely parse exp value
 */
export function safeParseExp(value) {
  if (value == null) return 0;
  
  const cleaned = String(value).replace(/[^\d\.\-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Animate number counting
 */
export function animateNumber(element, target) {
  const duration = 1000;
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}