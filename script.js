// script.js
const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const sheetName = 'Level(Cd)';
const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

/* icon mapping: keep same names as your icons folder */
const iconMap = {
  '-1': 'lv1f',
  '-2': 'lv2f',
  '-3': 'lv3f',
  '-46': 'lvinf',
  'P': 'lvP',
  'U': 'lvU',
  'R': 'lvR'
};

function getIconFile(level) {
  if (level == null) return `icons/lv_unknown.png`;
  const trimmed = String(level).trim();
  if (iconMap[trimmed]) return `icons/${iconMap[trimmed]}.png`;
  const numLevel = parseFloat(trimmed);
  if (!isNaN(numLevel)) return `icons/lv${Math.floor(numLevel)}.png`;
  return `icons/lv${trimmed}.png`;
}

function safeParseExp(v){
  if (v == null) return 0;
  // remove commas/other chars, keep digits, dot, minus
  const cleaned = String(v).replace(/[^\d\.\-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function createRow(data){
  const container = document.createElement('div');
  container.className = 'data-row';
  container.onclick = () => {
    // go to details (use IDL)
    window.location.href = `details.html?id=${encodeURIComponent(data['IDL'] || '')}`;
  };

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'icon-wrapper';
  const icon = document.createElement('img');
  icon.src = getIconFile(data.Level || data.BS);
  icon.alt = data.Level || '';
  icon.className = 'level-icon';
  iconWrapper.appendChild(icon);

  if (['P','R','U'].includes(String(data.Level))) {
    const subIcon = document.createElement('img');
    subIcon.src = getIconFile(data.BS);
    subIcon.alt = data.BS || '';
    subIcon.className = 'sub-icon';
    iconWrapper.appendChild(subIcon);
  }

  const ownRateWrapper = document.createElement('div');
  ownRateWrapper.className = 'own-rate';
  const fdg = document.createElement('div');
  fdg.className = 'id-code';
  fdg.textContent = `#${data.ID || '-'}`;
  const ownRateText = document.createElement('div');
  ownRateText.textContent = data['Own Rate'] || '-';
  ownRateWrapper.appendChild(fdg);
  ownRateWrapper.appendChild(ownRateText);

  const gameName = document.createElement('div');
  gameName.className = 'game-name';
  gameName.textContent = data['Game'] || (data['IDL'] || '(unknown)');

  container.appendChild(iconWrapper);
  container.appendChild(ownRateWrapper);
  container.appendChild(gameName);

  return container;
}

/* --- Data & display --- */
window.allData = [];

async function loadData(){
  try{
    const res = await fetch(url);
    const json = await res.json();
    window.allData = Array.isArray(json) ? json : [];
    computeAndRender(window.allData);
    displayData(window.allData);
  }catch(err){
    console.error('Failed to load data:', err);
    document.getElementById('dataContainer').innerHTML = `<div style="padding:18px;color:#f88">Lỗi tải dữ liệu. Kiểm tra internet hoặc opensheet API.</div>`;
  }
}

function displayData(data){
  const container = document.getElementById('dataContainer');
  container.innerHTML = '';
  if (!data || data.length === 0){
    container.innerHTML = `<div style="padding:18px;color:var(--muted)">Không có dữ liệu.</div>`;
    return;
  }
  data.forEach(row => container.appendChild(createRow(row)));
}

/* compute aggregated stats and render sidebars */
function computeAndRender(rows){
  const totalRows = rows.length;
  const uniqueIdlSet = new Set();
  const uniqueGameIdSet = new Set();
  let totalExp = 0;

  // genre aggregation
  const genreStats = {}; // key -> { played, games: Set, exp, topRowByBS }

  rows.forEach(row => {
    const idl = row['IDL'];
    const gameId = row['ID'];
    uniqueIdlSet.add(idl);
    if (gameId != null) uniqueGameIdSet.add(String(gameId));
    totalExp += safeParseExp(row['Exp']);

    // extract genres (split by comma/semicolon/pipe)
    const rawGenres = String(row['Genres'] || '').trim();
    const split = rawGenres === '' ? [] : rawGenres.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);

    // if no genres, use 'unknown'
    const genresToUse = split.length ? split : ['#unknown'];

    genresToUse.forEach(g => {
      if (!genreStats[g]) genreStats[g] = { played:0, games: new Set(), exp:0, topRowByBS: null, topBS: -Infinity };
      genreStats[g].played += 1;
      if (gameId != null) genreStats[g].games.add(String(gameId));
      genreStats[g].exp += safeParseExp(row['Exp']);

      // compute BS numeric for picking top row (largest BS)
      const bsNum = parseFloat(String(row['BS'] || '').replace(/[^\d\.\-]/g, ''));
      if (!isFinite(bsNum)) {
        // fallback: if Level numeric, use that
        const lvn = parseFloat(String(row['Level'] || '').replace(/[^\d\.\-]/g, ''));
        if (isFinite(lvn) && lvn > genreStats[g].topBS) {
          genreStats[g].topBS = lvn;
          genreStats[g].topRowByBS = row;
        }
      } else if (bsNum > genreStats[g].topBS) {
        genreStats[g].topBS = bsNum;
        genreStats[g].topRowByBS = row;
      }
    });
  });

  // determine topGenre by played
  const genreList = Object.keys(genreStats);
  let topGenre = genreList.length ? genreList[0] : '—';
  genreList.forEach(g => {
    if (genreStats[g].played > (genreStats[topGenre]?.played || 0)) topGenre = g;
  });

  // render left sidebar stats
  document.getElementById('totalRows').textContent = totalRows;
  document.getElementById('totalUniqueIdl').textContent = uniqueIdlSet.size;
  document.getElementById('totalExp').textContent = Math.round(totalExp).toLocaleString();
  document.getElementById('topGenre').textContent = topGenre;
  document.getElementById('totalUniqueGames').textContent = uniqueGameIdSet.size;

  // render right sidebar table
  const table = document.getElementById('genreTable');
  table.innerHTML = ''; // clear
  if (genreList.length === 0){
    table.innerHTML = `<div class="placeholder">Không có thể loại nào</div>`;
    return;
  }

  // header row
  const header = document.createElement('div');
  header.className = 'row head';
  header.innerHTML = `<div>Type</div><div>Title</div><div>Played</div><div>Games</div><div>Exp</div>`;
  table.appendChild(header);

  // sort by played desc
  genreList.sort((a,b) => genreStats[b].played - genreStats[a].played).forEach(g => {
    const s = genreStats[g];
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    const titleHTML = (() => {
      // choose icon from topRowByBS if exists
      const topRow = s.topRowByBS;
      let mainIcon = 'icons/lv_unknown.png';
      let subIcon = '';
      let titleText = g;
      if (topRow) {
        mainIcon = getIconFile(topRow.Level || topRow.BS);
        if (['P','R','U'].includes(String(topRow.Level))) {
          subIcon = getIconFile(topRow.BS);
        }
        // title show level letter plus small BS icon (approx)
        titleText = `${String(topRow.Level || '').trim() || '—'}`;
      }
      // build HTML
      return `<div style="display:flex;align-items:center;gap:8px;">
                <img src="${mainIcon}" style="width:36px;height:36px;object-fit:contain;border-radius:8px" />
                <div style="display:flex;flex-direction:column;">
                  <div style="font-weight:700;color:var(--accent)">${titleText}</div>
                  <div style="font-size:12px;color:var(--muted);margin-top:2px">${g}</div>
                </div>
              </div>`;
    })();

    rowEl.innerHTML = `
      <div style="font-weight:700;color:var(--muted);">${g}</div>
      <div>${titleHTML}</div>
      <div style="text-align:right">${s.played}</div>
      <div style="text-align:right">${s.games.size}</div>
      <div style="text-align:right">${Math.round(s.exp).toLocaleString()}</div>
    `;
    table.appendChild(rowEl);
  });
}

/* --- Search & filtering --- */
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (!window.allData) return;
  if (query === '') {
    displayData(window.allData);
    return;
  }

  // If there is no '=' search by Game name substring
  if (!query.includes('=')) {
    const filtered = window.allData.filter(row => (row['Game'] || '').toLowerCase().includes(query.toLowerCase()));
    displayData(filtered);
    return;
  }

  // support multi filters: remove parentheses then split by commas
  const cleanParts = query.replace(/[()]/g,'').split(',').map(s => s.trim()).filter(Boolean);
  let filtered = window.allData.slice();

  cleanParts.forEach(part => {
    const [k,v] = part.split('=').map(s => s.trim().toLowerCase());
    if (!k) return;
    if (k === 'game') {
      filtered = filtered.filter(row => (row['Game']||'').toLowerCase().includes(v));
    } else if (k === 'genre' || k === 'type') {
      filtered = filtered.filter(row => {
        const raw = String(row['Genres'] || '').toLowerCase();
        // check if any tag equals or includes the filter value
        return raw.split(/[,;|]+/).map(s => s.trim()).some(tag => tag.includes(v));
      });
    } else if (k === 'level') {
      filtered = filtered.filter(row => {
        const bsVal = parseFloat(String(row['BS'] || row['Level'] || '').replace(/[^\d\.\-]/g,''));
        return !isNaN(bsVal) && Math.floor(bsVal) === parseInt(v,10);
      });
    } else if (k === 'id') {
      filtered = filtered.filter(row => String(row['ID'] || '').toLowerCase() === v);
    } else if (k === 'idl') {
      filtered = filtered.filter(row => String(row['IDL'] || '').toLowerCase() === v);
    }
  });

  displayData(filtered);
});

/* hint toggle */
document.getElementById('hintToggle').addEventListener('click', () => {
  document.getElementById('searchHint').classList.toggle('hidden');
});

/* initial load */
loadData();
