// Переключение вкладок
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabId).classList.add('active');
  
  // Подсветка активной кнопки в десктоп и мобильном меню
  if (element) {
    element.classList.add('active');
  }
}

// Переключение Тёмной / Светлой темы
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  document.getElementById('themeBtn').innerText = newTheme === 'light' ? '🌙' : '☀️';
  
  // Обновляем цвета графика под тему
  if (window.btsChartInstance) {
    const isDark = newTheme === 'dark';
    window.btsChartInstance.options.scales.x.ticks.color = isDark ? '#94a3b8' : '#6b7280';
    window.btsChartInstance.options.scales.y.ticks.color = isDark ? '#94a3b8' : '#6b7280';
    window.btsChartInstance.update();
  }
}

// Загрузка сохранённой темы и инициализация графика
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeBtn').innerText = savedTheme === 'light' ? '🌙' : '☀️';

  const ctx = document.getElementById('btsChart').getContext('2d');
  
  window.btsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['БТС-1 (Сент)', 'БТС-2 (Ноябрь)', 'БТС-3 (Январь)', 'БТС-4 (Март)'],
      datasets: [
        {
          label: 'Твой балл',
          data: [78, 82, 85, 88.5],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Средний балл по БИЛ',
          data: [70, 72, 74, 75],
          borderColor: '#9ca3af',
          borderDash: [5, 5],
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 50,
          max: 100
        }
      }
    }
  });
});
