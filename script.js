let allData = [];
let currentPage = 1;
const pageSize = 30;
let searchTimeout;

// Fetch data với error handling
fetch("https://opensheet.elk.sh/1j6RlyzBKN0WX_HsLL4J0mzzF1TzYauxok55dIKA1U2o/1")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    allData = data;
    renderList(); // Render danh sách khi đã có dữ liệu
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById("gameList").innerHTML = `
      <div style="text-align: center; color: #e74c3c; padding: 40px;">
        <h3>Lỗi khi tải dữ liệu</h3>
        <p>Không thể kết nối đến server. Vui lòng thử lại sau.</p>
      </div>
    `;
  });

// Search với debounce để tối ưu performance
document.getElementById("searchInput").addEventListener("input", e => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage = 1; // Reset về trang đầu khi search
    renderList(e.target.value);
  }, 300); // Đợi 300ms sau khi user ngừng gõ
});

function renderList(filter = "") {
  const gameList = document.getElementById("gameList");
  
  // Hiển thị loading nếu chưa có dữ liệu
  if (allData.length === 0) {
    gameList.innerHTML = '<div style="text-align: center; padding: 40px;">Đang tải dữ liệu...</div>';
    return;
  }
  
  gameList.innerHTML = "";
  
  // Filter dữ liệu
  const filtered = allData.filter(item => {
    if (!item.Game) return false;
    return item.Game.toLowerCase().includes(filter.toLowerCase());
  });
  
  // Phân trang
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filtered.slice(start, end);
  
  // Hiển thị kết quả search
  if (filtered.length === 0 && filter) {
    gameList.innerHTML = `
      <div style="text-align: center; color: #666; padding: 40px;">
        <h3>Không tìm thấy kết quả</h3>
        <p>Không có game nào khớp với từ khóa: "<strong>${filter}</strong>"</p>
      </div>
    `;
    document.getElementById("pagination").innerHTML = "";
    return;
  }
  
  // Render từng item
  pageData.forEach(item => {
    const iconName = getIconName(item.Level);
    const div = document.createElement("div");
    div.className = "game-item";
    div.innerHTML = `
      <img src="icons/${iconName}.png" alt="Level ${item.Level}" onerror="this.src='icons/default.png'" />
      <div class="game-name" title="${item.Game}">${item.Game}</div>
      <div class="own-rate">${item["Own Rate"] || 'N/A'}</div>
    `;
    div.onclick = () => window.location.href = `detail.html?no=${item.NO}`;
    gameList.appendChild(div);
  });
  
  renderPagination(filtered.length);
}

// Hàm lấy tên icon (consistent với index.html)
function getIconName(level) {
  const specialIcons = {
    "P": "lvP",
    "U": "lvU", 
    "R": "lvR",
    "-1": "lv1f",
    "-2": "lv2f",
    "-3": "lv3f", 
    "-46": "lvinf"
  };
  
  // Xử lý cả string và number
  const levelStr = String(level);
  if (specialIcons[levelStr]) {
    return specialIcons[levelStr];
  }
  
  // Với level số, làm tròn xuống
  const levelNum = parseFloat(level);
  if (!isNaN(levelNum)) {
    return `lv${Math.floor(levelNum)}`;
  }
  
  // Fallback cho trường hợp không xác định
  return "lv0";
}

function renderPagination(totalItems) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  
  const totalPages = Math.ceil(totalItems / pageSize);
  
  if (totalPages <= 1) return; // Không hiển thị pagination nếu chỉ có 1 trang
  
  // Nút Previous
  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "« Trước";
    prevBtn.onclick = () => {
      currentPage--;
      renderList(document.getElementById("searchInput").value);
    };
    pagination.appendChild(prevBtn);
  }
  
  // Logic hiển thị các trang (hiển thị tối đa 5 trang)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // Điều chỉnh nếu không đủ 5 trang
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else {
      startPage = Math.max(1, endPage - 4);
    }
  }
  
  // Hiển thị trang đầu nếu cần
  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.textContent = "1";
    firstBtn.onclick = () => {
      currentPage = 1;
      renderList(document.getElementById("searchInput").value);
    };
    pagination.appendChild(firstBtn);
    
    if (startPage > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "0 10px";
      pagination.appendChild(dots);
    }
  }
  
  // Hiển thị các trang chính
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === currentPage) ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderList(document.getElementById("searchInput").value);
    };
    pagination.appendChild(btn);
  }
  
  // Hiển thị trang cuối nếu cần
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "0 10px";
      pagination.appendChild(dots);
    }
    
    const lastBtn = document.createElement("button");
    lastBtn.textContent = totalPages;
    lastBtn.onclick = () => {
      currentPage = totalPages;
      renderList(document.getElementById("searchInput").value);
    };
    pagination.appendChild(lastBtn);
  }
  
  // Nút Next
  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Sau »";
    nextBtn.onclick = () => {
      currentPage++;
      renderList(document.getElementById("searchInput").value);
    };
    pagination.appendChild(nextBtn);
  }
}
