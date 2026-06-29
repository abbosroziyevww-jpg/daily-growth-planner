import { Dumbbell, Flame, Scale, TrendingUp, Utensils, Waves } from 'lucide-react'
import { blankHealthEntry } from '../data'
import type { HealthEntry } from '../types'

interface MassGainTrackerProps {
  date: string
  entries: Record<string, HealthEntry>
  sportToday: boolean
  onChange: (patch: Partial<HealthEntry>) => void
}

const TARGET_WEIGHT = 70
const START_WEIGHT = 58

function startOfWeek(date: string) {
  const value = new Date(`${date}T12:00:00`)
  const day = value.getDay() || 7
  value.setDate(value.getDate() - day + 1)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

export function MassGainTracker({ date, entries, sportToday, onChange }: MassGainTrackerProps) {
  const current = entries[date] ?? blankHealthEntry(date)
  const remaining = Math.max(0, TARGET_WEIGHT - current.weight)
  const currentWeek = startOfWeek(date)
  const weekEntries = Object.values(entries).filter(item => startOfWeek(item.date) === currentWeek)
  const trainings = weekEntries.filter(item => item.training).length
  const normalFoodDays = weekEntries.filter(item => item.meals >= 3 && item.meals <= 5).length
  const progress = Math.min(100, Math.max(0, ((current.weight - START_WEIGHT) / (TARGET_WEIGHT - START_WEIGHT)) * 100))

  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={Scale} label="Текущий вес" value={`${current.weight.toFixed(1)} кг`} color="bg-blue-100 text-blue-700"/>
      <Stat icon={TrendingUp} label="Цель веса" value={`${TARGET_WEIGHT} кг`} color="bg-acid text-zinc-900"/>
      <Stat icon={Flame} label="Осталось набрать" value={`${remaining.toFixed(1)} кг`} color="bg-orange-100 text-orange-700"/>
      <Stat icon={Dumbbell} label="Тренировки" value={`${trainings} / 3`} color="bg-purple-100 text-purple-700"/>
    </div>

    <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="label">Прогресс по неделям</p><h2 className="text-xl font-bold">График веса</h2></div><span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold dark:bg-zinc-800">+{Math.max(0, current.weight - START_WEIGHT).toFixed(1)} из 12 кг</span></div>
        <WeightChart entries={entries} current={current}/>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-gradient-to-r from-cobalt to-purple-500 transition-all" style={{ width: `${progress}%` }}/></div>
      </div>
      <div className="card space-y-5">
        <label><span className="label">Вес сегодня, кг</span><input className="field" min="40" max="120" step="0.1" type="number" value={current.weight} onChange={event => onChange({ weight: Number(event.target.value) })}/></label>
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"><p className="flex items-center gap-2 text-sm font-bold"><Utensils size={17} className="text-emerald-500"/>Нормальное питание</p><p className="mt-2 text-2xl font-extrabold">{normalFoodDays} дней</p><p className="mt-1 text-xs text-zinc-500">3–5 приёмов пищи на этой неделе</p></div>
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"><p className="flex items-center gap-2 text-sm font-bold"><Waves size={17} className="text-blue-500"/>Вода сегодня</p><p className="mt-2 text-2xl font-extrabold">{current.water.toFixed(1)} л</p></div>
      </div>
    </div>

    <div className="card">
      <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Питание для набора массы</p><h2 className="mt-1 text-xl font-bold">{sportToday ? 'Тренировочный день' : 'Обычный день'}</h2><p className="mt-2 text-sm text-zinc-500">Регулярная еда для энергии и постепенного профицита — не диета для похудения.</p></div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <Meal time="08:00" title="Завтрак" food="Яйца, овсянка, банан"/>
        <Meal time="11:00" title="Перекус" food="Творог, йогурт, орехи"/>
        <Meal time="14:00" title="Обед" food={sportToday ? 'Большая порция риса или макарон, мясо, салат' : 'Рис или гречка, курица, салат'} highlight={sportToday}/>
        {sportToday && <Meal time="17:30" title="До тренировки" food="Банан, йогурт или овсянка" highlight/>}
        {sportToday && <Meal time="20:00" title="После тренировки" food="Рис или картошка, курица или рыба" highlight/>}
        <Meal time="20:30" title="Ужин" food="Мясо или рыба, гарнир, салат"/>
        <Meal time="23:00" title="Перед сном" food="Творог или кефир, орехи"/>
      </div>
    </div>
  </div>
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof Scale; label: string; value: string; color: string }) {
  return <div className="card"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${color}`}><Icon size={19}/></span><p className="mt-5 text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p></div>
}

function Meal({ time, title, food, highlight = false }: { time: string; title: string; food: string; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${highlight ? 'border-cobalt/40 bg-blue-50 dark:bg-blue-950/30' : 'bg-zinc-50 dark:bg-zinc-900'}`}><span className="font-mono text-xs font-bold text-zinc-400">{time}</span><h3 className="mt-2 font-bold">{title}</h3><p className="mt-1 text-sm leading-5 text-zinc-500">{food}</p></div>
}

function WeightChart({ entries, current }: { entries: Record<string, HealthEntry>; current: HealthEntry }) {
  const byWeek = new Map<string, HealthEntry>()
  Object.values({ ...entries, [current.date]: current }).sort((a, b) => a.date.localeCompare(b.date)).forEach(item => byWeek.set(startOfWeek(item.date), item))
  const points = [...byWeek.entries()].slice(-8)
  if (points.length === 1) points.unshift(['Старт', { ...current, date: 'Старт', weight: START_WEIGHT }])
  const min = Math.min(56, ...points.map(([, item]) => item.weight)) - 1
  const max = Math.max(TARGET_WEIGHT, ...points.map(([, item]) => item.weight)) + 1
  const coords = points.map(([, item], index) => ({ x: 24 + index * (552 / Math.max(1, points.length - 1)), y: 140 - ((item.weight - min) / (max - min)) * 110, weight: item.weight }))
  return <div className="mt-5 overflow-x-auto"><svg viewBox="0 0 600 170" className="h-44 min-w-[520px] w-full" role="img" aria-label="Изменение веса по неделям"><line x1="24" y1="140" x2="576" y2="140" stroke="currentColor" className="text-zinc-200 dark:text-zinc-700"/><polyline points={coords.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#4f6ef7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{coords.map((point, index) => <g key={`${point.x}-${index}`}><circle cx={point.x} cy={point.y} r="6" fill="#4f6ef7"/><text x={point.x} y={point.y - 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">{point.weight.toFixed(1)}</text><text x={point.x} y="160" textAnchor="middle" fontSize="9" fill="#a1a1aa">{points[index][0] === 'Старт' ? 'старт' : new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(`${points[index][0]}T12:00:00`))}</text></g>)}</svg></div>
}
