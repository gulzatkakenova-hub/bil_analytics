// Настройки подключения к Supabase.
// Supabase → Project Settings → API (или «Connect»):
//   SUPABASE_URL      — «Project URL», вида https://xxxxxxxx.supabase.co
//   SUPABASE_ANON_KEY — ключ «anon / public» (или «publishable»)
//
// Этот ключ можно хранить в репозитории: он публичный, а данные защищены правилами RLS из supabase.sql.
// НИКОГДА не вставляйте сюда ключ «service_role» / «secret»: он открывает доступ ко всей базе.
//
// Пока поля пустые, сайт работает в демо-режиме (данные только в браузере).
window.BIL_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: ''
};
