import type { AppData } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { collectAppStorage, MAIN_STORAGE_KEY } from './storageBackup'

const SYNC_META_KEY = 'dgp-cloud-sync-meta-v1'
const DEVICE_ID_KEY = 'dgp-cloud-device-id-v1'

export type SyncStatus = 'local' | 'cloud' | 'offline' | 'conflict' | 'syncing' | 'error' | 'not_configured' | 'signed_out'
export type SyncStrategy = 'auto' | 'use_cloud' | 'keep_local'

export interface CloudSyncMeta {
  deviceId: string
  localUpdatedAt: string | null
  cloudUpdatedAt: string | null
  lastSyncedAt: string | null
  dirty: boolean
}

export interface CloudSyncResult {
  status: SyncStatus
  data?: AppData
  syncedAt?: string
  message?: string
}

interface CloudRow {
  user_id: string
  data: unknown
  data_version: number
  device_id: string | null
  updated_at: string
}

interface CloudPayload {
  appData: AppData
  storage: Record<string, string>
}

function isCloudPayload(value: unknown): value is CloudPayload {
  if (typeof value !== 'object' || value === null || !('appData' in value) || !('storage' in value)) return false
  const payload = value as Partial<CloudPayload>
  return typeof payload.appData === 'object' && payload.appData !== null && typeof payload.storage === 'object' && payload.storage !== null
}

function cloudAppData(row: CloudRow) {
  return isCloudPayload(row.data) ? row.data.appData : row.data as AppData
}

function restoreAuxiliaryStorage(row: CloudRow) {
  if (!isCloudPayload(row.data)) return
  for (const [key, value] of Object.entries(row.data.storage)) {
    if (key !== MAIN_STORAGE_KEY && typeof value === 'string') localStorage.setItem(key, value)
  }
}

function createDeviceId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = createDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function getCloudSyncMeta(): CloudSyncMeta {
  const deviceId = getDeviceId()
  try {
    const parsed = JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}') as Partial<CloudSyncMeta>
    return {
      deviceId,
      localUpdatedAt: parsed.localUpdatedAt ?? null,
      cloudUpdatedAt: parsed.cloudUpdatedAt ?? null,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      dirty: parsed.dirty ?? false,
    }
  } catch {
    return { deviceId, localUpdatedAt: null, cloudUpdatedAt: null, lastSyncedAt: null, dirty: false }
  }
}

function saveMeta(meta: CloudSyncMeta) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta))
}

export function markLocalChange() {
  const meta = getCloudSyncMeta()
  saveMeta({ ...meta, localUpdatedAt: new Date().toISOString(), dirty: true })
}

function markSynced(cloudUpdatedAt: string) {
  const meta = getCloudSyncMeta()
  saveMeta({ ...meta, cloudUpdatedAt, lastSyncedAt: new Date().toISOString(), dirty: false })
}

function hasMeaningfulData(data: AppData) {
  return Boolean(
    Object.keys(data.entries).length ||
    Object.keys(data.healthEntries).length ||
    Object.keys(data.eveningReviews).length ||
    Object.values(data.skillProgress).some(item => item.practices > 0) ||
    data.publishedPosts.length ||
    data.portfolioProjects.length ||
    data.networkingActions.length,
  )
}

async function currentUserId() {
  if (!supabase) return null
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.user.id ?? null
}

async function readCloudRow(userId: string): Promise<CloudRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('user_data').select('user_id,data,data_version,device_id,updated_at').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data as CloudRow | null
}

async function writeCloudRow(userId: string, data: AppData) {
  if (!supabase) throw new Error('Supabase не настроен.')
  const updatedAt = new Date().toISOString()
  const { error } = await supabase.from('user_data').upsert({
    user_id: userId,
    data: { appData: data, storage: collectAppStorage() } satisfies CloudPayload,
    data_version: 2,
    device_id: getDeviceId(),
    updated_at: updatedAt,
  }, { onConflict: 'user_id' })
  if (error) throw error
  markSynced(updatedAt)
  return updatedAt
}

export async function syncAppData(localData: AppData, strategy: SyncStrategy = 'auto'): Promise<CloudSyncResult> {
  if (!isSupabaseConfigured || !supabase) return { status: 'not_configured' }
  if (!navigator.onLine) return { status: 'offline' }

  try {
    const userId = await currentUserId()
    if (!userId) return { status: 'signed_out' }
    const cloud = await readCloudRow(userId)

    if (strategy === 'use_cloud') {
      if (!cloud) return { status: 'error', message: 'В облаке пока нет сохранённых данных.' }
      restoreAuxiliaryStorage(cloud)
      markSynced(cloud.updated_at)
      return { status: 'cloud', data: cloudAppData(cloud), syncedAt: cloud.updated_at }
    }

    if (strategy === 'keep_local' || !cloud) {
      const syncedAt = await writeCloudRow(userId, localData)
      return { status: 'cloud', syncedAt }
    }

    const meta = getCloudSyncMeta()
    const lastSynced = meta.lastSyncedAt ? Date.parse(meta.lastSyncedAt) : 0
    const cloudChanged = Date.parse(cloud.updated_at) > lastSynced + 500
    const localChanged = meta.dirty
    const anotherDevice = Boolean(cloud.device_id && cloud.device_id !== meta.deviceId)

    if (localChanged && cloudChanged && anotherDevice && hasMeaningfulData(localData)) {
      return { status: 'conflict', syncedAt: cloud.updated_at, message: 'На этом устройстве и в облаке есть несинхронизированные изменения.' }
    }

    if (cloudChanged && (!localChanged || !hasMeaningfulData(localData))) {
      restoreAuxiliaryStorage(cloud)
      markSynced(cloud.updated_at)
      return { status: 'cloud', data: cloudAppData(cloud), syncedAt: cloud.updated_at }
    }

    if (localChanged) {
      const syncedAt = await writeCloudRow(userId, localData)
      return { status: 'cloud', syncedAt }
    }

    markSynced(cloud.updated_at)
    return { status: 'cloud', syncedAt: cloud.updated_at }
  } catch (error) {
    return { status: navigator.onLine ? 'error' : 'offline', message: error instanceof Error ? error.message : 'Ошибка облачной синхронизации.' }
  }
}
