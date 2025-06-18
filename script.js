const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const url = `https://opensheet.elk.sh/${sheetId}/Level(Cd)`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('cd-level-list');

    data.forEach(row => {
      const values = Object.values(row).slice(0, 12);
      const li = document.createElement('li');
      li.textContent = values.join(' | ');
      list.appendChild(li);
    });
  })
  .catch(error => console.error('Error:', error));
