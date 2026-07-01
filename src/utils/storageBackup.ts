export const BACKUP_FORMAT = 'abbos-growth-planner-backup'
export const BACKUP_VERSION = 1
export const MAIN_STORAGE_KEY = 'daily-growth-planner-v1'

export interface StorageBackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  storage: Record<string, string>
}

export interface BackupSummary {
  keys: number
  bytes: number
  hasPlannerData: boolean
}

export class StorageBackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageBackupError'
  }
}

function isAppStorageKey(key: string) {
  return key === MAIN_STORAGE_KEY || key === 'dgp-theme' || key.startsWith('daily-growth-planner-') || key.startsWith('dgp-')
}

function localDateStamp(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function collectAppStorage(): Record<string, string> {
  const storage: Record<string, string> = {}
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key || !isAppStorageKey(key)) continue
    const value = localStorage.getItem(key)
    if (value !== null) storage[key] = value
  }
  return storage
}

export function createBackup(): StorageBackupFile {
  const storage = collectAppStorage()
  if (!storage[MAIN_STORAGE_KEY]) {
    throw new StorageBackupError('Данные приложения ещё не готовы для экспорта. Обновите страницу и попробуйте снова.')
  }
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), storage }
}

export function downloadBackup() {
  const backup = createBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `abbos-growth-planner-backup-${localDateStamp()}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return anchor.download
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validatePlannerData(value: unknown) {
  if (!isRecord(value) || !isRecord(value.entries)) {
    throw new StorageBackupError('Файл не содержит данные Daily Growth Planner.')
  }
}

export function parseBackup(text: string): StorageBackupFile {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new StorageBackupError('Не удалось прочитать JSON. Возможно, файл повреждён.')
  }

  if (!isRecord(value)) throw new StorageBackupError('Неверный формат резервной копии.')

  if (value.format === BACKUP_FORMAT) {
    if (typeof value.version !== 'number' || value.version > BACKUP_VERSION) {
      throw new StorageBackupError('Эта резервная копия создана более новой версией приложения.')
    }
    if (!isRecord(value.storage)) throw new StorageBackupError('В резервной копии отсутствует раздел storage.')
    const storage: Record<string, string> = {}
    for (const [key, item] of Object.entries(value.storage)) {
      if (!isAppStorageKey(key) || typeof item !== 'string') continue
      storage[key] = item
    }
    if (!storage[MAIN_STORAGE_KEY]) throw new StorageBackupError('В файле отсутствуют основные данные приложения.')
    try { validatePlannerData(JSON.parse(storage[MAIN_STORAGE_KEY])) }
    catch (error) { if (error instanceof StorageBackupError) throw error; throw new StorageBackupError('Основные данные приложения повреждены.') }
    return {
      format: BACKUP_FORMAT,
      version: value.version,
      exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString(),
      storage,
    }
  }

  // Совместимость с прежним экспортом, где AppData сохранялся напрямую.
  validatePlannerData(value)
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    storage: { [MAIN_STORAGE_KEY]: JSON.stringify(value) },
  }
}

export function restoreBackup(backup: StorageBackupFile) {
  const previous = collectAppStorage()
  try {
    clearAppStorage()
    for (const [key, value] of Object.entries(backup.storage)) {
      if (isAppStorageKey(key)) localStorage.setItem(key, value)
    }
  } catch {
    clearAppStorage()
    for (const [key, value] of Object.entries(previous)) localStorage.setItem(key, value)
    throw new StorageBackupError('Не удалось записать резервную копию. Текущие данные восстановлены.')
  }
}

export function clearAppStorage() {
  const keys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key && isAppStorageKey(key)) keys.push(key)
  }
  keys.forEach(key => localStorage.removeItem(key))
}

export function getBackupSummary(): BackupSummary {
  const storage = collectAppStorage()
  const values = Object.values(storage)
  return {
    keys: values.length,
    bytes: new Blob(values).size,
    hasPlannerData: Boolean(storage[MAIN_STORAGE_KEY]),
  }
}
