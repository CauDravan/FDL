// ui/row.js - Create game row component

import { getIconFile, getSkillIcon } from '../utils.js';

/**
 * Create a game row element
 */
export function createRow(data) {
  const row = document.createElement('div');
  row.className = 'relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-pink-primary hover:shadow-lg hover:shadow-pink-primary/30 hover:-translate-y-0.5 group overflow-hidden';
  
  row.onclick = () => {
    const idl = data['IDL'] || '';
    window.location.href = `details.html?id=${encodeURIComponent(idl)}`;
  };

  // Background overlay effect
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-gradient-to-br from-pink-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300';
  row.appendChild(overlay);

  // Left border effect
  const leftBorder = document.createElement('div');
  leftBorder.className = 'absolute top-0 left-0 w-1 h-full bg-pink-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top';
  row.appendChild(leftBorder);

  // Content wrapper - Horizontal layout
  const content = document.createElement('div');
  content.className = 'relative flex items-start gap-3';

  // Icon wrapper (left side)
  const iconWrap = document.createElement('div');
  iconWrap.className = 'relative flex-shrink-0 self-center';

  const mainLevel = data.Level || data.BS;
  const img = document.createElement('img');
  img.src = getIconFile(mainLevel);
  img.alt = mainLevel || '';
  img.className = 'w-12 h-12 rounded-lg shadow-lg';
  iconWrap.appendChild(img);

  // Level badge for P, U, R
  const trimmedLevel = String(mainLevel).trim();
  if (['P', 'U', 'R'].includes(trimmedLevel)) {
    const bs = data.BS || data.Level;
    if (bs != null) {
      const numBS = parseFloat(String(bs).replace(/[^\d\.\-]/g, ''));
      if (!isNaN(numBS)) {
        const levelNum = Math.floor(numBS);
        const badge = document.createElement('div');
        badge.className = 'absolute -top-1.5 -left-1.5 w-6 h-6 bg-black rounded-full';
        const badgeImg = document.createElement('img');
        badgeImg.src = `src/assets/diff_icons/lv${levelNum}.png`;
        badgeImg.alt = levelNum;
        badgeImg.className = 'w-full h-full rounded-full';
        badge.appendChild(badgeImg);
        iconWrap.appendChild(badge);
      }
    }
  }

  content.appendChild(iconWrap);

  // Text content (right side)
  const textWrap = document.createElement('div');
  textWrap.className = 'flex-1 min-w-0';

  // Line 1: ID + Game name
  const line1 = document.createElement('div');
  line1.className = 'flex items-baseline gap-1 mb-1 overflow-hidden whitespace-nowrap group-hover:overflow-visible';

  const idText = document.createElement('span');
  idText.className = 'text-[10px] font-semibold text-pink-secondary whitespace-nowrap opacity-80';
  idText.textContent = `#${data.ID || (data['IDL'] || '-')}`;

  const gameText = document.createElement('span');
  gameText.className = 'text-[10px] text-zinc-100 font-medium leading-tight truncate max-w-[140px] group-hover:max-w-[200px] transition-max-width duration-300';
  gameText.textContent = data['Game'] || (data['IDL'] || '(unknown)');

  line1.appendChild(idText);
  line1.appendChild(gameText);

  // Line 2: Own Rate
  const line2 = document.createElement('div');
  line2.className = 'text-[10px] text-zinc-400 font-light leading-tight';
  line2.textContent = data['Own Rate'] || data['Level'] || '-';

  // Line 3: Skillset icons
  const line3 = document.createElement('div');
  line3.className = 'flex items-center gap-1 mt-1';

  const skills = [
    data['Data'],
    data['Vision'],
    data['Speed'],
    data['Acc'],
    data['Str']
  ];

  skills.forEach(skill => {
    const img = document.createElement('img');
    img.src = getSkillIcon(skill);
    img.alt = skill || '';
    img.className = 'w-8 h-8 opacity-90 group-hover:opacity-100 transition';
    img.loading = "lazy";
    line3.appendChild(img);
  });

  textWrap.appendChild(line1);
  textWrap.appendChild(line2);
  textWrap.appendChild(line3);
  content.appendChild(textWrap);

  row.appendChild(content);
  return row;
}