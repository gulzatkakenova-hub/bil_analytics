'use strict';

(function () {
  /* ============ Константы и демо-данные ============ */
  const STORE_KEY = 'bil_analytics_v2';
  const TOTAL_STUDENTS = 1200;
  const TAB_IDS = ['dashboard', 'bts', 'rating', 'admin'];

  const DEFAULT_EXAM = { title: 'БТС-3 (Официальный)', date: '2027-01-15' };

  const DEFAULT_TOPICS = [
    { id: 'chem-sn', subject: 'Химия', topic: 'Нуклеофильное замещение (Haloalkanes)', score: 42, recommendation: 'Пройди карточки Anki по механизмам SN1/SN2 реакций.' },
    { id: 'math-stereo', subject: 'Математика', topic: 'Стереометрия & Вероятность', score: 58, recommendation: 'Реши 5 олимпиадных задач КБО 2024–2025 гг.' },
    { id: 'bio-dna', subject: 'Биология', topic: 'Генетические матрицы & ДНК', score: 65, recommendation: 'Повтори тему Репликация ДНК из учебника CLIL.' },
    { id: 'geo-gis', subject: 'ЕНТ География', topic: 'ГИС & Пространственный анализ', score: 71, recommendation: 'Просмотри видеоурок по определению топографических масштабов.' }
  ];

  const BTS_HISTORY = [
    { name: 'БТС-1', score: 78 },
    { name: 'БТС-2', score: 82 },
    { name: 'БТС-3', score: 88.5 }
  ];

  const RATING = [
    { rank: 1, name: 'Арман С.', school: 'Астана БИЛ', score: 96.5 },
    { rank: 2, name: 'Данияр К.', school: 'Алматы БИЛ', score: 95.0 },
    { rank: 3, name: 'Аружан Т.', school: 'Шымкент БИЛ', score: 94.2 },
    { rank: 4, name: 'Мадина Б.', school: 'Астана БИЛ', score: 93.8 },
    { rank: 5, name: 'Ерасыл Н.', school: 'Актобе БИЛ', score: 92.7 },
    { rank: 6, name: 'Алия М.', school: 'Алматы БИЛ', score: 91.9 },
    { rank: 7, name: 'Тимур О.', school: 'Павлодар БИЛ', score: 91.0 },
    { rank: 8, name: 'Асель Ж.', school: 'Атырау БИЛ', score: 90.4 },
    { rank: 9, name: 'Нурсултан А.', school: 'Костанай БИЛ', score: 89.8 },
    { rank: 10, name: 'Томирис Е.', school: 'Астана БИЛ', score: 89.3 },
    { rank: 11, name: 'Адиль Р.', school: 'Шымкент БИЛ', score: 88.9 },
    { rank: 12, name: 'Вы', school: 'Караганда БИЛ', score: 88.5, me: true },
    { rank: 13, name: 'Айдана К.', school: 'Алматы БИЛ', score: 88.1 },
    { rank: 14, name: 'Санжар Д.', school: 'Актобе БИЛ', score: 87.6 }
  ];

  /* ============ Вспомогательные функции ============ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const pad2 = (n) => String(n).padStart(2, '0');
  const num = (n) => Number(n).toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function plural(n, one, few, many) {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

  function parseLocalDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function isValidIso(iso) {
    if (typeof iso !== 'string' || !ISO_RE.test(iso)) return false;
    const [y, m, d] = iso.split('-').map(Number);
    const dt = parseLocalDate(iso);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }

  function todayIso() {
    const t = new Date();
    return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
  }

  function formatDateRu(iso) {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(parseLocalDate(iso))
      .replace(/\s?г\.$/, '');
  }

  /* ============ Хранилище (localStorage с защитой от ошибок) ============ */
  function readStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(patch) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign(readStore(), patch)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function sanitizeTopics(list) {
    if (!Array.isArray(list)) return null;
    return list
      .filter((t) => t && typeof t.subject === 'string' && typeof t.topic === 'string')
      .map((t) => ({
        id: String(t.id || uid()),
        subject: t.subject.slice(0, 60),
        topic: t.topic.slice(0, 120),
        score: clamp(Math.round(Number(t.score) || 0), 0, 100),
        recommendation: String(t.recommendation || '').slice(0, 200)
      }));
  }

  function sanitizeExam(exam) {
    if (!exam || typeof exam.title !== 'string' || !isValidIso(exam.date)) return null;
    return { title: exam.title.slice(0, 80), date: exam.date };
  }

  /* ============ Состояние ============ */
  const saved = readStore();
  const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const state = {
    loggedIn: Boolean(saved.session),
    role: saved.session && saved.session.role === 'admin' ? 'admin' : 'student',
    pickedRole: 'student',
    exam: sanitizeExam(saved.exam) || Object.assign({}, DEFAULT_EXAM),
    topics: sanitizeTopics(saved.topics) || DEFAULT_TOPICS.map((t) => Object.assign({}, t)),
    theme: saved.theme === 'dark' || saved.theme === 'light' ? saved.theme : (prefersDark ? 'dark' : 'light'),
    ratingQuery: '',
    ratingSchool: '',
    chart: null
  };

  /* ============ Уведомления ============ */
  function toast(message, type = 'info') {
    const box = $('#toasts');
    if (!box) return;
    while (box.children.length >= 3) box.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }

  function persistOrWarn(patch) {
    if (!writeStore(patch)) {
      toast('Не удалось сохранить: браузер блокирует хранилище (приватный режим?).', 'error');
    }
  }

  /* ============ Тема ============ */
  function applyTheme(theme, persist) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const btn = $('#themeBtn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    }
    if (persist) writeStore({ theme });
    if (state.chart) buildChart();
  }

  /* ============ Вход и роли ============ */
  function setPickedRole(role) {
    state.pickedRole = role === 'admin' ? 'admin' : 'student';
    const admin = state.pickedRole === 'admin';
    $('#roleStudentBtn').classList.toggle('active', !admin);
    $('#roleAdminBtn').classList.toggle('active', admin);
    $('#roleStudentBtn').setAttribute('aria-checked', String(!admin));
    $('#roleAdminBtn').setAttribute('aria-checked', String(admin));
    $('#loginEmail').value = admin ? 'admin@bil.edu.kz' : 'student@bil.edu.kz';
  }

  function openAuth() {
    setPickedRole(state.role);
    $('#cancelAuthBtn').hidden = !state.loggedIn;
    $('#authModal').classList.add('active');
    $('#reportArea').inert = true;
    const active = $('.role-btn.active');
    if (active) active.focus();
  }

  function closeAuth() {
    $('#authModal').classList.remove('active');
    $('#reportArea').inert = false;
  }

  function applySession() {
    const admin = state.role === 'admin';
    $('#userRoleTag').textContent = admin ? 'Администратор' : 'Ученик';
    $('#userEmailTag').textContent = admin ? 'admin@bil.edu.kz' : 'student@bil.edu.kz';
    $('#welcomeName').textContent = admin ? 'Учитель / Админ' : 'Ученик';
    $('#adminTabBtn').hidden = !admin;
    renderRating();
  }

  function login() {
    state.role = state.pickedRole;
    state.loggedIn = true;
    writeStore({ session: { role: state.role } });
    closeAuth();
    applySession();
    switchTab(state.role === 'admin' ? 'admin' : 'dashboard');
    toast(state.role === 'admin' ? 'Вы вошли как администратор' : 'Вы вошли как ученик', 'success');
  }

  function requireAdmin() {
    if (state.role !== 'admin') {
      toast('❌ Нет доступа: это действие только для администрации БИЛ.', 'error');
      return false;
    }
    return true;
  }

  /* ============ Вкладки ============ */
  function switchTab(id, opts = {}) {
    if (!TAB_IDS.includes(id)) id = 'dashboard';
    if (id === 'admin' && state.role !== 'admin') id = 'dashboard';

    $$('.tab-content').forEach((s) => s.classList.toggle('active', s.id === id));
    $$('.nav-btn').forEach((b) => {
      const on = b.dataset.tab === id;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    if (id === 'admin') prefillAdmin();
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* не критично */ }
    if (!opts.silent) window.scrollTo(0, 0);
  }

  /* ============ Расчёты ============ */
  function topPercent() {
    const me = RATING.find((r) => r.me);
    return Math.max(1, Math.ceil((me.rank / TOTAL_STUDENTS) * 100));
  }

  const levelOf = (score) => (score < 50 ? 'danger' : score < 70 ? 'warning' : 'success');

  /* ============ Отрисовка ============ */
  function renderExam() {
    $('#nextExamTitle').textContent = state.exam.title;
    $('#nextExamDate').textContent = formatDateRu(state.exam.date);
  }

  function renderStats() {
    const last = BTS_HISTORY[BTS_HISTORY.length - 1];
    const prev = BTS_HISTORY[BTS_HISTORY.length - 2];
    const avg = BTS_HISTORY.reduce((s, x) => s + x.score, 0) / BTS_HISTORY.length;
    const me = RATING.find((r) => r.me);
    const top = topPercent();

    $('#displayRank').innerHTML = `#${me.rank} <span>из ${TOTAL_STUDENTS.toLocaleString('ru-RU')} учеников</span>`;
    $('#latestScore').innerHTML = `${num(last.score)} <span>/ 100</span>`;

    const delta = $('#scoreDelta');
    if (prev) {
      const diff = last.score - prev.score;
      delta.className = 'stat-sub ' + (diff >= 0 ? 'up' : 'down');
      delta.textContent = `${diff >= 0 ? '▲ +' : '▼ −'}${num(Math.abs(diff))} к ${prev.name}`;
    }
    $('#avgScore').textContent = `Средний за все БТС: ${num(avg)}`;

    $('#kboStatus').textContent = top <= 5 ? 'Топер' : top <= 25 ? 'Сильный уровень' : 'В пути к вершине';
    $('#kboSub').textContent = `Топ-${top}% учеников БИЛ`;
  }

  function renderBadges() {
    const first = BTS_HISTORY[0];
    const last = BTS_HISTORY[BTS_HISTORY.length - 1];
    const best = Math.max(...BTS_HISTORY.map((x) => x.score));
    const top = topPercent();
    const lowCount = state.topics.filter((t) => t.score < 50).length;
    const diff = last.score - first.score;

    const items = [
      { ico: '🚀', title: 'Рост результата', desc: `${diff >= 0 ? '+' : '−'}${num(Math.abs(diff))} б. с ${first.name}`, ok: last.score > first.score },
      { ico: '🏆', title: 'Топ-5%', desc: `Сейчас топ-${top}%`, ok: top <= 5 },
      { ico: '🎯', title: '90+ баллов', desc: best >= 90 ? `Лучший: ${num(best)}` : `Не хватает ${num(90 - best)} б.`, ok: best >= 90 },
      { ico: '📚', title: 'Нет красных зон', desc: lowCount === 0 ? 'Все темы от 50%' : `Ниже 50%: ${lowCount} ${plural(lowCount, 'тема', 'темы', 'тем')}`, ok: state.topics.length > 0 && lowCount === 0 }
    ];

    $('#badgesGrid').innerHTML = items.map((b) => `
      <div class="badge-item ${b.ok ? '' : 'locked'}">
        <span class="badge-ico" aria-hidden="true">${b.ico}</span>
        <strong>${esc(b.title)}</strong>
        <small>${esc(b.desc)}</small>
        <span class="sr-only">${b.ok ? 'Получено' : 'Пока не получено'}</span>
      </div>`).join('');
  }

  function renderTopics() {
    const list = $('#weakTopicsList');
    const advice = $('#aiRecommendations');
    const sorted = state.topics.slice().sort((a, b) => a.score - b.score);

    if (!sorted.length) {
      list.innerHTML = '<li class="empty">Темы пока не добавлены.</li>';
      advice.innerHTML = '<li class="empty">Рекомендаций пока нет.</li>';
      return;
    }

    list.innerHTML = sorted.map((t) => {
      const lvl = levelOf(t.score);
      return `
        <li class="topic-item level-${lvl}">
          <div class="topic-head">
            <span class="tag">${esc(t.subject)}</span>
            <span class="topic-name">${esc(t.topic)}</span>
            <span class="score-pill">${t.score}%</span>
          </div>
          <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${t.score}" aria-label="Освоение темы: ${esc(t.topic)}">
            <span style="--w:${t.score}%"></span>
          </div>
        </li>`;
    }).join('');

    advice.innerHTML = sorted.filter((t) => t.recommendation).map((t) => `
      <li class="advice-item level-${levelOf(t.score)}"><strong>${esc(t.subject)}:</strong> ${esc(t.recommendation)}</li>`
    ).join('');
  }

  function renderHistory() {
    const best = Math.max(...BTS_HISTORY.map((x) => x.score));
    $('#historyList').innerHTML = BTS_HISTORY.map((x, i) => {
      const prev = BTS_HISTORY[i - 1];
      let delta = '';
      if (prev) {
        const diff = x.score - prev.score;
        delta = `<span class="history-delta ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '▲ +' : '▼ −'}${num(Math.abs(diff))}</span>`;
      }
      return `
        <li class="history-item level-${levelOf(x.score)}">
          <div class="history-top">
            <span class="history-name">${esc(x.name)}${x.score === best ? ' <span class="tag tag-best">Лучший результат</span>' : ''}</span>
            <span><span class="history-score">${num(x.score)}/100</span>${delta}</span>
          </div>
          <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${x.score}" aria-label="${esc(x.name)}: ${num(x.score)} из 100">
            <span style="--w:${x.score}%"></span>
          </div>
        </li>`;
    }).join('');
  }

  function renderRating() {
    const q = state.ratingQuery.trim().toLowerCase();
    const rows = RATING.filter((r) =>
      (!state.ratingSchool || r.school === state.ratingSchool) &&
      (!q || r.name.toLowerCase().includes(q) || r.school.toLowerCase().includes(q))
    );
    const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const meName = state.role === 'admin' ? 'Демо-ученик' : 'Вы';

    $('#ratingTableBody').innerHTML = rows.length
      ? rows.map((r) => `
        <tr class="${r.me ? 'me' : ''}">
          <td>${medal[r.rank] ? medal[r.rank] + ' ' : ''}#${r.rank}</td>
          <td>${esc(r.me ? meName : r.name)}</td>
          <td>${esc(r.school)}</td>
          <td>${num(r.score)}</td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="empty">Ничего не найдено</td></tr>';

    $('#ratingCount').textContent = `Показано: ${rows.length} из ${RATING.length}`;
  }

  function fillSchoolFilter() {
    const schools = Array.from(new Set(RATING.map((r) => r.school))).sort((a, b) => a.localeCompare(b, 'ru'));
    $('#ratingSchool').innerHTML = '<option value="">Все лицеи</option>' +
      schools.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  }

  function renderAdminTopics() {
    const ul = $('#adminTopicsList');
    if (!state.topics.length) {
      ul.innerHTML = '<li class="empty">Список пуст. Добавьте тему или сбросьте к исходным.</li>';
      return;
    }
    ul.innerHTML = state.topics.map((t) => `
      <li class="level-${levelOf(t.score)}">
        <span class="tag">${esc(t.subject)}</span>
        <span class="topic-name">${esc(t.topic)}</span>
        <span class="score-pill">${t.score}%</span>
        <button type="button" class="icon-btn" data-del="${esc(t.id)}" aria-label="Удалить тему: ${esc(t.topic)}">🗑</button>
      </li>`).join('');
  }

  function renderTopicViews() {
    renderTopics();
    renderBadges();
    renderAdminTopics();
  }

  function prefillAdmin() {
    $('#adminExamTitle').value = state.exam.title;
    $('#adminExamDate').value = state.exam.date;
    $('#adminExamDate').min = todayIso();
  }

  /* ============ Таймер до экзамена ============ */
  function tickCountdown() {
    const target = parseLocalDate(state.exam.date).getTime();
    const now = Date.now();
    const diff = target - now;
    const units = $('#timerUnits');
    const done = $('#timerDone');

    if (diff <= 0) {
      units.hidden = true;
      done.hidden = false;
      done.textContent = now < target + 86400000 ? '🎯 Экзамен сегодня!' : 'Экзамен уже прошёл';
      return;
    }

    units.hidden = false;
    done.hidden = true;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    $('#cdDays').textContent = pad2(d);
    $('#cdHours').textContent = pad2(h);
    $('#cdMins').textContent = pad2(m);
    $('#cdDaysLbl').textContent = plural(d, 'день', 'дня', 'дней');
    $('#cdHoursLbl').textContent = plural(h, 'час', 'часа', 'часов');
    $('#cdMinsLbl').textContent = plural(m, 'минута', 'минуты', 'минут');
  }

  /* ============ График ============ */
  function buildChart() {
    const canvas = $('#btsChart');
    const note = $('#chartNote');
    if (!canvas) return;

    const summary = BTS_HISTORY.map((x) => `${x.name}: ${num(x.score)}`).join(', ');
    canvas.setAttribute('aria-label', `График результатов БТС. ${summary}.`);

    if (typeof Chart === 'undefined') {
      canvas.hidden = true;
      note.hidden = false;
      note.textContent = `График не загрузился (проверьте интернет). Результаты: ${summary}.`;
      return;
    }

    canvas.hidden = false;
    note.hidden = true;
    if (state.chart) state.chart.destroy();

    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue('--primary').trim() || '#4f46e5';
    const muted = css.getPropertyValue('--text-muted').trim() || '#6b7280';
    const grid = css.getPropertyValue('--border-color').trim() || '#e5e7eb';

    state.chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: BTS_HISTORY.map((x) => x.name),
        datasets: [{
          label: 'Балл БТС',
          data: BTS_HISTORY.map((x) => x.score),
          borderColor: primary,
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          pointBackgroundColor: primary,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${num(ctx.parsed.y)} / 100` } }
        },
        scales: {
          y: { suggestedMin: 50, suggestedMax: 100, ticks: { color: muted }, grid: { color: grid } },
          x: { ticks: { color: muted }, grid: { display: false } }
        }
      }
    });
  }

  /* ============ PDF ============ */
  function exportPDF() {
    if (typeof html2pdf === 'undefined') {
      toast('Не удалось загрузить модуль PDF. Проверьте интернет и обновите страницу.', 'error');
      return;
    }
    const btn = $('#pdfBtn');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Готовлю PDF…';
    document.body.classList.add('exporting');

    html2pdf()
      .set({
        margin: 0.4,
        filename: `BIL_Analytics_${todayIso()}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: getComputedStyle(document.body).backgroundColor },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from($('#dashboard'))
      .save()
      .then(() => toast('PDF-отчёт сохранён.', 'success'))
      .catch(() => toast('Не получилось создать PDF. Попробуйте ещё раз.', 'error'))
      .finally(() => {
        document.body.classList.remove('exporting');
        btn.disabled = false;
        btn.textContent = label;
      });
  }

  /* ============ Действия администратора ============ */
  function onExamSubmit(e) {
    e.preventDefault();
    if (!requireAdmin()) return;

    const title = $('#adminExamTitle').value.trim();
    const date = $('#adminExamDate').value;

    if (!title) return toast('Укажите название экзамена.', 'error');
    if (!isValidIso(date)) return toast('Выберите дату проведения.', 'error');
    if (date < todayIso()) return toast('Эта дата уже прошла. Выберите сегодняшний или будущий день.', 'error');

    state.exam = { title: title.slice(0, 80), date };
    persistOrWarn({ exam: state.exam });
    renderExam();
    tickCountdown();
    toast('✅ Дата экзамена сохранена в этом браузере.', 'success');
  }

  function onTopicSubmit(e) {
    e.preventDefault();
    if (!requireAdmin()) return;

    const subject = $('#newSubjectInput').value.trim();
    const topic = $('#newTopicInput').value.trim();
    const scoreRaw = $('#newScoreInput').value.trim();
    const rec = $('#newRecInput').value.trim();
    const score = scoreRaw === '' ? 50 : Number(scoreRaw);

    if (!subject || !topic) return toast('Заполните предмет и тему.', 'error');
    if (!Number.isFinite(score) || score < 0 || score > 100) return toast('Освоение — число от 0 до 100.', 'error');

    state.topics.push({
      id: uid(),
      subject: subject.slice(0, 60),
      topic: topic.slice(0, 120),
      score: Math.round(score),
      recommendation: (rec || 'Новая тема, добавленная администратором БИЛ.').slice(0, 200)
    });
    persistOrWarn({ topics: state.topics });
    renderTopicViews();
    e.target.reset();
    toast('✅ Тема добавлена.', 'success');
  }

  function onAdminTopicsClick(e) {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    if (!requireAdmin()) return;
    state.topics = state.topics.filter((t) => t.id !== btn.dataset.del);
    persistOrWarn({ topics: state.topics });
    renderTopicViews();
    toast('Тема удалена. Всё можно вернуть кнопкой «Сбросить к исходным».');
  }

  function onReset() {
    if (!requireAdmin()) return;
    if (!window.confirm('Вернуть дату экзамена и список тем к исходным значениям?')) return;
    state.exam = Object.assign({}, DEFAULT_EXAM);
    state.topics = DEFAULT_TOPICS.map((t) => Object.assign({}, t));
    persistOrWarn({ exam: null, topics: null });
    renderExam();
    renderTopicViews();
    prefillAdmin();
    tickCountdown();
    toast('Данные возвращены к исходным.', 'success');
  }

  /* ============ События ============ */
  function bindEvents() {
    $$('.role-btn').forEach((b) => b.addEventListener('click', () => setPickedRole(b.dataset.role)));
    $('#loginBtn').addEventListener('click', login);
    $('#cancelAuthBtn').addEventListener('click', closeAuth);
    $('#logoutBtn').addEventListener('click', openAuth);
    $('#themeBtn').addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark', true));
    $$('.nav-btn').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    $('#pdfBtn').addEventListener('click', exportPDF);

    $('#examForm').addEventListener('submit', onExamSubmit);
    $('#topicForm').addEventListener('submit', onTopicSubmit);
    $('#adminTopicsList').addEventListener('click', onAdminTopicsClick);
    $('#resetBtn').addEventListener('click', onReset);

    $('#ratingSearch').addEventListener('input', (e) => { state.ratingQuery = e.target.value; renderRating(); });
    $('#ratingSchool').addEventListener('change', (e) => { state.ratingSchool = e.target.value; renderRating(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.loggedIn && $('#authModal').classList.contains('active')) closeAuth();
    });
  }

  /* ============ Запуск ============ */
  function init() {
    applyTheme(state.theme, false);
    fillSchoolFilter();
    bindEvents();

    renderExam();
    renderStats();
    renderHistory();
    renderRating();
    renderTopicViews();
    buildChart();

    tickCountdown();
    setInterval(tickCountdown, 1000);

    if (state.loggedIn) {
      closeAuth();
    } else {
      openAuth();
    }
    applySession();

    const hash = location.hash.slice(1);
    switchTab(TAB_IDS.includes(hash) ? hash : 'dashboard', { silent: true });
  }

  init();
})();
