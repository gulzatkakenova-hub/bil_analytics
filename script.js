// CONFIG: Supabase Initialization (замените на свои ключи из Supabase Dashboard при необходимости)
const SUPABASE_URL = "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// STATE
let currentUser = { role: 'student', email: 'student@bil.edu.kz' };
let currentExamDate = '2027-01-15';
let currentExamTitle = 'БТС-3 (Официальный)';

// 10th Grade BIL Topic Registry (Справочник тем БИЛ)
const bilTopicsMastery = [
  { subject: 'Химия', topic: 'Нуклеофильное замещение (Haloalkanes)', score: 42, recommendation: 'Пройди карточки Anki по механизмам SN1/SN2 реакций.' },
  { subject: 'Математика', topic: 'Стереометрия & Вероятность', score: 58, recommendation: 'Реши 5 олимпиадных задач КБО 2024–2025 гг.' },
  { subject: 'Биология', topic: 'Генетические матрицы & ДНК', score: 65, recommendation: 'Повтори тему Репликация ДНК из учебника CLIL.' },
  { subject: 'ЕНТ География', topic: 'ГИС & Пространственный анализ', score: 71, recommendation: 'Просмотри видеоурок по определению топографических масштабов.' }
];

let studentBtsHistory = [
  { name: 'БТС-1 (Сент)', score: 78 },
  { name: 'БТС-2 (Ноябрь)', score: 82 },
  { name: 'БТС-3 (Январь)', score: 88.5 }
];

let globalRating = [
  { rank: 1, name: 'Арман С.', school: 'Астана БИЛ', score: 96.5 },
  { rank: 2, name: 'Данияр К.', school: 'Алматы БИЛ', score: 95.0 },
  { rank: 12, name: 'Вы (Ученик)', school: 'Караганда БИЛ', score: 88.5 }
];

// INIT
document.addEventListener('DOMContentLoaded', () => {
  renderTopicsAndRecommendations();
  renderRatingTable();
  initChart();
  startCountdown();
});

// ROLE SELECTION
function selectRole(role) {
  currentUser.role = role;
  document.getElementById('roleStudentBtn').classList.toggle('active', role === 'student');
  document.getElementById('roleAdminBtn').classList.toggle('active', role === 'admin');
  document.getElementById('loginEmail').value = role === 'admin' ? 'admin@bil.edu.kz' : 'student@bil.edu.kz';
}

function handleLogin(e) {
  e.preventDefault();
  currentUser.email = document.getElementById('loginEmail').value;
  
  document.getElementById('authModal').classList.remove('active');
  document.getElementById('userRoleTag').innerText = currentUser.role === 'admin' ? 'Администратор' : 'Студент';
  document.getElementById('userEmailTag').innerText = currentUser.email;

  // Show Admin tab if admin
  if (currentUser.role === 'admin') {
    document.getElementById('adminTabBtn').style.display = 'block';
  } else {
    document.getElementById('adminTabBtn').style.display = 'none';
  }
}

function handleLogout() {
  document.getElementById('authModal').classList.add('active');
}

// RENDER TOPICS & AI RECOMMENDATIONS
function renderTopicsAndRecommendations() {
  const topicsList = document.getElementById('weakTopicsList');
  const adviceBox = document.getElementById('aiRecommendations');

  topicsList.innerHTML = '';
  adviceBox.innerHTML = '';

  bilTopicsMastery.forEach((item, index) => {
    const badgeColor = item.score < 50 ? 'style="color: var(--danger); font-weight:bold;"' : 'style="color: var(--warning); font-weight:bold;"';
    
    topicsList.innerHTML += `
      <li>
        <span class="tag">${item.subject}</span>
        <span>${item.topic}</span>
        <span ${badgeColor}>${item.score}%</span>
      </li>
    `;

    adviceBox.innerHTML += `
      <div class="advice-item" style="background: rgba(79, 70, 229, 0.08); border-left: 3px solid var(--primary); padding: 10px; border-radius: 6px; margin-top: 8px;">
        <strong>${index + 1}. ${item.subject}:</strong> ${item.recommendation}
      </div>
    `;
  });
}

// RENDER RATING TABLE
function renderRatingTable() {
  const tbody = document.getElementById('ratingTableBody');
  tbody.innerHTML = globalRating.map(row => `
    <tr ${row.rank === 12 ? 'style="font-weight:bold; background: rgba(79,70,229,0.1);"' : ''}>
      <td>#${row.rank}</td>
      <td>${row.name}</td>
      <td>${row.school}</td>
      <td>${row.score}</td>
    </tr>
  `).join('');
}

// COUNTDOWN TIMER
function startCountdown() {
  setInterval(() => {
    const target = new Date(currentExamDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      document.getElementById('countdownDays').innerText = days < 10 ? '0' + days : days;
      document.getElementById('countdownHours').innerText = hours < 10 ? '0' + hours : hours;
    }
  }, 1000);
}

// ADMIN ACTIONS
function handleSetExamDate(e) {
  e.preventDefault();
  currentExamTitle = document.getElementById('adminExamTitle').value;
  currentExamDate = document.getElementById('adminExamDate').value;

  document.getElementById('nextExamTitle').innerText = currentExamTitle;
  document.getElementById('nextExamDate').innerText = currentExamDate;
  alert('Даты экзаменов успешно опубликованы для всех учеников БИЛ!');
}

function handleCSVUpload() {
  const fileInput = document.getElementById('csvFileInput');
  if (!fileInput.files.length) {
    alert('Пожалуйста, выберите CSV-файл с баллами!');
    return;
  }
  
  // Симуляция успешной обработки CSV файла
  alert('Файл ведомости успешно обработан! Общий рейтинг БИЛ обновлен.');
  globalRating[2].score = 91.5;
  renderRatingTable();
}

// NAVIGATION
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  if (element) element.classList.add('active');
}

// CHART
function initChart() {
  const ctx = document.getElementById('btsChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: studentBtsHistory.map(i => i.name),
      datasets: [{
        label: 'Твой балл БТС',
        data: studentBtsHistory.map(i => i.score),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true }
  });
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  document.getElementById('themeBtn').innerText = next === 'light' ? '🌙' : '☀️';
}

function exportPDF() {
  const element = document.getElementById('dashboard');
  html2pdf().set({ margin: 0.5, filename: 'BIL_Analytics_Report.pdf' }).from(element).save();
}
