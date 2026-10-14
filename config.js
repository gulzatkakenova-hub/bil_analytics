// Настройки подключения к Supabase.
// Supabase → Project Settings → API Keys (или кнопка «Connect» вверху проекта):
//
//   SUPABASE_URL      — «Project URL», вида https://xxxxxxxx.supabase.co
//   SUPABASE_ANON_KEY — ключ «Publishable key», он начинается с  sb_publishable_
//                       (если такого нет: вкладка «Legacy API keys» → ключ «anon public», он начинается с eyJ)
//
// ⚠️ НИКОГДА не вставляйте сюда ключ, который начинается с  sb_secret_  или называется «service_role»!
//    Он открывает доступ ко всей базе в обход всех правил. GitHub такие ключи блокирует.
//    Publishable / anon можно хранить в репозитории: данные защищены правилами RLS из supabase.sql.
//
// Пока поля пустые, сайт работает в демо-режиме (данные только в браузере).
window.BIL_CONFIG = {
  SUPABASE_URL: 'https://aismxrugcrqjqdlwhmtm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc214cnVnY3JxanFkbHdobXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MzgxNzcsImV4cCI6MjEwNzUxNDE3N30.xNm6EokLAUVIgb2WxE-_rkNweUGD6ZheQBRcBO6OUEY'
}
