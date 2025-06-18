const sheetId = '1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o';
const url = `https://opensheet.elk.sh/${sheetId}/Level(Cd)`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const table_head = document.getElementById('table_head');
    const table_body = document.getElementById('table_body');

    if (data.length === 0) return;

    const headerRow = document.createElement('tr');
    Object.keys(data[0]).slice(0, 12).forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    table_head.appendChild(headerRow);

    data.forEach(row => {
      const tr = document.createElement('tr');
      Object.values(row).slice(0, 12).forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      table_body.appendChild(tr);
    });
  })
  .catch(error => console.error('Error:', error));
