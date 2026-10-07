// Начальные данные (дефолтные)
const defaultBtsData = [
  { name: 'БТС-1 (Сент)', score: 78 },
  { name: 'БТС-2 (Ноябрь)', score: 82 },
  { name: 'БТС-3 (Январь)', score: 85 },
  { name: 'БТС-4 (Март)', score: 88.5 }
];

let btsData = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  // Загрузка темы
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeBtn').innerText = savedTheme === 'light' ? '🌙' : '☀️';

  // Загрузка сохранённых данных из localStorage
  const savedData = localStorage.getItem('btsData');
  btsData = savedData ? JSON.parse(savedData) : defaultBtsData;

  initChart();
  updateUI();
});

// Инициализация графика
function initChart() {
  const ctx = document.getElementById('btsChart').getContext('2d');
  
  window.btsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: btsData.map(item => item.name),
      datasets: [
        {
          label: 'Твой балл',
          data: btsData.map(item => item.score),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false, min: 50, max: 100 }
      }
    }
  });
}

// Обновление интерфейса при изменении данных
function updateUI() {
  // Обновление графика
  if (window.btsChartInstance) {
    window.btsChartInstance.data.labels = btsData.map(item => item.name);
    window.btsChartInstance.data.datasets[0].data = btsData.map(item => item.score);
    window.btsChartInstance.update();
  }

  // Обновление последнего балла
  const lastItem = btsData[btsData.length - 1];
  if (lastItem) {
    document.getElementById('latestScore').innerText = `${lastItem.score} / 100`;

    // Разблокировка бэйджа "БТС 90+"
    if (lastItem.score >= 90) {
      document.getElementById('badge90').classList.remove('locked');
      document.getElementById('badge90').querySelector('.badge-icon').innerText = '🎯';
    }
  }

  // Обновление истории
  const historyList = document.getElementById('historyList');
  if (historyList) {
    historyList.innerHTML = btsData.map(item => `
      <li>
        <span><strong>${item.name}</strong></span>
        <span>${item.score} / 100</span>
      </li>
    `).join('');
  }
}

// Модальное окно
function openModal() {
  document.getElementById('scoreModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('scoreModal').style.display = 'none';
}

// Сохранение нового балла
function saveScore(e) {
  e.preventDefault();
  const name = document.getElementById('btsName').value;
  const score = parseFloat(document.getElementById('btsScore').value);

  btsData.push({ name, score });
  localStorage.setItem('btsData', JSON.stringify(btsData));

  updateUI();
  closeModal();
  document.getElementById('scoreForm').reset();
}

// Переключение вкладок
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  if (element) element.classList.add('active');
}

// Переключение темы
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  document.getElementById('themeBtn').innerText = newTheme === 'light' ? '🌙' : '☀️';
}

// Экспорт отчёта в PDF
function exportPDF() {
  const element = document.getElementById('dashboard');
  const opt = {
    margin:       0.5,
    filename:     'BIL_Analytics_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}
