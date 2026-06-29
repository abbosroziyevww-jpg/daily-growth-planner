import { BookOpen, Check, HeartPulse, MessageCircle, MoonStar, ShieldCheck } from 'lucide-react'
import type { DayEntry } from '../types'
import { generateDailyPlan, type PlanCategory } from '../utils/generateDailyPlan'
import { MealPlan } from './MealPlan'

interface DailyPlanProps {
  entry: DayEntry
  onChange: (patch: Partial<DayEntry>) => void
}

const colors: Record<PlanCategory, string> = {
  Работа: 'bg-blue-100 text-blue-700', Питание: 'bg-emerald-100 text-emerald-700', Обучение: 'bg-amber-100 text-amber-700',
  Здоровье: 'bg-purple-100 text-purple-700', Развитие: 'bg-orange-100 text-orange-700', Защита: 'bg-red-100 text-red-700', Итоги: 'bg-zinc-200 text-zinc-700',
}

export function DailyPlan({ entry, onChange }: DailyPlanProps) {
  const plan = generateDailyPlan(entry)
  const toggle = (title: string) => onChange({ completed: entry.completed.includes(title) ? entry.completed.filter(item => item !== title) : [...entry.completed, title] })
  return <div className="mt-4 space-y-4">
    <div className="card bg-zinc-900 text-white dark:bg-zinc-800">
      <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-acid px-3 py-1.5 text-xs font-bold text-zinc-900">{plan.mode} режим</span><span className="text-xs text-zinc-400">Энергия {entry.energy}/10 · работа {entry.hours || 0} ч</span></div>
      <p className="mt-4 max-w-3xl text-lg font-semibold leading-7">{plan.summary}</p>
    </div>
    <div className="card overflow-hidden p-0 md:p-0">
      <div className="border-b p-5 md:px-6"><p className="text-xs font-semibold text-zinc-400">СОБРАНО ПОД ТВОЙ ДЕНЬ</p><h2 className="mt-1 text-xl font-bold">Расписание по времени</h2></div>
      {plan.schedule.map(item => <button key={`${item.time}-${item.title}`} onClick={() => toggle(item.title)} className="grid w-full grid-cols-[52px_1fr_auto] items-start gap-3 border-b px-5 py-4 text-left last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 md:grid-cols-[70px_1fr_100px_auto] md:px-6">
        <span className="pt-1 font-mono text-xs font-bold text-zinc-400">{item.time}</span><span><b className={entry.completed.includes(item.title) ? 'text-zinc-400 line-through' : ''}>{item.title}</b><small className="mt-1 block leading-5 text-zinc-500">{item.details}</small></span><span className={`hidden w-fit rounded-full px-2.5 py-1 text-[10px] font-bold md:block ${colors[item.category]}`}>{item.category}</span><span className={`mt-1 grid h-6 w-6 place-items-center rounded-full border ${entry.completed.includes(item.title) ? 'border-cobalt bg-cobalt text-white' : ''}`}>{entry.completed.includes(item.title) && <Check size={13}/>}</span>
      </button>)}
    </div>
    <MealPlan meals={plan.meals}/>
    <div className="grid gap-4 md:grid-cols-3">
      {[[BookOpen,'Обучение',plan.learning],[HeartPulse,'Спорт / восстановление',plan.movement],[MessageCircle,'Блог / нетворкинг',plan.growth]].map(([Icon,title,text]) => { const CardIcon = Icon as typeof BookOpen; return <div className="card" key={title as string}><CardIcon className="mb-5 text-cobalt" size={22}/><h3 className="font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text as string}</p></div> })}
    </div>
    <div className={`card ${entry.alcoholRisk === 'Высокий' ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' : ''}`}>
      <div className="flex gap-3"><ShieldCheck className={entry.alcoholRisk === 'Высокий' ? 'text-red-500' : 'text-emerald-500'}/><div className="flex-1"><h2 className="text-lg font-bold">Анти-срыв план</h2><p className="mt-1 text-sm text-zinc-500">Риск: {entry.alcoholRisk.toLowerCase()}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{plan.antiSlip.map(step => <div key={step} className="flex gap-2 rounded-xl bg-white/70 p-3 text-sm dark:bg-zinc-900/60"><Check size={15} className="mt-0.5 shrink-0 text-emerald-500"/>{step}</div>)}</div></div></div>
    </div>
    <div className="card"><div className="flex gap-3"><MoonStar className="text-purple-500"/><div><h2 className="text-lg font-bold">Вечерний разбор</h2><div className="mt-3 space-y-2">{plan.eveningReview.map((question, i) => <p className="text-sm text-zinc-500" key={question}><b className="mr-2 text-zinc-900 dark:text-white">0{i + 1}</b>{question}</p>)}</div></div></div></div>
  </div>
}
