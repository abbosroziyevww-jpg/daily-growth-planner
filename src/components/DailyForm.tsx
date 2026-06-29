import { Target } from 'lucide-react'
import type { DayEntry, Risk } from '../types'

interface DailyFormProps {
  entry: DayEntry
  onChange: (patch: Partial<DayEntry>) => void
}

const cn = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(' ')

export function DailyForm({ entry, onChange }: DailyFormProps) {
  return <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
    <div className="card">
      <div className="mb-5 flex items-center justify-between">
        <div><p className="text-xs font-semibold text-zinc-400">ВХОДНЫЕ ДАННЫЕ</p><h2 className="mt-1 text-xl font-bold">Работа и фокус</h2></div>
        <Target className="text-cobalt" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Дата</span><input className="field" type="date" value={entry.date} onInput={e => onChange({ date: e.currentTarget.value })}/></label>
        <label><span className="label">Рабочие часы</span><div className="relative"><input className="field pr-14" min="0" max="24" step="0.5" type="number" value={entry.hours || ''} placeholder="0" onChange={e => onChange({ hours: Number(e.target.value) })}/><span className="absolute right-4 top-3 text-sm text-zinc-400">час.</span></div></label>
        <label className="sm:col-span-2"><span className="label">Фокус дня</span><input className="field" value={entry.focus} placeholder="Одна вещь, которая двигает всё вперёд" onChange={e => onChange({ focus: e.target.value })}/></label>
        <label className="sm:col-span-2"><span className="label">Работа</span><textarea className="field min-h-24 resize-y" value={entry.work} placeholder="Съёмка, монтаж, переговоры…" onChange={e => onChange({ work: e.target.value })}/></label>
      </div>
    </div>
    <div className="card space-y-5">
      <div><span className="label">Энергия · {entry.energy}/10</span><input className="h-2 w-full accent-cobalt" type="range" min="1" max="10" value={entry.energy} onChange={e => onChange({ energy: Number(e.target.value) })}/><div className="mt-2 flex justify-between text-[10px] font-semibold text-zinc-400"><span>БЕРЕЖНО</span><span>В ПОТОКЕ</span></div></div>
      <div><span className="label">Спорт сегодня</span><div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">{[[true,'Да'],[false,'Нет']].map(([value,label]) => <button key={label as string} onClick={() => onChange({ sport: value as boolean })} className={cn('rounded-xl px-4 py-2.5 text-sm font-semibold transition', entry.sport === value ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-zinc-500')}>{label as string}</button>)}</div></div>
      <div><span className="label">Риск алкоголя</span><div className="grid grid-cols-3 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">{(['Низкий','Средний','Высокий'] as Risk[]).map(risk => <button key={risk} onClick={() => onChange({ alcoholRisk: risk })} className={cn('rounded-xl px-1 py-2.5 text-xs font-semibold transition', entry.alcoholRisk === risk && (risk === 'Низкий' ? 'bg-emerald-500 text-white' : risk === 'Средний' ? 'bg-amber-400 text-black' : 'bg-red-500 text-white'))}>{risk}</button>)}</div></div>
      <label><span className="label">Комментарий</span><textarea className="field min-h-20" value={entry.comment} placeholder="Что важно учесть сегодня?" onChange={e => onChange({ comment: e.target.value })}/></label>
    </div>
  </div>
}
