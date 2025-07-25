const spreadsheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const sheetName = "'Level(Cd)'!A:T";
const url = `https://opensheet.elk.sh/${spreadsheetId}/${sheetName}`;

const dataContainer = document.getElementById('dataContainer');
const searchInput = document.getElementById('searchInput');
const detailView = document.getElementById('detailView');
const detailContent = document.getElementById('detailContent');
const backButton = document.getElementById('backButton');

function levelToIcon(level) {
  const iconMap = {
    '-1': 'lv1f',
    '-2': 'lv2f',
    '-3': 'lv3f',
    'U': 'lvU',
    'R': 'lvR',
    '-46': 'lvinf'
  };

  if (iconMap[level]) return iconMap[level];

  const base = Math.floor(Number(level));
  const decimal = (Number(level) - base).toFixed(1);
  const stars = decimal === '0.1' ? '⭑' : decimal === '0.2' ? '⭑⭑' : '';

  return `lv${base}${stars}`;
}

function createRow(item) {
  const div = document.createElement('div');
  div.className = 'row';
  div.innerHTML = `
    <img src="icons/${levelToIcon(item.Level)}.png" alt="${item.Level}" class="icon">
    <span class="rate">${item['Own Rate']}</span>
    <span class="name">${item['Game Name']}</span>
  `;
  div.addEventListener('click', () => showDetail(item));
  return div;
}

function showDetail(item) {
  detailView.classList.remove('hidden');
  dataContainer.style.display = 'none';
  searchInput.style.display = 'none';
  detailContent.innerHTML = `
    <h2>${item['Game Name']}</h2>
    <img src="icons/${levelToIcon(item.Level)}.png" alt="${item.Level}" class="icon-large">
    <p><strong>Level:</strong> ${item.Level}</p>
    <p><strong>Own Rate:</strong> ${item['Own Rate']}</p>
    <p><strong>More Info:</strong> (Thêm thông tin ở đây nếu cần)</p>
  `;
}

backButton.addEventListener('click', () => {
  detailView.classList.add('hidden');
  dataContainer.style.display = '';
  searchInput.style.display = '';
});

function renderData(data) {
  dataContainer.innerHTML = '';
  data.forEach(item => {
    const row = createRow(item);
    dataContainer.appendChild(row);
  });
}

fetch(url)
  .then(res => res.json())
  .then(data => {
    let allData = data;
    renderData(allData);

    searchInput.addEventListener('input', e => {
      const keyword = e.target.value.toLowerCase();
      const filtered = allData.filter(item => item['Game Name'].toLowerCase().includes(keyword));
      renderData(filtered);
    });
  });
