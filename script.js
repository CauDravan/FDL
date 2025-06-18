const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const url = `https://opensheet.elk.sh/${sheetId}/Level(Cd)`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('level-list');

    data.forEach(row => {
      const li = document.createElement('li');
      li.textContent = row['Level'] || JSON.stringify(row);
      list.appendChild(li);
    });
  })
  .catch(error => console.error('Error:', error));
