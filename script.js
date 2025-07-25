const data = [
  // Giả lập dữ liệu, sau bạn có thể fetch từ file JSON hoặc Google Sheets
  { level: "P", ownRate: "Extreme: 15x15", gameName: "Futoshiki" },
  { level: "P", ownRate: "Extreme: 60x60", gameName: "Kakuro" },
  { level: "P", ownRate: "Extreme: 50x50", gameName: "Nonogram" },
  { level: 46, ownRate: "AT: 17+(clear)", gameName: "Phigros" },
  { level: -1, ownRate: "BYD: 11+(clear)", gameName: "Arcaea" },
  { level: 45.9, ownRate: "Extreme: Timed(20+)", gameName: "Paper, Please" }
];

function renderList(filter = "") {
  const gameList = document.getElementById("gameList");
  gameList.innerHTML = "";

  data
    .filter(item => item.gameName.toLowerCase().includes(filter.toLowerCase()))
    .forEach(item => {
      const iconName = item.level === "P"
        ? "lvP"
        : item.level === -1
        ? "lv-1"
        : `lv${Math.floor(item.level)}`;

      const div = document.createElement("div");
      div.className = "game-item";
      div.innerHTML = `
        <img src="icons/${iconName}.png" alt="Lv ${item.level}" />
        <div class="game-name">${item.gameName}</div>
        <div class="own-rate">${item.ownRate}</div>
      `;
      gameList.appendChild(div);
    });
}

document.getElementById("searchInput").addEventListener("input", e => {
  renderList(e.target.value);
});

renderList();
