import { BatteryMedium, BedDouble, Cigarette, Droplets, Dumbbell, GlassWater, HeartHandshake, Utensils } from 'lucide-react'
import { blankHealthEntry } from '../data'
import type { HealthEntry } from '../types'

interface HealthTrackerProps {
  date: string
  entries: Record<string, HealthEntry>
  onChange: (patch: Partial<HealthEntry>) => void
}

const cn = (...values: Array<string | false>) => values.filter(Boolean).join(' ')

export function HealthTracker({ date, entries, onChange }: HealthTrackerProps) {
  const current = entries[date] ?? blankHealthEntry(date)
  const weekStart = new Date(`${date}T12:00:00`)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() || 7) - 1))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const trainings = Object.values(entries).filter(item => { const itemDate = new Date(`${item.date}T12:00:00`); return itemDate >= weekStart && itemDate < weekEnd && item.training }).length
  const sleepOnTime = current.sleepTime >= '21:00' || current.sleepTime <= '01:00'

  return <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card space-y-5">
        <div><p className="label">Движение и питание</p><h2 className="text-xl font-bold">База тела</h2></div>
        <Field icon={Dumbbell} label={`Тренировка сегодня · ${trainings}/3 на неделе`}><Toggle value={current.training} onChange={training => onChange({ training })}/></Field>
        <Field icon={Utensils} label={`Приёмы пищи · ${current.meals}`}><input className="w-full accent-emerald-500" type="range" min="1" max="6" value={current.meals} onChange={event => onChange({ meals: Number(event.target.value) })}/><p className="mt-2 text-xs text-zinc-500">Цель: 3–5 раз в день</p></Field>
        <Field icon={Droplets} label="Вода, литры"><input className="field" type="number" min="0" max="6" step="0.25" value={current.water} onChange={event => onChange({ water: Number(event.target.value) })}/></Field>
      </div>
      <div className="card space-y-5">
        <div><p className="label">Восстановление</p><h2 className="text-xl font-bold">Сон и энергия</h2></div>
        <Field icon={BedDouble} label="Время сна · цель до 01:00"><input className="field" type="time" value={current.sleepTime} onChange={event => onChange({ sleepTime: event.target.value })}/><p className={cn('mt-2 text-xs font-semibold', sleepOnTime ? 'text-emerald-600' : 'text-amber-600')}>{sleepOnTime ? 'Попадает в цель' : 'Сегодня попробуй начать сворачивать день раньше'}</p></Field>
        <Field icon={BatteryMedium} label={`Энергия · ${current.energy}/10`}><input className="w-full accent-cobalt" type="range" min="1" max="10" value={current.energy} onChange={event => onChange({ energy: Number(event.target.value) })}/></Field>
      </div>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card space-y-5">
        <Field icon={GlassWater} label="Алкоголь сегодня"><Toggle value={current.alcohol} onChange={alcohol => onChange({ alcohol })} yesLabel="Был" noLabel="Нет"/></Field>
        <Field icon={Cigarette} label="Сигареты, количество"><input className="field" type="number" min="0" max="100" value={current.cigarettes} onChange={event => onChange({ cigarettes: Math.max(0, Number(event.target.value)) })}/><p className="mt-2 text-xs leading-5 text-zinc-500">Фиксируем честно и снижаем постепенно — без требования быть идеальным за один день.</p></Field>
      </div>
      <div className={cn('card', current.alcohol ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20' : '')}>
        <HeartHandshake className="text-cobalt"/><h2 className="mt-5 text-xl font-bold">{current.alcohol ? 'Спокойное восстановление' : 'Поддерживаем устойчивость'}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{current.alcohol ? 'Это не повод ругать себя. Сейчас важнее помочь телу и не пытаться “отработать” день нагрузкой.' : 'Отмечай факты без оценки. Цель — видеть закономерности и постепенно укреплять контроль.'}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">{(current.alcohol ? ['Вода небольшими порциями','Нормальная тёплая еда','Сон без раннего будильника','Лёгкая прогулка'] : ['Ужин по плану','Тихий вечер','Сон до 01:00','План на завтра']).map(item => <div key={item} className="rounded-xl bg-white/70 p-3 text-xs font-semibold dark:bg-zinc-900/60">{item}</div>)}</div>
        {current.alcohol && <p className="mt-4 rounded-xl bg-cobalt p-3 text-xs font-bold text-white">На завтра автоматически включён мягкий план.</p>}
      </div>
    </div>
  </div>
}

function Field({ icon: Icon, label, children }: { icon: typeof Dumbbell; label: string; children: React.ReactNode }) {
  return <div><div className="mb-3 flex items-center gap-2"><Icon size={17} className="text-cobalt"/><span className="label mb-0">{label}</span></div>{children}</div>
}

function Toggle({ value, onChange, yesLabel = 'Да', noLabel = 'Нет' }: { value: boolean; onChange: (value: boolean) => void; yesLabel?: string; noLabel?: string }) {
  return <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">{[[true,yesLabel],[false,noLabel]].map(([option,label]) => <button key={label as string} onClick={() => onChange(option as boolean)} className={cn('rounded-xl px-4 py-2.5 text-sm font-semibold transition', value === option ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-zinc-500')}>{label as string}</button>)}</div>
}
