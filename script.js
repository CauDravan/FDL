const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const sheetName = 'Level(Cd)';
const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

const iconMap = {
  '-1': 'lv1f','-2':'lv2f','-3':'lv3f','-46':'lvinf','P':'lvP','U':'lvU','R':'lvR'
};
function getIconFile(level){
  const key = iconMap[level];
  if(key) return `icons/${key}.png`;
  const n = parseFloat(level);
  if(!isNaN(n)) return `icons/lv${Math.floor(n)}.png`;
  return `icons/lv${level}.png`;
}

/* ----------------- rendering helpers ----------------- */
function createRow(data){
  const container = document.createElement('div');
  container.className = 'data-row';
  container.onclick = () => window.location.href = `details.html?id=${encodeURIComponent(data.IDL)}`;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'icon-wrapper';
  const icon = document.createElement('img');
  icon.className = 'level-icon';
  icon.src = getIconFile(data.Level);
  icon.alt = data.Level;
  iconWrapper.appendChild(icon);

  const own = document.createElement('div');
  own.className = 'own-rate';
  own.innerHTML = `<div class="id-code">#${data.ID}</div><div>${data['Own Rate']||'-'}</div>`;

  const name = document.createElement('div');
  name.className = 'game-name';
  name.textContent = data['Game'] || '(IDL name)';

  container.appendChild(iconWrapper);
  container.appendChild(own);
  container.appendChild(name);
  return container;
}

/* Type row (aggregated) */
function createTypeRow(typeKey, aggregate, sampleRow){
  const row = document.createElement('div');
  row.className = 'type-row';
  const keyEl = document.createElement('div');
  keyEl.className = 'type-key';
  keyEl.textContent = `${typeKey}`;

  const statsEl = document.createElement('div');
  statsEl.className = 'type-stats';
  statsEl.innerHTML = `<div>Played: ${aggregate.Played}</div>
                       <div>Games: ${aggregate.Games}</div>
                       <div>Exp: ${aggregate.Exp}</div>`;

  row.appendChild(keyEl);
  row.appendChild(statsEl);

  // attach tooltip behaviour (show hardest clear)
  row.addEventListener('mouseenter', (ev) => {
    const best = findHardestClear(typeKey);
    if(!best) return;
    showTooltip(`${best.Game} — Level: ${best.Level} (IDL: ${best.IDL})`, ev.target);
  });
  row.addEventListener('mousemove',(ev)=> moveTooltip(ev));
  row.addEventListener('mouseleave', hideTooltip);

  return row;
}

