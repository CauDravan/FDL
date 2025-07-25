let allData = [];
let currentPage = 1;
const pageSize = 30;

fetch("https://opensheet.elk.sh/1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o/0")
  .then(res => res.json())
  .then(data => {
    allData = data;
    renderList(); // ✅ gọi tại đây mới đúng
  });

document.getElementById("searchInput").addEventListener("input", e => {
  renderList(e.target.value);
});

function renderList(filter = "") {
  const gameList = document.getElementById("gameList");
  gameList.innerHTML = "";

  const filtered = allData.filter(item =>
    item.Game.toLowerCase().includes(filter.toLowerCase())
  );

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filtered.slice(start, end);

  pageData.forEach(item => {
    const iconName = getIconName(item.Level);

    const div = document.createElement("div");
    div.className = "game-item";
    div.innerHTML = `
      <img src="icons/${iconName}.png" alt="Lv ${item.Level}" />
      <div class="game-name">${item.Game}</div>
      <div class="own-rate">${item["Own Rate"]}</div>
    `;
    div.onclick = () => window.location.href = `detail.html?no=${item.NO}`;
    gameList.appendChild(div);
  });

  renderPagination(filtered.length);
}

function getIconName(level) {
  if (level === "P") return "lvP";
  if (level === "U") return "lvU";
  if (level === "R") return "lvR";
  if (level === -1 || level === "-1") return "lv1f";
  if (level === -2 || level === "-2") return "lv2f";
  if (level === -3 || level === "-3") return "lv3f";
  if (level === -46 || level === "-46") return "lvinf";
  return `lv${Math.floor(level)}`;
}

function renderPagination(totalItems) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = ""; // Xoá pagination cũ

  const totalPages = Math.ceil(totalItems / pageSize);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === currentPage) ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderList(document.getElementById("searchInput").value);
    };
    pagination.appendChild(btn);
  }
}
