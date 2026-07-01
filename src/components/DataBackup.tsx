import { useRef, useState, type ChangeEvent } from 'react'
import { AlertTriangle, Archive, Check, DatabaseBackup, Download, FileUp, HardDrive, Trash2 } from 'lucide-react'
import {
  StorageBackupError,
  clearAppStorage,
  downloadBackup,
  getBackupSummary,
  parseBackup,
  restoreBackup,
} from '../utils/storageBackup'

type Notice = { type: 'success' | 'error'; text: string } | null

export function DataBackup() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  const summary = getBackupSummary()

  const exportData = () => {
    try {
      const filename = downloadBackup()
      setNotice({ type: 'success', text: `Файл ${filename} создан.` })
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось экспортировать данные.' })
    }
  }

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      setNotice({ type: 'error', text: 'Выберите файл резервной копии в формате JSON.' })
      return
    }
    setBusy(true)
    try {
      const backup = parseBackup(await file.text())
      if (!window.confirm('Импорт заменит текущие данные. Продолжить?')) return
      restoreBackup(backup)
      setNotice({ type: 'success', text: 'Данные импортированы. Приложение обновляется…' })
      window.setTimeout(() => window.location.reload(), 350)
    } catch (error) {
      const message = error instanceof StorageBackupError || error instanceof Error ? error.message : 'Не удалось импортировать данные.'
      setNotice({ type: 'error', text: message })
    } finally {
      setBusy(false)
    }
  }

  const clearData = () => {
    if (!window.confirm('Это удалит все данные приложения на этом устройстве. Продолжить?')) return
    try {
      clearAppStorage()
      setNotice({ type: 'success', text: 'Данные удалены. Приложение обновляется…' })
      window.setTimeout(() => window.location.reload(), 350)
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось очистить данные.' })
    }
  }

  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="card"><HardDrive className="text-cobalt"/><p className="mt-5 text-2xl font-extrabold">{summary.keys}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">ключей приложения</p></div>
      <div className="card"><Archive className="text-purple-500"/><p className="mt-5 text-2xl font-extrabold">{formatBytes(summary.bytes)}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">размер данных</p></div>
      <div className="card"><DatabaseBackup className={summary.hasPlannerData ? 'text-emerald-500' : 'text-amber-500'}/><p className="mt-5 text-lg font-extrabold">{summary.hasPlannerData ? 'Готово' : 'Нет данных'}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">состояние хранилища</p></div>
    </div>

    <div className="card overflow-hidden bg-zinc-900 text-white dark:bg-zinc-800">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Рекомендуется перед переносом</p><h2 className="mt-2 text-2xl font-extrabold">Сделать резервную копию</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">Скачает все планы, здоровье, обучение, Skill Tree, блог, портфолио, нетворкинг и настройки одним JSON-файлом.</p></div><button onClick={exportData} disabled={busy} className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-acid px-6 py-4 text-sm font-bold text-zinc-900 transition hover:brightness-95 disabled:opacity-50"><DatabaseBackup size={19}/>Сделать копию</button></div>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <Action icon={Download} title="Экспортировать данные" text="Скачать полную JSON-копию на это устройство." onClick={exportData}/>
      <Action icon={FileUp} title="Импортировать данные" text="Выбрать JSON-файл с Mac, iPhone или другого устройства." onClick={() => inputRef.current?.click()} disabled={busy}/>
    </div>

    <input ref={inputRef} type="file" accept="application/json,.json" onChange={importData} className="hidden" aria-label="Выбрать JSON-файл резервной копии"/>

    {notice && <div className={`card flex items-start gap-3 ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'}`}>{notice.type === 'success' ? <Check className="shrink-0 text-emerald-600"/> : <AlertTriangle className="shrink-0 text-red-600"/>}<p className="text-sm font-semibold leading-6">{notice.text}</p></div>}

    <div className="card border-red-200 dark:border-red-950"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="label text-red-500">Опасная зона</p><h2 className="text-lg font-bold">Очистить данные на этом устройстве</h2><p className="mt-1 text-sm text-zinc-500">Перед очисткой рекомендуем скачать резервную копию.</p></div><button onClick={clearData} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-300 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"><Trash2 size={17}/>Очистить данные</button></div></div>

    <div className="card"><h2 className="font-bold">Как перенести данные</h2><ol className="mt-3 space-y-2 text-sm leading-6 text-zinc-500"><li><b className="mr-2 text-cobalt">1.</b>На первом устройстве нажмите «Сделать резервную копию».</li><li><b className="mr-2 text-cobalt">2.</b>Передайте JSON через AirDrop, Files, iCloud Drive или Telegram.</li><li><b className="mr-2 text-cobalt">3.</b>На втором устройстве откройте этот раздел и нажмите «Импортировать данные».</li></ol></div>
  </div>
}

function Action({ icon: Icon, title, text, onClick, disabled = false }: { icon: typeof Download; title: string; text: string; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="card flex min-h-44 flex-col items-start text-left transition hover:-translate-y-0.5 hover:border-zinc-400 disabled:opacity-50"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-acid text-zinc-900"><Icon size={19}/></span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></button>
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}
