let currentUserRole = 'student'; // 'student' или 'admin'
let currentExamDate = '2027-01-15';
let currentExamTitle = 'БТС-3 (Официальный)';

let bilTopicsMastery = [
  { subject: 'Химия', topic: 'Нуклеофильное замещение (Haloalkanes)', score: 42, recommendation: 'Пройди карточки Anki по механизмам SN1/SN2 реакций.' },
  { subject: 'Математика', topic: 'Стереометрия & Вероятность', score: 58, recommendation: 'Реши 5 олимпиадных задач КБО 2024–2025 гг.' },
  { subject: 'Биология', topic: 'Генетические матрицы & ДНК', score: 65, recommendation: 'Повтори тему Репликация ДНК из учебника CLIL.' },
  { subject: 'ЕНТ География', topic: 'ГИС & Пространственный анализ', score: 71, recommendation: 'Просмотри видеоурок по определению топографических масштабов.' }
];

let globalRating = [
  { rank: 1, name: 'Арман С.', school: 'Астана БИЛ', score: 96.5 },
  { rank: 2, name: 'Данияр К.', school: 'Алматы БИЛ', score: 95.0 },
  { rank: 12, name: 'Вы (Ученик)', school: 'Караганда БИЛ', score: 88.5 }
];

window.onload = function() {
  renderTopicsAndRecommendations();
  renderRatingTable();
  initChart();
  startCountdown();
};

// Выбор роли в модальном окне
function selectRole(role) {
  currentUserRole = role;
  const studentBtn = document.getElementById('roleStudentBtn');
  const adminBtn = document.getElementById('roleAdminBtn');
  const emailInput = document.getElementById('loginEmail');

  if (role === 'admin') {
    studentBtn.classList.remove('active');
    adminBtn.classList.add('active');
    emailInput.value = 'admin@bil.edu.kz';
  } else {
    adminBtn.classList.remove('active');
    studentBtn.classList.add('active');
    emailInput.value = 'student@bil.edu.kz';
  }
}

// Подтверждение входа
function confirmLogin() {
  document.getElementById('authModal').style.display = 'none';
  
  const roleTag = document.getElementById('userRoleTag');
  const emailTag = document.getElementById('userEmailTag');
  const adminTabBtn = document.getElementById('adminTabBtn');
  const welcomeName = document.getElementById('welcomeName');

  if (currentUserRole === 'admin') {
    roleTag.innerText = 'Администратор';
    emailTag.innerText = 'admin@bil.edu.kz';
    welcomeName.innerText = 'Учитель / Админ';
    // Показываем кнопку админки только для Администратора
    adminTabBtn.style.display = 'block';
  } else {
    roleTag.innerText = 'Ученик';
    emailTag.innerText = 'student@bil.edu.kz';
    welcomeName.innerText = 'Ученик';
    // Скрываем админку от ученика
    adminTabBtn.style.display = 'none';
    switchTab('dashboard'); // Переключаем ученика на дашборд
  }
}

function openAuthModal() {
  document.getElementById('authModal').style.display = 'flex';
}

// ПРОВЕРКА ПРАВ: Публикация даты только администратором
function handleSetExamDate() {
  if (currentUserRole !== 'admin') {
    alert('❌ Ошибка доступа: Изменять даты экзаменов может только Администрация БИЛ!');
    return;
  }

  const title = document.getElementById('adminExamTitle').value;
  const date = document.getElementById('adminExamDate').value;

  if (!title || !date) {
    alert('Пожалуйста, укажите и название, и дату!');
    return;
  }

  currentExamTitle = title;
  currentExamDate = date;

  document.getElementById('nextExamTitle').innerText = currentExamTitle;
  document.getElementById('nextExamDate').innerText = currentExamDate;
  alert('✅ Официальная дата БТС успешно опубликована для всех учеников!');
}

// ПРОВЕРКА ПРАВ: Добавление темы администратором
function addNewTopicByAdmin() {
  if (currentUserRole !== 'admin') {
    alert('❌ Ошибка доступа: Добавлять темы спецификации может только Администратор!');
    return;
  }

  const subject = document.getElementById('newSubjectInput').value;
  const topic = document.getElementById('newTopicInput').value;

  if (!subject || !topic) {
    alert('Заполните предмет и тему!');
    return;
  }

  bilTopicsMastery.push({
    subject: subject,
    topic: topic,
    score: 50,
    recommendation: 'Новая тема, добавленная администратором БИЛ.'
  });

  renderTopicsAndRecommendations();
  alert('✅ Тема успешно добавлена в учебный план учеников!');
}

function renderTopicsAndRecommendations() {
  const topicsList = document.getElementById('weakTopicsList');
  const adviceBox = document.getElementById('aiRecommendations');

  if (!topicsList || !adviceBox) return;

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

function renderRatingTable() {
  const tbody = document.getElementById('ratingTableBody');
  if (!tbody) return;
  tbody.innerHTML = globalRating.map(row => `
    <tr ${row.rank === 12 ? 'style="font-weight:bold; background: rgba(79,70,229,0.1);"' : ''}>
      <td>#${row.rank}</td>
      <td>${row.name}</td>
      <td>${row.school}</td>
      <td>${row.score}</td>
    </tr>
  `).join('');
}

function startCountdown() {
  setInterval(() => {
    const target = new Date(currentExamDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const dElem = document.getElementById('countdownDays');
      const hElem = document.getElementById('countdownHours');
      if (dElem) dElem.innerText = days < 10 ? '0' + days : days;
      if (hElem) hElem.innerText = hours < 10 ? '0' + hours : hours;
    }
  }, 1000);
}

function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add('active');
  if (element) element.classList.add('active');
}

function initChart() {
  const ctx = document.getElementById('btsChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['БТС-1', 'БТС-2', 'БТС-3'],
      datasets: [{
        label: 'Твой балл БТС',
        data: [78, 82, 88.5],
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
