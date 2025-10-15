// script.js — dashboard logic (Orbitron theme, neon styling)
// wrapped on DOMContentLoaded for GitHub Pages safety
document.addEventListener('DOMContentLoaded', () => {
  const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
  const sheetName = 'Level(Cd)';
  const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

  // icon map (adjust to your icons/ folder filenames)
  const iconMap = { '-1': 'lv1f', '-2': 'lv2f', '-3': 'lv3f', '-46': 'lvinf', 'P': 'lvP', 'U': 'lvU', 'R': 'lvR' };

  function getIconFile(level){
    if (level == null) return `icons/lv_unknown.png`;
    const t = String(level).trim();
    if (iconMap[t]) return `icons/${iconMap[t]}.png`;
    const n = parseFloat(t);
    if (!isNaN(n)) return `icons/lv${Math.floor(n)}.png`;
    return `icons/lv${t}.png`;
  }

  function safeParseExp(v){
    if (v == null) return 0;
    const cleaned = String(v).replace(/[^\d\.\-]/g,'');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  // rendering helpers
  function createRow(data){
    const row = document.createElement('div');
    row.className = 'row-item';
    row.onclick = () => {
      const idl = data['IDL'] || '';
      window.location.href = `details.html?id=${encodeURIComponent(idl)}`;
    };

    const iconWrap = document.createElement('div');
    iconWrap.className = 'row-icon';
    const iconImg = document.createElement('img');
    iconImg.className = 'level-icon';
    iconImg.src = getIconFile(data.Level || data.BS);
    iconImg.alt = String(data.Level || '');
    iconImg.onerror = () => { iconImg.style.display = 'none'; };
    iconWrap.appendChild(iconImg);

    if (['P','R','U'].includes(String(data.Level))) {
      const sub = document.createElement('img');
      sub.className = 'sub-icon';
      sub.src = getIconFile(data.BS);
      sub.alt = String(data.BS || '');
      sub.onerror = () => { sub.style.display = 'none'; };
      iconWrap.appendChild(sub);
    }

    const meta = document.createElement('div');
    meta.className = 'row-meta';
    const idEl = document.createElement('div'); idEl.className = 'id-code'; idEl.textContent = `#${data.ID || '-'}`;
    const ownEl = document.createElement('div'); ownEl.className = 'own-rate'; ownEl.textContent = data['Own Rate'] || '-';
    meta.appendChild(idEl); meta.appendChild(ownEl);

    const titleWrap = document.createElement('div');
    titleWrap.className = 'row-title';
    const gameEl = document.createElement('div'); gameEl.className = 'game'; gameEl.textContent = data['Game'] || (data['IDL'] || '(unknown)');
    const descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = data['Own Rate'] ? data['Own Rate'] : (data['Level'] || '');
    titleWrap.appendChild(gameEl); titleWrap.appendChild(descEl);

    row.appendChild(iconWrap);
    row.appendChild(meta);
    row.appendChild(titleWrap);

    return row;
  }

  // state
  window.allData = [];
  let renderLimit = 200;
  const INCR = 200;

  async function fetchData(){
    // show loader
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error('Unexpected data format');
      window.allData = json;
      computeAndRender(window.allData);
      renderInitial();
    } catch(err){
      console.error('Load failed', err);
      const container = document.getElementById('dataContainer');
      if (container) container.innerHTML = `<div style="color:#f88;padding:18px">Failed to load data: ${String(err)}. Check console/network.</div>`;
      const g = document.getElementById('genreTable'); if (g) g.innerHTML = `<div style="color:#f88;padding:12px">Failed to load genres</div>`;
    } finally {
      const loader2 = document.getElementById('loader'); if (loader2) loader2.style.display = 'none';
    }
  }

  function renderInitial(){
    const container = document.getElementById('dataContainer');
    if (!container) return;
    container.innerHTML = ''; // clear loader
    if (!window.allData || window.allData.length === 0) {
      container.innerHTML = `<div style="color:var(--muted);padding:18px">No data</div>`;
      return;
    }
    const toRender = window.allData.slice(0, renderLimit);
    toRender.forEach(r => container.appendChild(createRow(r)));

    const btn = document.getElementById('loadMoreBtn');
    if (window.allData.length > renderLimit) {
      btn.classList.remove('hidden');
      btn.textContent = `Load more (${window.allData.length - renderLimit} more)`;
    } else {
      btn.classList.add('hidden');
    }
  }

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    renderLimit += INCR;
    renderInitial();
  });

  // search & filters (supports game, genre/type, level, id, idl)
  const searchEl = document.getElementById('searchInput');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!q) { renderLimit = INCR; renderInitial(); return; }
      if (!q.includes('=')) {
        const filtered = window.allData.filter(r => String(r['Game']||'').toLowerCase().includes(q.toLowerCase()));
        displayFiltered(filtered);
        return;
      }
      const parts = q.replace(/[()]/g,'').split(',').map(s => s.trim()).filter(Boolean);
      let filtered = window.allData.slice();
      parts.forEach(p => {
        const [k,v] = p.split('=').map(s => s.trim().toLowerCase());
        if (!k) return;
        if (k === 'game') filtered = filtered.filter(r => String(r['Game']||'').toLowerCase().includes(v));
        else if (k === 'genre' || k === 'type') filtered = filtered.filter(r => {
          const raw = String(r['Genres'] || '').toLowerCase();
          return raw.split(/[,;|]+/).map(s => s.trim()).some(tag => tag.includes(v));
        });
        else if (k === 'level') filtered = filtered.filter(r => {
          const bs = parseFloat(String(r['BS'] || r['Level'] || '').replace(/[^\d\.\-]/g,''));
          return !isNaN(bs) && Math.floor(bs) === parseInt(v,10);
        });
        else if (k === 'id') filtered = filtered.filter(r => String(r['ID']||'').toLowerCase() === v);
        else if (k === 'idl') filtered = filtered.filter(r => String(r['IDL']||'').toLowerCase() === v);
      });
      displayFiltered(filtered);
    });
  }

  function displayFiltered(list){
    const container = document.getElementById('dataContainer');
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = `<div style="color:var(--muted);padding:12px">No results</div>`;
      document.getElementById('loadMoreBtn').classList.add('hidden');
      return;
    }
    list.slice(0, renderLimit).forEach(r => container.appendChild(createRow(r)));
    const btn = document.getElementById('loadMoreBtn');
    if (list.length > renderLimit) {
      btn.classList.remove('hidden');
      btn.textContent = `Load more (${list.length - renderLimit} more)`;
    } else btn.classList.add('hidden');
  }

  // hint toggle
  const hintBtn = document.getElementById('hintToggle');
  if (hintBtn) hintBtn.addEventListener('click', () => {
    const h = document.getElementById('searchHint');
    if (h) h.classList.toggle('hidden');
  });

  // compute stats & render genre table
  function computeAndRender(rows){
    const totalRows = rows.length;
    const uniqueIdl = new Set();
    const uniqueGames = new Set();
    let totalExp = 0;
    const genreStats = {};

    rows.forEach(r => {
      const idl = r['IDL']; if (idl != null) uniqueIdl.add(String(idl));
      const gid = r['ID']; if (gid != null) uniqueGames.add(String(gid));
      totalExp += safeParseExp(r['Exp']);

      const rawGenres = String(r['Genres'] || '').trim();
      const parts = rawGenres === '' ? [] : rawGenres.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
      const genres = parts.length ? parts : ['#unknown'];

      genres.forEach(g => {
        if (!genreStats[g]) genreStats[g] = { played:0, games: new Set(), exp:0, topRow: null, topVal:-Infinity };
        genreStats[g].played += 1;
        if (gid != null) genreStats[g].games.add(String(gid));
        genreStats[g].exp += safeParseExp(r['Exp']);

        const bsVal = parseFloat(String(r['BS'] || '').replace(/[^\d\.\-]/g,''));
        const levelVal = parseFloat(String(r['Level'] || '').replace(/[^\d\.\-]/g,''));
        const pickVal = isFinite(bsVal) ? bsVal : (isFinite(levelVal) ? levelVal : -Infinity);
        if (pickVal > genreStats[g].topVal) { genreStats[g].topVal = pickVal; genreStats[g].topRow = r; }
      });
    });

    // top genre by played
    const keys = Object.keys(genreStats);
    let topGenre = keys.length ? keys[0] : '—';
    keys.forEach(k => { if (genreStats[k].played > (genreStats[topGenre]?.played || 0)) topGenre = k; });

    // render left stats
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('totalRows', totalRows);
    setText('totalUniqueIdl', uniqueIdl.size);
    setText('totalExp', Math.round(totalExp).toLocaleString());
    setText('topGenre', topGenre);
    setText('totalUniqueGames', uniqueGames.size);

    // render genre table (right)
    const table = document.getElementById('genreTable');
    if (!table) return;
    table.innerHTML = '';
    if (keys.length === 0) { table.innerHTML = `<div class="placeholder">No genres</div>`; return; }

    // header
    const head = document.createElement('div'); head.className = 'genre-row';
    head.innerHTML = `<div class="g-type" style="font-weight:800">Type</div><div style="font-weight:800">Title</div><div style="text-align:right;font-weight:800">Played</div><div style="text-align:right;font-weight:800">Games</div><div style="text-align:right;font-weight:800">Exp</div>`;
    table.appendChild(head);

    // sort by played desc
    keys.sort((a,b) => genreStats[b].played - genreStats[a].played).forEach(k => {
      const s = genreStats[k];
      const r = document.createElement('div'); r.className = 'genre-row';
      const top = s.topRow;
      const iconSrc = top ? getIconFile(top.Level || top.BS) : 'icons/lv_unknown.png';
      const titleHTML = `<div class="g-title"><img src="${iconSrc}" onerror="this.style.display='none'"/><div style="display:flex;flex-direction:column;"><div style="font-weight:700;color:var(--accent1)">${top ? (top.Level || '—') : '—'}</div><div style="font-size:12px;color:var(--muted)">${k}</div></div></div>`;
      r.innerHTML = `<div class="g-type">${k}</div><div>${titleHTML}</div><div style="text-align:right">${s.played}</div><div style="text-align:right">${s.games.size}</div><div style="text-align:right">${Math.round(s.exp).toLocaleString()}</div>`;
      table.appendChild(r);
    });
  }

  // initial fetch
  fetchData();

  // expose for debugging
  window._fdl = { getIconFile, computeAndRender };
});
