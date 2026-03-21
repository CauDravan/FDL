// utils.js - Utility functions

import { CONFIG } from './config.js';

/**
 * Get icon file path based on level
 */
export function getIconFile(level) {
  if (level == null) return 'src/assets/diff_icons/lv_unknown.png';
  
  const trimmed = String(level).trim();
  
  // Check if it's a special icon
  if (CONFIG.iconMap[trimmed]) {
    return `src/assets/diff_icons/${CONFIG.iconMap[trimmed]}.png`;
  }
  
  // Parse as number and get floor value
  const numLevel = parseFloat(trimmed);
  if (!isNaN(numLevel)) {
    return `src/assets/diff_icons/lv${Math.floor(numLevel)}.png`;
  }
  
  // Default fallback
  return `src/assets/diff_icons/lv${trimmed}.png`;
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

/**
 * Convert skill grade to icon file
 */
export function getSkillIcon(skill) {
  if (!skill) return 'src/assets/skillset_icons/unk.png';

  const s = String(skill).trim().toUpperCase();

  // A grades
  if (s.startsWith('A')) {
    if (s === 'A') return 'src/assets/skillset_icons/a.png';
    if (s === 'A+') return 'src/assets/skillset_icons/a1.png';
    if (s === 'A++') return 'src/assets/skillset_icons/a2.png';
    if (s === 'A+++') return 'src/assets/skillset_icons/a3.png';
  }

  // S grades
  if (s.startsWith('S')) {
    if (s === 'S') return 'src/assets/skillset_icons/s.png';
    if (s === 'S+') return 'src/assets/skillset_icons/s1.png';
    if (s === 'S++') return 'src/assets/skillset_icons/s2.png';
    if (s === 'S+++') return 'src/assets/skillset_icons/s3.png';
  }

  // R grades
  if (s.startsWith('R')) {
    if (s === 'R') return 'src/assets/skillset_icons/r.png';

    const match = s.match(/R\+(\d+)/);
    if (match) {
      return `src/assets/skillset_icons/r${match[1]}.png`;
    }
  }

  // Ex grades
  if (s.startsWith('EX')) {
    if (s === 'EX') return 'src/assets/skillset_icons/ex.png';
    if (s === 'EX+') return 'src/assets/skillset_icons/ex1.png';
    if (s === 'EX++') return 'src/assets/skillset_icons/ex2.png';
    if (s === 'EX+++') return 'src/assets/skillset_icons/ex3.png';
  }

  // Simple ones
  const map = {
    'B': 'b.png',
    'C': 'c.png',
    'D': 'd.png',
    'E': 'e.png',
    'F': 'f.png',
    'IR': 'ir.png',
    'L': 'l.png',
    'P': 'p.png',
    'T': 't.png'
  };

  if (map[s]) {
    return `src/assets/skillset_icons/${map[s]}`;
  }

  return 'src/assets/skillset_icons/unk.png';
}