// application.js - Improved version with better UX
document.addEventListener('DOMContentLoaded', () => {
  const CONFIG = {
    sheetId: '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o',
    sheetName: 'Level(Cd)',
    iconMap: { 
      '-1': 'lv1f', '-2': 'lv2f', '-3': 'lv3f', 
      '-46': 'lvinf', 'P': 'lvP', 'U': 'lvU', 'R': 'lvR' 
    }
  };

  let allData = [];
  const elements = {
    container: document.getElementById('dataContainer'),
    searchInput: document.getElementById('searchInput'),
    hintToggle: document.getElementById('hintToggle'),
    searchHint: document.getElementById('searchHint'),
    genreTable: document.getElementById('genreTable'),
    totalRows: document.getElementById('totalRows'),
    totalExp: document.getElementById('totalExp'),
    topGenre: document.getElementById('topGenre'),
    totalUniqueGames: document.getElementById('totalUniqueGames')
  };

  // Utility Functions
  const getIconFile = (level) => {
    if (level == null) return 'src/assets/icons/lv_unknown.png';
    const trimmed = String(level).trim();
    if (CONFIG.iconMap[trimmed]) return `src/assets/icons/${CONFIG.iconMap[trimmed]}.png`;
    const numLevel = parseFloat(trimmed);
    if (!isNaN(numLevel)) return `src/assets/icons/lv${Math.floor(numLevel)}.png`;
    return `src/assets/icons/lv${trimmed}.png`;
  };

  const safeParseExp = (v) => {
    if (v == null) return 0;
    const cleaned = String(v).replace(/[^\d\.\-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Create Row (improved contrast and spacing)
  const createRow = (data) => {
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

    // Icon wrapper (left side) - Larger badge
    const iconWrap = document.createElement('div');
    iconWrap.className = 'relative flex-shrink-0';

    const mainLevel = data.Level || data.BS;
    const img = document.createElement('img');
    img.src = getIconFile(mainLevel);
    img.alt = mainLevel || '';
    img.className = 'w-12 h-12 rounded-lg shadow-lg';
    iconWrap.appendChild(img);

    // Level badge for P, U, R - Larger and more visible
    const trimmedLevel = String(mainLevel).trim();
    if (['P', 'U', 'R'].includes(trimmedLevel)) {
      const bs = data.BS || data.Level;
      if (bs != null) {
        const numBS = parseFloat(String(bs).replace(/[^\d\.\-]/g, ''));
        if (!isNaN(numBS)) {
          const levelNum = Math.floor(numBS);
          const badge = document.createElement('div');
          badge.className = 'absolute -top-1.5 -left-1.5 w-6 h-6 bg-black rounded-full border-2 border-pink-primary';
          const badgeImg = document.createElement('img');
          badgeImg.src = `src/assets/icons/lv${levelNum}.png`;
          badgeImg.alt = levelNum;
          badgeImg.className = 'w-full h-full rounded-full';
          badge.appendChild(badgeImg);
          iconWrap.appendChild(badge);
        }
      }
    }

    content.appendChild(iconWrap);

    // Text content (right side) - Better contrast
    const textWrap = document.createElement('div');
    textWrap.className = 'flex-1 min-w-0';

    // Line 1: ID + Game name
    const line1 = document.createElement('div');
    line1.className = 'flex items-baseline gap-2 mb-1.5 flex-wrap';

    const idText = document.createElement('span');
    idText.className = 'text-sm font-semibold text-pink-secondary whitespace-nowrap';
    idText.textContent = `#${data.ID || (data['IDL'] || '-')} -`;

    const gameText = document.createElement('span');
    gameText.className = 'text-sm text-zinc-100 font-medium leading-relaxed';
    gameText.textContent = data['Game'] || (data['IDL'] || '(unknown)');

    line1.appendChild(idText);
    line1.appendChild(gameText);

    // Line 2: Own Rate - Better contrast
    const line2 = document.createElement('div');
    line2.className = 'text-xs text-zinc-400 font-light leading-relaxed';
    line2.textContent = data['Own Rate'] || data['Level'] || '-';

    textWrap.appendChild(line1);
    textWrap.appendChild(line2);
    content.appendChild(textWrap);

    row.appendChild(content);
    return row;
  };

  // Load Data
  const loadData = async () => {
    try {
      const url = `https://opensheet.elk.sh/${CONFIG.sheetId}/${CONFIG.sheetName}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error('Unexpected data format');
      
      allData = json;
      computeStats(allData);
      displayData(allData);
    } catch (err) {
      console.error(err);
      elements.container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-red-400 text-center">Error loading data: ${String(err)}</p>
          <button onclick="location.reload()" class="px-6 py-2 bg-pink-primary hover:bg-pink-secondary rounded-lg transition-colors">
            Retry
          </button>
        </div>
      `;
      elements.genreTable.innerHTML = `<div class="text-center py-10 text-red-400">Error loading stats</div>`;
    }
  };

  // Display Data
  const displayData = (data) => {
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
    data.forEach(r => elements.container.appendChild(createRow(r)));
  };

  // Compute Statistics
  const computeStats = (rows) => {
    const uniqueIdl = new Set();
    const uniqueGames = new Set();
    let totalExp = 0;
    const genreStats = {};

    rows.forEach(row => {
      if (row['IDL']) uniqueIdl.add(String(row['IDL']));
      if (row['ID']) uniqueGames.add(String(row['ID']));
      totalExp += safeParseExp(row['Exp']);

      const raw = String(row['Genres'] || '').trim();
      const genres = raw === '' ? ['#unknown'] : raw.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);

      genres.forEach(g => {
        if (!genreStats[g]) {
          genreStats[g] = { played: 0, games: new Set(), exp: 0 };
        }
        genreStats[g].played += 1;
        if (row['ID']) genreStats[g].games.add(String(row['ID']));
        genreStats[g].exp += safeParseExp(row['Exp']);
      });
    });

    // Sort by exp
    const genres = Object.keys(genreStats).sort((a, b) => genreStats[b].exp - genreStats[a].exp);
    const topGenre = genres.length ? genres[0] : '—';

    // Update stats with animation
    animateNumber(elements.totalRows, rows.length);
    animateNumber(elements.totalExp, Math.round(totalExp));
    elements.topGenre.textContent = topGenre;
    animateNumber(elements.totalUniqueGames, uniqueGames.size);

    // Render genre table
    renderGenreTable(genres, genreStats);
  };

  // Animate number counting
  const animateNumber = (element, target) => {
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
  };

  // Render Genre Table with better spacing
  const renderGenreTable = (genres, stats) => {
    elements.genreTable.innerHTML = '';
    
    genres.forEach(g => {
      const s = stats[g];
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[2.5fr_1fr_1fr_1.2fr] gap-3 px-3 py-3.5 bg-gradient-to-r from-pink-primary/5 to-pink-primary/2 border border-zinc-800 rounded-lg text-xs transition-all hover:border-pink-primary hover:bg-pink-primary/12 hover:translate-x-0.5 group relative overflow-hidden';

      // Left border effect
      const leftBorder = document.createElement('div');
      leftBorder.className = 'absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-pink-primary to-pink-dark opacity-0 group-hover:opacity-100 transition-opacity';
      row.appendChild(leftBorder);

      // Type column with truncation and tooltip
      const typeDiv = document.createElement('div');
      typeDiv.className = 'text-pink-secondary font-semibold truncate text-[11px]';
      typeDiv.textContent = g;
      typeDiv.title = g; // Show full text on hover

      const playedDiv = document.createElement('div');
      playedDiv.className = 'text-right text-zinc-300 tabular-nums font-medium';
      playedDiv.textContent = s.played;

      const gamesDiv = document.createElement('div');
      gamesDiv.className = 'text-right text-zinc-300 tabular-nums font-medium';
      gamesDiv.textContent = s.games.size;

      const expDiv = document.createElement('div');
      expDiv.className = 'text-right text-zinc-300 tabular-nums font-medium';
      expDiv.textContent = Math.round(s.exp).toLocaleString();

      row.appendChild(typeDiv);
      row.appendChild(playedDiv);
      row.appendChild(gamesDiv);
      row.appendChild(expDiv);

      elements.genreTable.appendChild(row);
    });
  };

  // Search Functionality
  const filterData = (query) => {
    if (!query.trim()) {
      displayData(allData);
      return;
    }

    if (!query.includes('=')) {
      const filtered = allData.filter(r => 
        (r['Game'] || '').toLowerCase().includes(query.toLowerCase())
      );
      displayData(filtered);
      return;
    }

    const parts = query.replace(/[()]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    let filtered = allData.slice();

    parts.forEach(p => {
      const [k, v] = p.split('=').map(s => s.trim().toLowerCase());
      if (!k) return;

      if (k === 'game') {
        filtered = filtered.filter(r => (r['Game'] || '').toLowerCase().includes(v));
      } else if (k === 'genre' || k === 'type') {
        filtered = filtered.filter(r => {
          const raw = String(r['Genres'] || '').toLowerCase();
          return raw.split(/[,;|]+/).map(s => s.trim()).some(tag => tag.includes(v));
        });
      } else if (k === 'level') {
        filtered = filtered.filter(r => {
          const bs = parseFloat(String(r['BS'] || r['Level'] || '').replace(/[^\d\.\-]/g, ''));
          return !isNaN(bs) && Math.floor(bs) === parseInt(v, 10);
        });
      } else if (k === 'id') {
        filtered = filtered.filter(r => String(r['ID'] || '').toLowerCase() === v);
      } else if (k === 'idl') {
        filtered = filtered.filter(r => String(r['IDL'] || '').toLowerCase() === v);
      }
    });

    displayData(filtered);
  };

  // Event Listeners
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => filterData(e.target.value));
  }

  if (elements.hintToggle) {
    elements.hintToggle.addEventListener('click', () => {
      elements.searchHint.classList.toggle('hidden');
    });
  }

  // Initialize
  loadData();
});