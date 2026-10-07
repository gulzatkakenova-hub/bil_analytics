function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('btsChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['БТС-1 (Сент)', 'БТС-2 (Ноябрь)', 'БТС-3 (Январь)', 'БТС-4 (Март)'],
      datasets: [
        {
          label: 'Твой балл',
          data: [78, 82, 85, 88.5],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
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
