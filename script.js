const api_key = 'AKfycbzhTUYLpbsJoBnaeXn9uXJx1Ozo8p8oJR2-TNKN0Mnt6s4XgArmZ9AJM_0gGda5hZf2';
const sheet_id = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const range = "'Level(Cd)'!$L:$L";

const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const values = data.values;
    const list = document.getElementById('level-list');

    if (values) {
      values.forEach(row => {
        const li = document.createElement('li');
        li.textContent = row.join(' - ');
        list.appendChild(li);
      });
    } else {
      list.textContent = 'N/A';
    }
  })
  .catch(error => console.error('Error:', error));
