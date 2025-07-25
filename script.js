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
    window.location.href = `details.html?id=${data['NO']}`;
  };

  const icon = document.createElement('img');
  icon.src = getIconFile(data.Level);
  icon.alt = data.Level;
  icon.className = 'level-icon';

  const ownRate = document.createElement('div');
  ownRate.className = 'own-rate';
  ownRate.textContent = data['Own Rate'] || '-';

  const gameName = document.createElement('div');
  gameName.className = 'game-name';
  gameName.textContent = data['Game'] || '(No name)';

  container.appendChild(icon);
  container.appendChild(ownRate);
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
  const query = e.target.value.toLowerCase();
  const filtered = window.allData.filter(row =>
    row['Game']?.toLowerCase().includes(query)
  );
  displayData(filtered);
});

loadData();
