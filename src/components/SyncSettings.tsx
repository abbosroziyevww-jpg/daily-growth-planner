import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AlertTriangle, Check, Cloud, CloudOff, LogIn, LogOut, RefreshCw, UserPlus } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { SyncStatus, SyncStrategy } from '../utils/cloudSync'

interface SyncSettingsProps {
  status: SyncStatus
  lastSyncedAt: string | null
  message: string | null
  onSync: (strategy?: SyncStrategy) => Promise<void>
}

const statusInfo: Record<SyncStatus, { label: string; color: string; icon: typeof Cloud }> = {
  local: { label: 'Сохранено локально', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', icon: Check },
  cloud: { label: 'Сохранено в облаке', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', icon: Cloud },
  offline: { label: 'Нет интернета', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', icon: CloudOff },
  conflict: { label: 'Есть конфликт данных', color: 'text-red-600 bg-red-50 dark:bg-red-950/30', icon: AlertTriangle },
  syncing: { label: 'Синхронизация…', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30', icon: RefreshCw },
  error: { label: 'Ошибка синхронизации', color: 'text-red-600 bg-red-50 dark:bg-red-950/30', icon: AlertTriangle },
  not_configured: { label: 'Supabase не настроен', color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800', icon: CloudOff },
  signed_out: { label: 'Войдите для синхронизации', color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800', icon: CloudOff },
}

export function SyncSettings({ status, lastSyncedAt, message, onSync }: SyncSettingsProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  const authenticate = async (mode: 'login' | 'signup', event?: { preventDefault(): void }) => {
    event?.preventDefault()
    if (!supabase) return
    setBusy(true)
    setFormMessage(null)
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password })
    setBusy(false)
    if (result.error) {
      setFormMessage(result.error.message)
      return
    }
    setFormMessage(mode === 'signup' && !result.data.session ? 'Проверьте почту и подтвердите регистрацию.' : 'Вход выполнен. Запускаю синхронизацию…')
    if (result.data.session) await onSync()
  }

  const signOut = async () => {
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    setBusy(false)
    setFormMessage(error ? error.message : 'Вы вышли из аккаунта. Локальные данные сохранены.')
  }

  const info = statusInfo[status]
  const StatusIcon = info.icon

  if (!isSupabaseConfigured) return <div className="card border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20"><CloudOff className="text-amber-600"/><h2 className="mt-5 text-xl font-bold">Supabase ещё не настроен</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в файл `.env`, затем перезапустите приложение. Подробная инструкция находится в README.</p></div>

  return <div className="space-y-4">
    <div className={`card ${info.color}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><StatusIcon className={status === 'syncing' ? 'animate-spin' : ''}/><div><p className="text-xs font-bold uppercase tracking-wider opacity-70">Статус синхронизации</p><h2 className="mt-1 text-xl font-extrabold">{info.label}</h2></div></div><button onClick={() => onSync()} disabled={!session || busy || status === 'syncing'} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"><RefreshCw size={17}/>Синхронизировать сейчас</button></div>{lastSyncedAt&&<p className="mt-4 text-xs opacity-70">Последнее облачное сохранение: {new Intl.DateTimeFormat('ru-RU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(lastSyncedAt))}</p>}{message&&<p className="mt-2 text-sm font-semibold">{message}</p>}</div>

    {status === 'conflict' && <div className="card border-red-200 dark:border-red-900"><h2 className="text-lg font-bold">Какие данные оставить?</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Обе версии сохранены и не будут перезаписаны без вашего выбора.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={() => onSync('use_cloud')} className="rounded-2xl bg-cobalt px-5 py-4 text-sm font-bold text-white">Загрузить из облака</button><button onClick={() => onSync('keep_local')} className="rounded-2xl border px-5 py-4 text-sm font-bold">Оставить это устройство</button></div></div>}

    {!session ? <form className="card" onSubmit={event => authenticate('login', event)}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-acid text-zinc-900"><LogIn size={19}/></span><div><h2 className="text-xl font-bold">Вход в аккаунт</h2><p className="text-sm text-zinc-500">Один аккаунт для Mac и iPhone</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="label">Email</span><input className="field" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@example.com"/></label><label><span className="label">Пароль</span><input className="field" type="password" autoComplete="current-password" minLength={6} required value={password} onChange={event=>setPassword(event.target.value)} placeholder="Минимум 6 символов"/></label></div>{formMessage&&<p className="mt-4 rounded-xl bg-zinc-100 p-3 text-sm dark:bg-zinc-900">{formMessage}</p>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={busy} type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"><LogIn size={17}/>Войти</button><button disabled={busy} type="button" onClick={event=>void authenticate('signup', event)} className="flex items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-sm font-bold disabled:opacity-50"><UserPlus size={17}/>Регистрация</button></div></form>
      : <div className="card"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="label">Аккаунт</p><h2 className="text-lg font-bold">{session.user.email}</h2><p className="mt-1 text-sm text-zinc-500">Облачная синхронизация активна</p></div><button onClick={signOut} disabled={busy} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold"><LogOut size={17}/>Выйти</button></div>{formMessage&&<p className="mt-4 text-sm text-zinc-500">{formMessage}</p>}</div>}

    <div className="card"><h2 className="font-bold">Как работает синхронизация</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-500"><li>• Изменения мгновенно сохраняются в LocalStorage.</li><li>• Облако обновляется автоматически после небольшой паузы.</li><li>• Без интернета приложение продолжает работать локально.</li><li>• После восстановления сети изменения отправляются в Supabase.</li><li>• JSON-резервная копия остаётся дополнительной защитой.</li></ul></div>
  </div>
}
