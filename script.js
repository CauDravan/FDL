let allData = [];

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

  allData
    .filter(item => item.Game.toLowerCase().includes(filter.toLowerCase()))
    .forEach(item => {
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
