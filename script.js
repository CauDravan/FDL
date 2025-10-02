const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const sheetName = 'Level(Cd)';
const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

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
  const iconKey = iconMap[level];
  if (iconKey) {
    return `icons/${iconKey}.png`;
  }

  const numLevel = parseFloat(level);
  if (!isNaN(numLevel)) {
    return `icons/lv${Math.floor(numLevel)}.png`;
  }

  return `icons/lv${level}.png`;
}

// ✅ Dùng ID thật (NO) thay vì index
function createRow(data) {
  const container = document.createElement('div');
  container.className = 'data-row';

  container.onclick = () => {
    window.location.href = `details.html?id=${data['IDL']}`;
  };

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'icon-wrapper';

  const icon = document.createElement('img');
  icon.src = getIconFile(data.Level);
  icon.alt = data.Level;
  icon.className = 'level-icon';

  iconWrapper.appendChild(icon);

  // 👇 Nếu là P, R hoặc U → thêm icon con dựa vào BS
  if (['P', 'R', 'U'].includes(data.Level)) {
    const subIcon = document.createElement('img');
    subIcon.src = getIconFile(data.BS);
    subIcon.alt = data.BS;
    subIcon.className = 'sub-icon';
    iconWrapper.appendChild(subIcon);
  }

  const ownRateWrapper = document.createElement('div');
  ownRateWrapper.className = 'own-rate';

  const fdg = document.createElement('div');
  fdg.className = 'id-code';
  fdg.textContent = `#${data.ID}`;

  const ownRateText = document.createElement('div');
  ownRateText.textContent = data['Own Rate'] || '-';

  ownRateWrapper.appendChild(fdg);
  ownRateWrapper.appendChild(ownRateText);

  const gameName = document.createElement('div');
  gameName.className = 'game-name';
  gameName.textContent = data['Game'] || '(IDL name)';

  container.appendChild(iconWrapper);
  container.appendChild(ownRateWrapper);
  container.appendChild(gameName);

  return container;
}

async function loadData() {
  try {
    const res = await fetch(url);
    const json = await res.json();
    window.allData = json;
    displayData(json);
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

function displayData(data) {
  const container = document.getElementById('dataContainer');
  container.innerHTML = '';
  data.forEach(row => {
    container.appendChild(createRow(row));
  });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.trim();

  // Nếu không có dấu = thì tìm theo game
  if (!query.includes('=')) {
    const filtered = window.allData.filter(row =>
      row['Game']?.toLowerCase().includes(query.toLowerCase())
    );
    return displayData(filtered);
  }

  // Gỡ bỏ ngoặc nếu có (game=x, id=y)
  const cleanQuery = query
    .replace(/[()]/g, '')
    .split(',')
    .map(s => s.trim());

  let filtered = window.allData;

  cleanQuery.forEach(filter => {
    const [key, value] = filter.split('=').map(x => x.trim().toLowerCase());

    if (key === 'game') {
      filtered = filtered.filter(row =>
        row['Game']?.toLowerCase().includes(value)
      );
    } else if (key === 'genre') {
      filtered = filtered.filter(row =>
        row['Genres']?.toLowerCase().includes(value)
      );
    } else if (key === 'level') {
      filtered = filtered.filter(row =>
        Math.floor(parseFloat(row['BS'])) === parseInt(value)
      );
    } else if (key === 'id') {
      filtered = filtered.filter(row =>
        row['ID']?.toString() === value
      );
    }
  });

  displayData(filtered);
});

loadData();

document.getElementById('hintToggle').addEventListener('click', () => {
  const hint = document.getElementById('searchHint');
  hint.classList.toggle('hidden');
});