/* Clear plan row */
function createPlanRow(data){
  const row = document.createElement('div');
  row.className = 'data-row';
  row.onclick = ()=> window.location.href = `details.html?id=${encodeURIComponent(data.IDL)}`;

  const info = document.createElement('div');
  info.style.flex='1';
  info.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="min-width:120px"><strong>In Progress:</strong> ${data['In Progress']||'-'}</div>
      <div style="min-width:60px"><strong>Level:</strong> ${data.Level||'-'}</div>
      <div style="min-width:80px"><strong>Ownrate:</strong> ${data['Own Rate']||'-'}</div>
      <div style="min-width:80px"><strong>IDL:</strong> ${data.IDL||'-'}</div>
      <div style="min-width:40px"><strong>Pri:</strong> ${data.Pri||'-'}</div>
    </div>
    <div style="margin-top:8px"><strong>Progress:</strong> ${data.Progress||'-'} • <strong>Feeling:</strong> ${data.Feeling||'-'} • <em>${data.Comment||''}</em></div>
  `;
  row.appendChild(info);
  return row;
}

/* ----------------- tooltip ----------------- */
const tooltipEl = document.getElementById('tooltip');
function showTooltip(html, anchorEventOrEl){
  tooltipEl.innerHTML = html;
  tooltipEl.classList.remove('hidden');
  if(anchorEventOrEl instanceof Event){
    moveTooltip(anchorEventOrEl);
  } else if(anchorEventOrEl.getBoundingClientRect){
    const r = anchorEventOrEl.getBoundingClientRect();
    tooltipEl.style.left = (r.right + 12) + 'px';
    tooltipEl.style.top = (r.top) + 'px';
  }
}
function moveTooltip(ev){
  const gap = 12;
  const x = ev.clientX + gap;
  const y = ev.clientY + gap;
  tooltipEl.style.left = x + 'px';
  tooltipEl.style.top = y + 'px';
}
function hideTooltip(){ tooltipEl.classList.add('hidden'); }

/* ----------------- logic: aggregate and find hardest ----------------- */
function aggregateByType(rows){
  const map = {};
  rows.forEach(r=>{
    const t = (r.Type || '').trim() || '#unknown';
    if(!map[t]) map[t] = {Played:0, Games:0, Exp:0, sample: r};
    map[t].Played += Number(r.Played || 0);
    map[t].Games += Number(r.Games || 0);
    map[t].Exp += Number(r.Exp || 0);
  });
  return map;
}
function findHardestClear(typeKey){
  if(!window.allData) return null;
  const rows = window.allData.filter(r => ((r.Type||'').trim()===typeKey));
  if(rows.length===0) return null;
  // choose by numeric BS (if not number fallback to Level)
  rows.sort((a,b)=>{
    const aBS = parseFloat(a.BS) || parseFloat(a.Level) || 0;
    const bBS = parseFloat(b.BS) || parseFloat(b.Level) || 0;
    return bBS - aBS;
  });
  return rows[0];
}

/* ----------------- rendering per tab ----------------- */
function renderMyClears(filterText = ''){
  const container = document.getElementById('dataContainer');
  container.innerHTML = '';
  let filtered = window.allData || [];
  if(!filterText) {
    // show all
  } else if(!filterText.includes('=')){
    filtered = filtered.filter(row => (row['Game']||'').toLowerCase().includes(filterText.toLowerCase()));
  } else {
    const clean = filterText.replace(/[()]/g,'').split(',').map(s=>s.trim());
    clean.forEach(f=>{
      const [k,v] = f.split('=').map(x=>x.trim().toLowerCase());
      if(!k) return;
      if(k==='game') filtered = filtered.filter(r=> (r.Game||'').toLowerCase().includes(v));
      else if(k==='genre') filtered = filtered.filter(r=> (r.Genres||'').toLowerCase().includes(v));
      else if(k==='level') filtered = filtered.filter(r=> String(Math.floor(parseFloat(r.BS)||0)) === v);
      else if(k==='id') filtered = filtered.filter(r=> (r.ID||'').toString() === v);
    });
  }
  filtered.forEach(r => container.appendChild(createRow(r)));
}

function renderTypeStats(searchType = ''){
  const container = document.getElementById('typeContainer');
  container.innerHTML = '';
  const map = aggregateByType(window.allData || []);
  const keys = Object.keys(map).sort();
  keys.forEach(k=>{
    if(searchType && !k.toLowerCase().includes(searchType.toLowerCase())) return;
    const aggregate = map[k];
    container.appendChild(createTypeRow(k, aggregate, aggregate.sample));
  });
}

function renderClearPlan(filterText=''){
  const container = document.getElementById('planContainer');
  container.innerHTML = '';
  let rows = (window.allData||[]).filter(r => (r['In Progress'] && r['In Progress'].trim() !== ''));
  if(filterText){
    const clean = filterText.replace(/[()]/g,'').split(',').map(s=>s.trim());
    clean.forEach(f=>{
      const [k,v] = f.split('=').map(x=>x.trim().toLowerCase());
      if(k==='pri') rows = rows.filter(r=> (r.Pri||'').toString() === v);
      if(k==='feeling') rows = rows.filter(r=> (r.Feeling||'').toLowerCase().includes(v));
      if(k==='idl') rows = rows.filter(r=> (r.IDL||'').toString() === v);
    });
  }
  rows.forEach(r => container.appendChild(createPlanRow(r)));
}

/* ----------------- initial load & event wiring ----------------- */
async function loadData(){
  try{
    const res = await fetch(url);
    const json = await res.json();
    window.allData = json;

    // fill left profile stats: pick some summary fields (you can adjust)
    document.getElementById('perfList').innerHTML = `
      <div class="stat-item">Clears: ${json.length}</div>
      <div class="stat-item">Distinct Types: ${[...new Set(json.map(r=>r.Type||'')).filter(x=>x)].length}</div>
    `;
    document.getElementById('statList').innerHTML = `
      <div class="stat-item">Latest IDL: ${(json[0] && json[0].IDL) || '-'}</div>
      <div class="stat-item">Sample Game: ${(json[0] && json[0].Game) || '-'}</div>
    `;

    renderMyClears();
    renderTypeStats();
    renderClearPlan();
  }catch(err){
    console.error('Failed to load data',err);
  }
}

loadData();

/* tab switcher */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
  });
});

/* searches */
document.getElementById('searchClears').addEventListener('input', (e)=>{
  renderMyClears(e.target.value.trim());
});
document.getElementById('searchTypes').addEventListener('input', (e)=>{
  renderTypeStats(e.target.value.trim());
});
document.getElementById('searchPlan').addEventListener('input', (e)=>{
  renderClearPlan(e.target.value.trim());
});
