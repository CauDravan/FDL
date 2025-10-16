// script.js - updated rendering for compact middle rows and genre table
document.addEventListener('DOMContentLoaded', () => {
  const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
  const sheetName = 'Level(Cd)';
  const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

  const iconMap = { '-1': 'lv1f', '-2': 'lv2f', '-3': 'lv3f', '-46': 'lvinf', 'P': 'lvP', 'U': 'lvU', 'R': 'lvR' };

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
    const cleaned = String(v).replace(/[^\d\.\-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  function createRow(data){
    const row = document.createElement('div');
    row.className = 'row';
    row.onclick = () => {
      const idl = data['IDL'] || '';
      window.location.href = `details.html?id=${encodeURIComponent(idl)}`;
    };

    // icon top-left (small)
    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon';
    const img = document.createElement('img');
    img.src = getIconFile(data.Level || data.BS);
    img.alt = data.Level || '';
    // ensure transparent/background removed — rely on icon PNG itself
    iconWrap.appendChild(img);
    row.appendChild(iconWrap);

    // First line: left = "#ID -", right = "Game"
    const line1 = document.createElement('div');
    line1.className = 'line1';
    const idLeft = document.createElement('div');
    idLeft.className = 'id-left';
    idLeft.textContent = `#${data.ID || (data['IDL'] || '-')}`;
    // right game name
    const gameRight = document.createElement('div');
    gameRight.className = 'game-right';
    gameRight.textContent = data['Game'] || (data['IDL'] || '(unknown)');

    // if you want combined "#512 - Futoshiki" visually, show hyphen on left and game on right
    // show hyphen right after ID (we can include it as part of idLeft)
    idLeft.textContent = `${idLeft.textContent} -`;

    line1.appendChild(idLeft);
    line1.appendChild(gameRight);

    // second line: own rate (or Level short)
    const line2 = document.createElement('div');
    line2.className = 'line2';
    line2.textContent = data['Own Rate'] || data['Level'] || '-';

    row.appendChild(line1);
    row.appendChild(line2);
    return row;
  }

  // data area
  window.allData = [];

  async function loadData(){
    try{
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error('Unexpected data format');
      window.allData = json;
      computeAndRender(window.allData);
      displayData(window.allData);
    }catch(err){
      console.error(err);
      const container = document.getElementById('dataContainer');
      if (container) container.innerHTML = `<div style="padding:18px;color:#f88">Error loading data: ${String(err)}</div>`;
      const g = document.getElementById('genreTable'); if (g) g.innerHTML = `<div style="padding:12px;color:#f88">Error</div>`;
    }
  }

  function displayData(data){
    const container = document.getElementById('dataContainer');
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0){
      container.innerHTML = `<div style="padding:18px;color:var(--muted)">No data</div>`;
      return;
    }
    data.forEach(r => container.appendChild(createRow(r)));
  }

  function computeAndRender(rows){
    const totalRows = rows.length;
    const uniqueIdl = new Set();
    const uniqueGames = new Set();
    let totalExp = 0;
    const genreStats = {};

    rows.forEach(row => {
      if (row['IDL'] != null) uniqueIdl.add(String(row['IDL']));
      if (row['ID'] != null) uniqueGames.add(String(row['ID']));
      totalExp += safeParseExp(row['Exp']);

      const raw = String(row['Genres'] || '').trim();
      const parts = raw === '' ? [] : raw.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
      const list = parts.length ? parts : ['#unknown'];

      list.forEach(g => {
        if (!genreStats[g]) genreStats[g] = { played:0, games: new Set(), exp:0, topRow:null, topBS:-Infinity };
        genreStats[g].played += 1;
        if (row['ID'] != null) genreStats[g].games.add(String(row['ID']));
        genreStats[g].exp += safeParseExp(row['Exp']);

        // choose top row by BS numeric
        const bs = parseFloat(String(row['BS'] || '').replace(/[^\d\.\-]/g,''));
        if (!isFinite(bs)) {
          const lv = parseFloat(String(row['Level'] || '').replace(/[^\d\.\-]/g,''));
          if (isFinite(lv) && lv > genreStats[g].topBS) { genreStats[g].topBS = lv; genreStats[g].topRow = row; }
        } else if (bs > genreStats[g].topBS) {
          genreStats[g].topBS = bs; genreStats[g].topRow = row;
        }
      });
    });

    // top genre by played
    const genres = Object.keys(genreStats);
    let topGenre = genres.length ? genres[0] : '—';
    genres.forEach(g => {
      if (genreStats[g].played > (genreStats[topGenre]?.played || 0)) topGenre = g;
    });

    // render left summary
    const byId = (id) => document.getElementById(id);
    if (byId('totalRows')) byId('totalRows').textContent = totalRows;
    if (byId('totalUniqueIdl')) byId('totalUniqueIdl').textContent = uniqueIdl.size;
    if (byId('totalExp')) byId('totalExp').textContent = Math.round(totalExp).toLocaleString();
    if (byId('topGenre')) byId('topGenre').textContent = topGenre;
    if (byId('totalUniqueGames')) byId('totalUniqueGames').textContent = uniqueGames.size;

    // render genre table: make columns aligned, icon only (no duplicate text)
    const table = byId('genreTable');
    if (!table) return;
    table.innerHTML = '';

    // header row (Type | Icon | Played | Games | Exp)
    const head = document.createElement('div');
    head.className = 'grid-head';
    head.innerHTML = `<div>Type</div><div>Played</div><div>Games</div><div>Exp</div>`;
    table.appendChild(head);

    // sort by played
    genres.sort((a,b) => genreStats[b].exp - genreStats[a].exp);
    genres.forEach(g => {
      const s = genreStats[g];
      const r = document.createElement('div');
      r.className = 'grid-row';

      // type
      const type = document.createElement('div');
      type.className = 'type';
      type.textContent = g;

      // played/games/exp
      const played = document.createElement('div'); played.style.textAlign = 'right'; played.textContent = s.played;
      const games = document.createElement('div'); games.style.textAlign = 'right'; games.textContent = s.games.size;
      const exp = document.createElement('div'); exp.style.textAlign = 'right'; exp.textContent = Math.round(s.exp).toLocaleString();

      r.appendChild(type);
      r.appendChild(played);
      r.appendChild(games);
      r.appendChild(exp);

      table.appendChild(r);
    });
  }

  // search handling (same as before)
  const searchEl = document.getElementById('searchInput');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!window.allData) return;
      if (q === '') { displayData(window.allData); return; }
      if (!q.includes('=')) {
        const filtered = window.allData.filter(r => (r['Game'] || '').toLowerCase().includes(q.toLowerCase()));
        displayData(filtered); return;
      }
      const parts = q.replace(/[()]/g,'').split(',').map(s => s.trim()).filter(Boolean);
      let filtered = window.allData.slice();
      parts.forEach(p => {
        const [k,v] = p.split('=').map(s => s.trim().toLowerCase());
        if (!k) return;
        if (k === 'game') filtered = filtered.filter(r => (r['Game']||'').toLowerCase().includes(v));
        else if (k === 'genre' || k === 'type') filtered = filtered.filter(r => {
          const raw = String(r['Genres']||'').toLowerCase();
          return raw.split(/[,;|]+/).map(s=>s.trim()).some(tag => tag.includes(v));
        });
        else if (k === 'level') filtered = filtered.filter(r => {
          const bs = parseFloat(String(r['BS'] || r['Level'] || '').replace(/[^\d\.\-]/g,''));
          return !isNaN(bs) && Math.floor(bs) === parseInt(v,10);
        });
        else if (k === 'id') filtered = filtered.filter(r => String(r['ID']||'').toLowerCase() === v);
        else if (k === 'idl') filtered = filtered.filter(r => String(r['IDL']||'').toLowerCase() === v);
      });
      displayData(filtered);
    });
  }

  // hint toggle
  const hintBtn = document.getElementById('hintToggle');
  if (hintBtn) hintBtn.addEventListener('click', () => {
    const h = document.getElementById('searchHint');
    if (h) h.classList.toggle('hidden');
  });

  // initial load
  loadData();
});
