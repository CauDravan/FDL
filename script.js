// script.js - single safe file (IIFE) 
(function () {
  // CONFIG - change sheet id or sheet names here if needed
  const SHEET_ID = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
  const LEVEL_SHEET = 'Level(Cd)';
  const STATS_SHEET = 'Stats(Cd)';

  const levelUrl = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(LEVEL_SHEET)}`;
  const statsUrl = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(STATS_SHEET)}`;

  const iconMap = {
    '-1': 'lv1f', '-2': 'lv2f', '-3': 'lv3f', '-46': 'lvinf', 'P': 'lvP', 'U': 'lvU', 'R': 'lvR'
  };

  function getIconFile(level) {
    const key = iconMap[level];
    if (key) return `icons/${key}.png`;
    const n = parseFloat(level);
    if (!isNaN(n)) return `icons/lv${Math.floor(n)}.png`;
    return `icons/lv${level}.png`;
  }

  function parseNum(v) {
    if (v == null) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  // tooltip
  const tooltipEl = document.getElementById('tooltip');
  function showTooltip(html, ev) {
    if (!tooltipEl) return;
    tooltipEl.innerHTML = html;
    tooltipEl.classList.remove('hidden');
    if (ev) moveTooltip(ev);
  }
  function moveTooltip(ev) {
    if (!tooltipEl) return;
    const gap = 12;
    const x = ev.clientX + gap;
    const y = ev.clientY + gap;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }
  function hideTooltip() { if (tooltipEl) tooltipEl.classList.add('hidden'); }

  // rendering helpers
  function createRowForLevel(row) {
    const container = document.createElement('div');
    container.className = 'data-row';
    container.onclick = () => window.location.href = `details.html?id=${encodeURIComponent(row.IDL)}`;

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'icon-wrapper';
    const icon = document.createElement('img');
    icon.className = 'level-icon';
    icon.src = getIconFile(row.Level);
    icon.alt = row.Level || '';
    iconWrapper.appendChild(icon);

    const own = document.createElement('div');
    own.className = 'own-rate';
    own.innerHTML = `<div class="id-code">#${row.ID||''}</div><div>${row['Own Rate']||'-'}</div>`;

    const name = document.createElement('div');
    name.className = 'game-name';
    name.textContent = row['Game'] || '(no name)';

    container.appendChild(iconWrapper);
    container.appendChild(own);
    container.appendChild(name);
    return container;
  }

  function createTypeRow(typeKey, agg) {
    const row = document.createElement('div');
    row.className = 'type-row';
    const keyEl = document.createElement('div');
    keyEl.className = 'type-key';
    keyEl.textContent = typeKey;

    const statsEl = document.createElement('div');
    statsEl.className = 'type-stats';
    statsEl.innerHTML = `<div>Played: ${agg.Played}</div><div>Games: ${agg.Games}</div><div>Exp: ${agg.Exp}</div>`;

    row.appendChild(keyEl);
    row.appendChild(statsEl);

    row.addEventListener('mouseenter', (ev) => {
      const best = findHardestClearByType(typeKey);
      if (best) showTooltip(`${best.Game || '—'} — Level: ${best.Level || '—'}<br/>IDL: ${best.IDL || '-'}`, ev);
    });
    row.addEventListener('mousemove', moveTooltip);
    row.addEventListener('mouseleave', hideTooltip);

    return row;
  }

  function createPlanRow(row) {
    const el = document.createElement('div');
    el.className = 'data-row';
    el.onclick = () => window.location.href = `details.html?id=${encodeURIComponent(row.IDL)}`;
    const info = document.createElement('div');
    info.style.flex = '1';
    info.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;">
        <div style="min-width:120px"><strong>In Progress:</strong> ${row['In Progress']||'-'}</div>
        <div style="min-width:60px"><strong>Level:</strong> ${row.Level||'-'}</div>
        <div style="min-width:80px"><strong>Ownrate:</strong> ${row['Own Rate']||'-'}</div>
        <div style="min-width:80px"><strong>IDL:</strong> ${row.IDL||'-'}</div>
        <div style="min-width:40px"><strong>Pri:</strong> ${row.Pri||'-'}</div>
      </div>
      <div style="margin-top:8px"><strong>Progress:</strong> ${row.Progress||'-'} • <strong>Feeling:</strong> ${row.Feeling||'-'} • <em>${row.Comment||''}</em></div>
    `;
    el.appendChild(info);
    return el;
  }

  // aggregate & find
  function aggregateByType(rows) {
    const map = {};
    (rows||[]).forEach(r => {
      const t = (r.Type || '').trim() || '#unknown';
      if (!map[t]) map[t] = { Played: 0, Games: 0, Exp: 0, sample: r };
      map[t].Played += Number(r.Played || 0);
      map[t].Games += Number(r.Games || 0);
      map[t].Exp += Number(r.Exp || 0);
    });
    return map;
  }

  function findHardestClearByType(typeKey) {
    if (!window.statsData) return null;
    const rows = window.statsData.filter(r => ((r.Type||'').trim() === typeKey));
    if (!rows.length) return null;
    rows.sort((a,b) => (parseNum(b.BS) || parseNum(b.Level)) - (parseNum(a.BS) || parseNum(a.Level)));
    return rows[0];
  }

  // render per-tab
  function renderMyClears(filterText='') {
    const container = document.getElementById('dataContainer');
    if (!container) return;
    container.innerHTML = '';
    let data = (window.levelData||[]);
    if (filterText) {
      if (!filterText.includes('=')) {
        data = data.filter(r => (r.Game||'').toLowerCase().includes(filterText.toLowerCase()));
      } else {
        const parts = filterText.replace(/[()]/g,'').split(',').map(s=>s.trim());
        parts.forEach(p => {
          const [k,v] = p.split('=').map(x => x.trim().toLowerCase());
          if (k==='game') data = data.filter(r => (r.Game||'').toLowerCase().includes(v));
          if (k==='level') data = data.filter(r => String(Math.floor(parseNum(r.BS)||0)) === v);
          if (k==='id') data = data.filter(r => (r.ID||'').toString() === v);
        });
      }
    }
    data.forEach(r => container.appendChild(createRowForLevel(r)));
  }

  function renderTypeStats(filterType='') {
    const container = document.getElementById('typeContainer');
    if (!container) return;
    container.innerHTML = '';
    const map = aggregateByType(window.statsData || []);
    Object.keys(map).sort().forEach(k => {
      if (filterType && !k.toLowerCase().includes(filterType.toLowerCase())) return;
      container.appendChild(createTypeRow(k, map[k]));
    });
  }

  function renderClearPlan(filterText='') {
    const container = document.getElementById('planContainer');
    if (!container) return;
    container.innerHTML = '';
    let rows = (window.statsData||[]).filter(r => (r['In Progress'] && r['In Progress'].trim() !== ''));
    if (filterText) {
      const parts = filterText.replace(/[()]/g,'').split(',').map(s=>s.trim());
      parts.forEach(p => {
        const [k,v] = p.split('=').map(x => x.trim().toLowerCase());
        if (k==='pri') rows = rows.filter(r => (r.Pri||'').toString() === v);
        if (k==='feeling') rows = rows.filter(r => (r.Feeling||'').toLowerCase().includes(v));
        if (k==='idl') rows = rows.filter(r => (r.IDL||'').toString() === v);
      });
    }
    rows.forEach(r => container.appendChild(createPlanRow(r)));
  }

  // load both sheets once
  async function loadAll() {
    try {
      const [levelsRes, statsRes] = await Promise.all([ fetch(levelUrl), fetch(statsUrl) ]);
      if (!levelsRes.ok) throw new Error(`Level fetch failed: ${levelsRes.status}`);
      if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);
      const [lv, st] = await Promise.all([levelsRes.json(), statsRes.json()]);
      window.levelData = lv;
      window.statsData = st;

      // fill left sidebar quick info
      const perfList = document.getElementById('perfList');
      const statList = document.getElementById('statList');
      if (perfList) {
        perfList.innerHTML = `<div class="stat-item">Levels total: ${window.levelData.length}</div>
                              <div class="stat-item">Stats rows: ${window.statsData.length}</div>`;
      }
      if (statList) {
        statList.innerHTML = `<div class="stat-item">Sample: ${window.levelData[0] ? window.levelData[0].Game : '-'}</div>`;
      }

      // initial render
      renderMyClears();
      renderTypeStats();
      renderClearPlan();
    } catch (err) {
      console.error('Load failed', err);
      const c = document.getElementById('dataContainer');
      if (c) c.innerHTML = `<div style="color:tomato">Failed to load data: ${err.message}</div>`;
    }
  }

  // wire UI events
  function wireUI() {
    const sc = document.getElementById('searchClears');
    const st = document.getElementById('searchTypes');
    const sp = document.getElementById('searchPlan');
    if (sc) sc.addEventListener('input', e => renderMyClears(e.target.value.trim()));
    if (st) st.addEventListener('input', e => renderTypeStats(e.target.value.trim()));
    if (sp) sp.addEventListener('input', e => renderClearPlan(e.target.value.trim()));

    document.querySelectorAll('.tab-btn').forEach(btn=>{
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
        const el = document.getElementById(`tab-${tab}`);
        if (el) el.classList.add('active');
      });
    });
  }

  wireUI();
  loadAll();
})();
