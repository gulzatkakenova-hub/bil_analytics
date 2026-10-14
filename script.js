'use strict';

(function () {
  /* ============ Режим работы: Supabase или демо ============ */
  const CFG = window.BIL_CONFIG || {};
  const SB_URL = String(CFG.SUPABASE_URL || '').trim();
  const SB_KEY = String(CFG.SUPABASE_ANON_KEY || '').trim();

  let MODE = 'demo'; // 'demo' | 'supabase' | 'broken'
  let BROKEN_MSG = '';
  let sb = null;

  // Проверка config.js: понятные подсказки вместо загадочных ошибок
  function jwtRole(token) {
    try {
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(part)).role || '';
    } catch (e) {
      return '';
    }
  }

  function checkConfig() {
    if (!/^https:\/\/[a-z0-9-]+\.[a-z0-9.-]+\/?$/i.test(SB_URL)) {
      const looksLikeKey = /^(sb_|eyJ)/.test(SB_URL);
      return '⚠️ В config.js в поле SUPABASE_URL ' + (looksLikeKey ? 'указан ключ, а нужен адрес проекта' : 'неверный адрес') +
        ' вида https://xxxxxxxx.supabase.co (Supabase → Project Settings → API → Project URL).';
    }
    if (/^https?:\/\//i.test(SB_KEY)) {
      return '⚠️ В config.js в поле SUPABASE_ANON_KEY указан адрес, а нужен ключ (Publishable key или anon public).';
    }
    if (/^sb_secret_/.test(SB_KEY) || jwtRole(SB_KEY) === 'service_role') {
      return '⚠️ В config.js указан СЕКРЕТНЫЙ ключ. Он не должен быть на сайте: замените его на Publishable key или anon public.';
    }
    return '';
  }

  if (SB_URL && SB_KEY) {
    BROKEN_MSG = checkConfig();
    if (BROKEN_MSG) {
      MODE = 'broken';
    } else if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        sb = window.supabase.createClient(SB_URL, SB_KEY);
        MODE = 'supabase';
      } catch (e) {
        MODE = 'broken';
        BROKEN_MSG = '⚠️ Не удалось подключиться к Supabase: проверьте SUPABASE_URL и ключ в config.js.';
      }
    } else {
      MODE = 'broken';
      BROKEN_MSG = '⚠️ Не удалось загрузить библиотеку Supabase. Проверьте интернет, отключите блокировщик рекламы и обновите страницу (Ctrl+F5).';
    }
  }
  const IS_DEMO = MODE === 'demo';

  /* ============ Константы и демо-данные ============ */
  const STORE_KEY = 'bil_analytics_v2';
  const TAB_IDS = ['dashboard', 'bts', 'rating', 'admin'];

  const DEFAULT_EXAM = { title: 'БТС-3 (Официальный)', date: '2027-01-15' };

  const DEFAULT_TOPICS = [
    { id: 'chem-sn', subject: 'Химия', topic: 'Нуклеофильное замещение (Haloalkanes)', score: 42, recommendation: 'Пройди карточки Anki по механизмам SN1/SN2 реакций.' },
    { id: 'math-stereo', subject: 'Математика', topic: 'Стереометрия & Вероятность', score: 58, recommendation: 'Реши 5 олимпиадных задач КБО 2024–2025 гг.' },
    { id: 'bio-dna', subject: 'Биология', topic: 'Генетические матрицы & ДНК', score: 65, recommendation: 'Повтори тему Репликация ДНК из учебника CLIL.' },
    { id: 'geo-gis', subject: 'ЕНТ География', topic: 'ГИС & Пространственный анализ', score: 71, recommendation: 'Просмотри видеоурок по определению топографических масштабов.' }
  ];

  const DEMO_HISTORY = [
    { name: 'БТС-1', score: 78 },
    { name: 'БТС-2', score: 82 },
    { name: 'БТС-3', score: 88.5 }
  ];

  const DEMO_RATING = [
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
  const DEMO_TOTAL = 1200;

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

  const ISO_RE = /^\d{4}-\d{2}-\d{2}/;

  function parseLocalDate(iso) {
    const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function isValidIso(iso) {
    if (typeof iso !== 'string' || !ISO_RE.test(iso)) return false;
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
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

  /* ============ Локальное хранилище (демо-режим, тема) ============ */
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
    return { title: exam.title.slice(0, 80), date: exam.date.slice(0, 10) };
  }

  /* ============ Состояние ============ */
  const saved = readStore();
  const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const state = {
    loggedIn: IS_DEMO && Boolean(saved.session),
    role: IS_DEMO && saved.session && saved.session.role === 'admin' ? 'admin' : 'student',
    pickedRole: 'student',
    authTab: 'login',
    user: null,
    profile: { name: '', email: '', school: '', grade: '' },
    exam: IS_DEMO ? (sanitizeExam(saved.exam) || Object.assign({}, DEFAULT_EXAM)) : null,
    topics: IS_DEMO ? (sanitizeTopics(saved.topics) || DEFAULT_TOPICS.map((t) => Object.assign({}, t))) : [],
    history: [],
    rating: [],
    total: 0,
    theme: saved.theme === 'dark' || saved.theme === 'light' ? saved.theme : (prefersDark ? 'dark' : 'light'),
    ratingQuery: '',
    ratingSchool: '',
    chart: null
  };

  function loadDemoData() {
    state.history = DEMO_HISTORY.map((x) => Object.assign({}, x));
    state.rating = DEMO_RATING.map((x) => Object.assign({}, x));
    state.total = DEMO_TOTAL;
  }

  function resetData() {
    state.user = null;
    state.role = 'student';
    state.profile = { name: '', email: '', school: '', grade: '' };
    state.exam = null;
    state.topics = [];
    state.history = [];
    state.rating = [];
    state.total = 0;
    state.ratingQuery = '';
    state.ratingSchool = '';
    const search = $('#ratingSearch');
    if (search) search.value = '';
  }

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
    }, 4500);
  }

  function persistOrWarn(patch) {
    if (!IS_DEMO) return;
    if (!writeStore(patch)) {
      toast('Не удалось сохранить: браузер блокирует хранилище (приватный режим?).', 'error');
    }
  }

  function dbError(error) {
    const msg = String((error && error.message) || '');
    if ((error && error.code === '42501') || /row-level security|permission denied/i.test(msg)) {
      return '❌ Нет прав на это действие.';
    }
    if (/fetch|network|failed to/i.test(msg)) return 'Нет связи с сервером. Проверьте интернет.';
    return 'Ошибка базы данных: ' + (msg || 'неизвестная ошибка');
  }

  function setBusy(btn, busy, busyLabel) {
    if (!btn) return;
    if (busy) {
      btn.dataset.label = btn.textContent;
      btn.textContent = busyLabel || '⏳ Подождите…';
    } else if (btn.dataset.label !== undefined) {
      btn.textContent = btn.dataset.label;
    }
    btn.disabled = busy;
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

  /* ============ Окно входа ============ */
  function setPickedRole(role) {
    state.pickedRole = role === 'admin' ? 'admin' : 'student';
    const admin = state.pickedRole === 'admin';
    $('#roleStudentBtn').classList.toggle('active', !admin);
    $('#roleAdminBtn').classList.toggle('active', admin);
    $('#roleStudentBtn').setAttribute('aria-checked', String(!admin));
    $('#roleAdminBtn').setAttribute('aria-checked', String(admin));
    $('#loginEmail').value = admin ? 'admin@bil.edu.kz' : 'student@bil.edu.kz';
  }

  function setAuthTab(tab) {
    state.authTab = tab === 'register' ? 'register' : 'login';
    const reg = state.authTab === 'register';
    $('#tabLogin').classList.toggle('active', !reg);
    $('#tabRegister').classList.toggle('active', reg);
    $$('.register-only').forEach((el) => { el.hidden = !reg; });
    $('#authSubmit').textContent = reg ? 'Создать аккаунт' : 'Войти';
    $('#authPassword').setAttribute('autocomplete', reg ? 'new-password' : 'current-password');
    $('#authDesc').textContent = reg
      ? 'Создайте аккаунт ученика. Роль администратора выдаёт координатор.'
      : 'Войдите по email и паролю.';
    showAuthMessage('', '');
  }

  function showAuthMessage(kind, text) {
    const err = $('#authError');
    const info = $('#authInfo');
    err.hidden = kind !== 'error' || !text;
    info.hidden = kind !== 'info' || !text;
    if (kind === 'error') err.textContent = text;
    if (kind === 'info') info.textContent = text;
  }

  function openAuth() {
    $('#cancelAuthBtn').hidden = !(IS_DEMO && state.loggedIn);
    $('#authModal').classList.add('active');
    $('#reportArea').inert = true;
    // В боевом режиме до входа содержимое под окном скрыто полностью
    $('#reportArea').classList.toggle('locked', !IS_DEMO && !state.loggedIn);
    if (IS_DEMO) {
      setPickedRole(state.role);
      const active = $('.role-btn.active');
      if (active) active.focus();
    } else if (MODE === 'supabase') {
      const email = $('#authEmail');
      if (email) email.focus();
    }
  }

  function closeAuth() {
    $('#authModal').classList.remove('active');
    $('#reportArea').inert = false;
    $('#reportArea').classList.remove('locked');
  }

  function configureForMode() {
    $('#authDemo').hidden = MODE !== 'demo';
    $('#authForm').hidden = MODE !== 'supabase';
    $$('.demo-only').forEach((el) => { el.hidden = !IS_DEMO; });
    $$('.sb-only').forEach((el) => { el.hidden = IS_DEMO; });

    const label = $('.logout-label');
    const logout = $('#logoutBtn');
    if (IS_DEMO) {
      label.textContent = 'Сменить аккаунт';
      logout.setAttribute('aria-label', 'Сменить аккаунт');
      $('#authTitle').textContent = '🔐 Авторизация BIL Analytics';
    } else {
      label.textContent = 'Выйти';
      logout.setAttribute('aria-label', 'Выйти из аккаунта');
      $('#authTitle').textContent = '🔐 Вход в BIL Analytics';
      $('#ratingHint').textContent = 'Рейтинг строится по последнему результату БТС среди зарегистрированных учеников.';
    }

    if (MODE === 'broken') {
      $('#authDesc').textContent = BROKEN_MSG;
    } else if (MODE === 'supabase') {
      setAuthTab('login');
    }
  }

  /* ============ Роли и права ============ */
  function requireAdmin() {
    if (state.role !== 'admin') {
      toast('❌ Нет доступа: это действие только для администрации БИЛ.', 'error');
      return false;
    }
    return true;
  }

  function applyDemoSession() {
    const admin = state.role === 'admin';
    state.profile = {
      name: admin ? 'Учитель / Админ' : 'Ученик',
      email: admin ? 'admin@bil.edu.kz' : 'student@bil.edu.kz',
      school: 'BIL / КТЛ',
      grade: '10'
    };
    renderAll();
  }

  function loginDemo() {
    state.role = state.pickedRole;
    state.loggedIn = true;
    writeStore({ session: { role: state.role } });
    closeAuth();
    applyDemoSession();
    switchTab(state.role === 'admin' ? 'admin' : 'dashboard');
    toast(state.role === 'admin' ? 'Вы вошли как администратор' : 'Вы вошли как ученик', 'success');
  }

  /* ============ Supabase: вход, регистрация, загрузка данных ============ */
  function authMessage(err) {
    const m = String((err && err.message) || '').toLowerCase();
    if (m.includes('invalid login')) return 'Неверный email или пароль.';
    if (m.includes('email not confirmed')) return 'Email не подтверждён. Откройте письмо со ссылкой и попробуйте снова.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'Этот email уже зарегистрирован. Попробуйте войти.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Слишком много попыток. Подождите немного и повторите.';
    if (m.includes('password')) return 'Пароль не подошёл: используйте минимум 8 символов.';
    if (m.includes('fetch') || m.includes('network')) return 'Нет связи с сервером. Проверьте интернет.';
    return 'Не получилось: ' + ((err && err.message) || 'неизвестная ошибка');
  }

  const unwrap = (res) => {
    if (res.error) throw res.error;
    return res.data;
  };

  async function loadSupabaseData(user) {
    const [profRes, examRes, topicsRes, scoresRes, resultsRes, boardRes] = await Promise.all([
      sb.from('profiles').select('full_name,email,school,grade,role').eq('id', user.id).maybeSingle(),
      sb.from('exam_settings').select('title,exam_date').eq('id', 1).maybeSingle(),
      sb.from('topics').select('id,subject,topic,recommendation').order('id', { ascending: true }),
      sb.from('topic_scores').select('topic_id,score').eq('student_id', user.id),
      sb.from('bts_results').select('exam_name,score,taken_on').eq('student_id', user.id).order('taken_on', { ascending: true }),
      sb.rpc('get_leaderboard')
    ]);

    const prof = unwrap(profRes);
    if (!prof) throw new Error('Профиль не найден. Выполните supabase.sql и зарегистрируйтесь заново.');
    const exam = unwrap(examRes);
    const topics = unwrap(topicsRes) || [];
    const scores = unwrap(scoresRes) || [];
    const results = unwrap(resultsRes) || [];
    const board = unwrap(boardRes) || [];

    const scoreMap = new Map(scores.map((s) => [String(s.topic_id), Number(s.score)]));

    state.user = user;
    state.role = prof.role === 'admin' ? 'admin' : 'student';
    state.profile = {
      name: prof.full_name || prof.email || user.email || '',
      email: prof.email || user.email || '',
      school: prof.school || '',
      grade: prof.grade == null ? '' : String(prof.grade)
    };
    state.exam = exam && isValidIso(String(exam.exam_date)) ? { title: String(exam.title), date: String(exam.exam_date).slice(0, 10) } : null;
    state.topics = topics.map((t) => ({
      id: t.id,
      subject: String(t.subject),
      topic: String(t.topic),
      recommendation: String(t.recommendation || ''),
      score: scoreMap.has(String(t.id)) ? scoreMap.get(String(t.id)) : null
    }));
    state.history = results.map((r) => ({ name: String(r.exam_name), score: Number(r.score) }));
    state.rating = board.map((r) => ({
      rank: Number(r.place),
      name: String(r.display_name || ''),
      school: String(r.school || ''),
      score: Number(r.score),
      me: Boolean(r.is_me)
    }));
    state.total = state.rating.length;
  }

  async function enterApp(user, fromSession) {
    try {
      await loadSupabaseData(user);
    } catch (err) {
      try { await sb.auth.signOut(); } catch (e) { /* игнорируем */ }
      resetData();
      renderAll();
      openAuth();
      showAuthMessage('error', 'Не удалось загрузить данные: ' + ((err && err.message) || 'ошибка'));
      return false;
    }
    state.loggedIn = true;
    closeAuth();
    renderAll();
    const hash = location.hash.slice(1);
    const wanted = fromSession && TAB_IDS.includes(hash) ? hash : (state.role === 'admin' ? 'admin' : 'dashboard');
    switchTab(wanted, { silent: Boolean(fromSession) });
    if (!fromSession) toast(state.role === 'admin' ? 'Вы вошли как администратор' : 'Добро пожаловать!', 'success');
    return true;
  }

  async function onAuthSubmit(e) {
    e.preventDefault();
    showAuthMessage('', '');

    const email = $('#authEmail').value.trim();
    const password = $('#authPassword').value;
    const register = state.authTab === 'register';

    if (!/^\S+@\S+\.\S+$/.test(email)) return showAuthMessage('error', 'Введите корректный email.');
    if (register && password.length < 8) return showAuthMessage('error', 'Пароль должен быть не короче 8 символов.');
    if (!register && !password) return showAuthMessage('error', 'Введите пароль.');

    let meta = null;
    if (register) {
      const fullName = $('#regName').value.trim();
      const school = $('#regSchool').value.trim();
      const grade = Number($('#regGrade').value);
      if (fullName.length < 2) return showAuthMessage('error', 'Укажите имя и фамилию.');
      if (!school) return showAuthMessage('error', 'Укажите лицей.');
      if (!Number.isInteger(grade) || grade < 1 || grade > 12) return showAuthMessage('error', 'Класс — число от 1 до 12.');
      meta = { full_name: fullName, school, grade };
    }

    const btn = $('#authSubmit');
    setBusy(btn, true, '⏳ Подождите…');
    try {
      if (register) {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: meta } });
        if (error) return showAuthMessage('error', authMessage(error));
        if (data && data.session) {
          await enterApp(data.session.user || data.user, false);
        } else {
          setAuthTab('login');
          $('#authEmail').value = email;
          $('#authPassword').value = '';
          showAuthMessage('info', `Мы отправили письмо на ${email}. Подтвердите email по ссылке, затем войдите.`);
        }
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) return showAuthMessage('error', authMessage(error));
        $('#authPassword').value = '';
        await enterApp(data.user || (data.session && data.session.user), false);
      }
    } catch (err) {
      showAuthMessage('error', authMessage(err));
    } finally {
      setBusy(btn, false);
    }
  }

  function afterSignOut() {
    state.loggedIn = false;
    resetData();
    renderAll();
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* не критично */ }
    switchTab('dashboard', { silent: true });
    if (MODE === 'supabase') {
      $('#authPassword').value = '';
      setAuthTab('login');
    }
    openAuth();
  }

  async function logout() {
    if (IS_DEMO) return openAuth();
    try {
      await sb.auth.signOut();
    } catch (e) {
      toast('Не удалось выйти: ' + ((e && e.message) || 'ошибка'), 'error');
    }
    if (state.loggedIn) afterSignOut();
  }

  async function bootSupabase() {
    $('#authForm').hidden = true;
    $('#authDesc').textContent = 'Проверяем вход…';

    sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && state.loggedIn) afterSignOut();
    });

    let user = null;
    try {
      const { data } = await sb.auth.getSession();
      user = data && data.session ? data.session.user : null;
    } catch (e) { /* считаем, что не вошли */ }

    $('#authForm').hidden = false;
    setAuthTab('login');
    if (user) {
      const ok = await enterApp(user, true);
      if (ok) return;
    } else {
      openAuth();
    }
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
  const myRow = () => state.rating.find((r) => r.me) || null;

  function topPercent() {
    const me = myRow();
    if (!me || !state.total) return null;
    return Math.max(1, Math.ceil((me.rank / state.total) * 100));
  }

  const levelOf = (score) => (score < 50 ? 'danger' : score < 70 ? 'warning' : 'success');
  const scoredTopics = () => state.topics.filter((t) => t.score != null);

  /* ============ Отрисовка ============ */
  function renderProfile() {
    const admin = state.role === 'admin';
    $('#userRoleTag').textContent = admin ? 'Администратор' : 'Ученик';
    $('#userEmailTag').textContent = state.profile.email || '—';
    $('#welcomeName').textContent = state.profile.name || 'Ученик';
    $('#profSchool').textContent = state.profile.school || '—';
    $('#profGrade').textContent = state.profile.grade || '—';
    $('#adminTabBtn').hidden = !admin;
  }

  function renderExam() {
    if (state.exam) {
      $('#nextExamTitle').textContent = state.exam.title;
      $('#nextExamDate').textContent = formatDateRu(state.exam.date);
    } else {
      $('#nextExamTitle').textContent = 'пока не назначен';
      $('#nextExamDate').textContent = '—';
    }
  }

  function renderStats() {
    const h = state.history;
    const me = myRow();
    const top = topPercent();

    $('#displayRank').innerHTML = me
      ? `#${me.rank} <span>из ${state.total.toLocaleString('ru-RU')} ${plural(state.total, 'ученик', 'ученика', 'учеников')}</span>`
      : '—';

    const delta = $('#scoreDelta');
    const avgEl = $('#avgScore');
    delta.className = 'stat-sub';
    delta.textContent = '';

    if (h.length) {
      const last = h[h.length - 1];
      $('#latestScore').innerHTML = `${num(last.score)} <span>/ 100</span>`;
      if (h.length > 1) {
        const prev = h[h.length - 2];
        const diff = last.score - prev.score;
        delta.className = 'stat-sub ' + (diff >= 0 ? 'up' : 'down');
        delta.textContent = `${diff >= 0 ? '▲ +' : '▼ −'}${num(Math.abs(diff))} к ${prev.name}`;
        const avg = h.reduce((s, x) => s + x.score, 0) / h.length;
        avgEl.textContent = `Средний за все БТС: ${num(avg)}`;
      } else {
        avgEl.textContent = '';
      }
    } else {
      $('#latestScore').textContent = '—';
      avgEl.textContent = 'Пока нет результатов БТС';
    }

    if (top == null) {
      $('#kboStatus').textContent = 'Нет данных';
      $('#kboSub').textContent = 'Появится после первого результата';
    } else {
      $('#kboStatus').textContent = top <= 5 ? 'Топер' : top <= 25 ? 'Сильный уровень' : 'В пути к вершине';
      $('#kboSub').textContent = `Топ-${top}% учеников БИЛ`;
    }
  }

  function renderBadges() {
    const h = state.history;
    const first = h[0];
    const last = h[h.length - 1];
    const best = h.length ? Math.max(...h.map((x) => x.score)) : 0;
    const top = topPercent();
    const scored = scoredTopics();
    const lowCount = scored.filter((t) => t.score < 50).length;
    const diff = h.length > 1 ? last.score - first.score : 0;

    const items = [
      {
        ico: '🚀', title: 'Рост результата',
        desc: h.length > 1 ? `${diff >= 0 ? '+' : '−'}${num(Math.abs(diff))} б. с ${first.name}` : 'Нужно 2 результата',
        ok: h.length > 1 && last.score > first.score
      },
      {
        ico: '🏆', title: 'Топ-5%',
        desc: top == null ? 'Нет данных' : `Сейчас топ-${top}%`,
        ok: top != null && top <= 5
      },
      {
        ico: '🎯', title: '90+ баллов',
        desc: !h.length ? 'Нет результатов' : best >= 90 ? `Лучший: ${num(best)}` : `Не хватает ${num(90 - best)} б.`,
        ok: best >= 90
      },
      {
        ico: '📚', title: 'Нет красных зон',
        desc: !scored.length ? 'Нет данных по темам' : lowCount === 0 ? 'Все темы от 50%' : `Ниже 50%: ${lowCount} ${plural(lowCount, 'тема', 'темы', 'тем')}`,
        ok: scored.length > 0 && lowCount === 0
      }
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
    const sorted = scoredTopics().sort((a, b) => a.score - b.score);

    if (!sorted.length) {
      list.innerHTML = '<li class="empty">Данных по темам пока нет.</li>';
      advice.innerHTML = '<li class="empty">Рекомендации появятся, когда будут оценки по темам.</li>';
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
    ).join('') || '<li class="empty">Рекомендаций пока нет.</li>';
  }

  function renderHistory() {
    const h = state.history;
    if (!h.length) {
      $('#historyList').innerHTML = '<li class="empty">Результатов БТС / КБО пока нет.</li>';
      return;
    }
    const best = Math.max(...h.map((x) => x.score));
    $('#historyList').innerHTML = h.map((x, i) => {
      const prev = h[i - 1];
      let delta = '';
      if (prev) {
        const diff = x.score - prev.score;
        delta = `<span class="history-delta ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '▲ +' : '▼ −'}${num(Math.abs(diff))}</span>`;
      }
      return `
        <li class="history-item level-${levelOf(x.score)}">
          <div class="history-top">
            <span class="history-name">${esc(x.name)}${x.score === best && h.length > 1 ? ' <span class="tag tag-best">Лучший результат</span>' : ''}</span>
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
    const rows = state.rating.filter((r) =>
      (!state.ratingSchool || r.school === state.ratingSchool) &&
      (!q || r.name.toLowerCase().includes(q) || r.school.toLowerCase().includes(q))
    );
    const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

    const nameOf = (r) => {
      if (!r.me) return r.name;
      if (IS_DEMO) return state.role === 'admin' ? 'Демо-ученик' : 'Вы';
      return `${r.name} (вы)`;
    };

    $('#ratingTableBody').innerHTML = rows.length
      ? rows.map((r) => `
        <tr class="${r.me ? 'me' : ''}">
          <td>${medal[r.rank] ? medal[r.rank] + ' ' : ''}#${r.rank}</td>
          <td>${esc(nameOf(r))}</td>
          <td>${esc(r.school || '—')}</td>
          <td>${num(r.score)}</td>
        </tr>`).join('')
      : `<tr><td colspan="4" class="empty">${state.rating.length ? 'Ничего не найдено' : 'Рейтинг пока пуст'}</td></tr>`;

    $('#ratingCount').textContent = `Показано: ${rows.length} из ${state.rating.length}`;
  }

  function fillSchoolFilter() {
    const sel = $('#ratingSchool');
    const schools = Array.from(new Set(state.rating.map((r) => r.school).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));
    sel.innerHTML = '<option value="">Все лицеи</option>' +
      schools.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
    if (schools.includes(state.ratingSchool)) sel.value = state.ratingSchool;
    else state.ratingSchool = '';
  }

  function renderAdminTopics() {
    const ul = $('#adminTopicsList');
    if (!state.topics.length) {
      ul.innerHTML = '<li class="empty">Список пуст. Добавьте тему' + (IS_DEMO ? ' или сбросьте к исходным.' : '.') + '</li>';
      return;
    }
    ul.innerHTML = state.topics.map((t) => `
      <li class="${t.score != null ? 'level-' + levelOf(t.score) : ''}">
        <span class="tag">${esc(t.subject)}</span>
        <span class="topic-name">${esc(t.topic)}</span>
        ${t.score != null ? `<span class="score-pill">${t.score}%</span>` : ''}
        <button type="button" class="icon-btn" data-del="${esc(t.id)}" aria-label="Удалить тему: ${esc(t.topic)}">🗑</button>
      </li>`).join('');
  }

  function renderTopicViews() {
    renderTopics();
    renderBadges();
    renderAdminTopics();
  }

  function renderAll() {
    renderProfile();
    renderExam();
    renderStats();
    renderHistory();
    fillSchoolFilter();
    renderRating();
    renderTopicViews();
    buildChart();
    tickCountdown();
  }

  function prefillAdmin() {
    $('#adminExamTitle').value = state.exam ? state.exam.title : '';
    $('#adminExamDate').value = state.exam ? state.exam.date : '';
    $('#adminExamDate').min = todayIso();
  }

  /* ============ Таймер до экзамена ============ */
  function tickCountdown() {
    const units = $('#timerUnits');
    const done = $('#timerDone');

    if (!state.exam) {
      units.hidden = true;
      done.hidden = false;
      done.textContent = 'Дата пока не назначена';
      return;
    }

    const target = parseLocalDate(state.exam.date).getTime();
    const now = Date.now();
    const diff = target - now;

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

    if (state.chart) { state.chart.destroy(); state.chart = null; }

    const h = state.history;
    if (!h.length) {
      canvas.hidden = true;
      note.hidden = false;
      note.textContent = 'График появится после первого результата БТС.';
      return;
    }

    const summary = h.map((x) => `${x.name}: ${num(x.score)}`).join(', ');
    canvas.setAttribute('aria-label', `График результатов БТС. ${summary}.`);

    if (typeof Chart === 'undefined') {
      canvas.hidden = true;
      note.hidden = false;
      note.textContent = `График не загрузился (проверьте интернет). Результаты: ${summary}.`;
      return;
    }

    canvas.hidden = false;
    note.hidden = true;

    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue('--primary').trim() || '#4f46e5';
    const muted = css.getPropertyValue('--text-muted').trim() || '#6b7280';
    const grid = css.getPropertyValue('--border-color').trim() || '#e5e7eb';

    state.chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: h.map((x) => x.name),
        datasets: [{
          label: 'Балл БТС',
          data: h.map((x) => x.score),
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
  async function onExamSubmit(e) {
    e.preventDefault();
    if (!requireAdmin()) return;

    const title = $('#adminExamTitle').value.trim();
    const date = $('#adminExamDate').value;

    if (!title) return toast('Укажите название экзамена.', 'error');
    if (!isValidIso(date)) return toast('Выберите дату проведения.', 'error');
    if (date < todayIso()) return toast('Эта дата уже прошла. Выберите сегодняшний или будущий день.', 'error');

    const next = { title: title.slice(0, 80), date };

    if (!IS_DEMO) {
      const btn = e.submitter || $('#examForm button[type=submit]');
      setBusy(btn, true, '⏳ Сохраняю…');
      try {
        const { error } = await sb.from('exam_settings').upsert({
          id: 1, title: next.title, exam_date: next.date, updated_at: new Date().toISOString()
        });
        if (error) return toast(dbError(error), 'error');
      } catch (err) {
        return toast(dbError(err), 'error');
      } finally {
        setBusy(btn, false);
      }
    }

    state.exam = next;
    persistOrWarn({ exam: state.exam });
    renderExam();
    tickCountdown();
    toast(IS_DEMO ? '✅ Дата экзамена сохранена в этом браузере.' : '✅ Дата экзамена опубликована для всех учеников.', 'success');
  }

  async function onTopicSubmit(e) {
    e.preventDefault();
    if (!requireAdmin()) return;

    const form = e.target;
    const subject = $('#newSubjectInput').value.trim();
    const topic = $('#newTopicInput').value.trim();
    const scoreRaw = $('#newScoreInput').value.trim();
    const rec = $('#newRecInput').value.trim();
    const score = scoreRaw === '' ? 50 : Number(scoreRaw);

    if (!subject || !topic) return toast('Заполните предмет и тему.', 'error');
    if (IS_DEMO && (!Number.isFinite(score) || score < 0 || score > 100)) return toast('Освоение — число от 0 до 100.', 'error');

    const item = {
      id: uid(),
      subject: subject.slice(0, 60),
      topic: topic.slice(0, 120),
      score: IS_DEMO ? Math.round(score) : null,
      recommendation: (rec || (IS_DEMO ? 'Новая тема, добавленная администратором БИЛ.' : '')).slice(0, 200)
    };

    if (!IS_DEMO) {
      const btn = e.submitter || $('#topicForm button[type=submit]');
      setBusy(btn, true, '⏳ Добавляю…');
      try {
        const { data, error } = await sb.from('topics')
          .insert({ subject: item.subject, topic: item.topic, recommendation: item.recommendation })
          .select('id')
          .single();
        if (error) return toast(dbError(error), 'error');
        item.id = data.id;
      } catch (err) {
        return toast(dbError(err), 'error');
      } finally {
        setBusy(btn, false);
      }
    }

    state.topics.push(item);
    persistOrWarn({ topics: state.topics });
    renderTopicViews();
    form.reset();
    toast('✅ Тема добавлена.', 'success');
  }

  async function onAdminTopicsClick(e) {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    if (!requireAdmin()) return;
    const id = btn.dataset.del;

    if (!IS_DEMO) {
      btn.disabled = true;
      try {
        const { data, error } = await sb.from('topics').delete().eq('id', id).select('id');
        if (error) { btn.disabled = false; return toast(dbError(error), 'error'); }
        if (!data || !data.length) { btn.disabled = false; return toast('Не удалось удалить: нет прав или тема уже удалена.', 'error'); }
      } catch (err) {
        btn.disabled = false;
        return toast(dbError(err), 'error');
      }
    }

    state.topics = state.topics.filter((t) => String(t.id) !== String(id));
    persistOrWarn({ topics: state.topics });
    renderTopicViews();
    toast(IS_DEMO ? 'Тема удалена. Всё можно вернуть кнопкой «Сбросить к исходным».' : 'Тема удалена.');
  }

  function onReset() {
    if (!IS_DEMO || !requireAdmin()) return;
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
    $$('.role-btn[data-role]').forEach((b) => b.addEventListener('click', () => setPickedRole(b.dataset.role)));
    $$('.role-btn[data-auth-tab]').forEach((b) => b.addEventListener('click', () => setAuthTab(b.dataset.authTab)));
    $('#loginBtn').addEventListener('click', loginDemo);
    $('#authForm').addEventListener('submit', onAuthSubmit);
    $('#cancelAuthBtn').addEventListener('click', closeAuth);
    $('#logoutBtn').addEventListener('click', logout);
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
      if (e.key === 'Escape' && IS_DEMO && state.loggedIn && $('#authModal').classList.contains('active')) closeAuth();
    });
  }

  /* ============ Запуск ============ */
  function init() {
    applyTheme(state.theme, false);
    configureForMode();
    bindEvents();
    setInterval(tickCountdown, 1000);

    if (MODE === 'supabase') {
      renderAll();
      bootSupabase();
      return;
    }

    if (MODE === 'broken') {
      renderAll();
      openAuth();
      return;
    }

    // Демо-режим
    loadDemoData();
    applyDemoSession();
    if (state.loggedIn) closeAuth();
    else openAuth();

    const hash = location.hash.slice(1);
    switchTab(TAB_IDS.includes(hash) ? hash : 'dashboard', { silent: true });
  }

  init();
})();
