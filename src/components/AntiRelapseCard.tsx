import { Check, Coffee, Footprints, GraduationCap, HeartHandshake, Moon, PhoneOff, Salad, ShieldCheck, ShowerHead, Store, UserRound } from 'lucide-react'
import type { DayEntry, EveningReviewEntry } from '../types'

interface AntiRelapseCardProps {
  entry: DayEntry
  review?: EveningReviewEntry
  onChange: (patch: Partial<DayEntry>) => void
}

const protocol = [
  { text: 'Не заходить в места покупки алкоголя', icon: Store },
  { text: 'Нормально поесть', icon: Salad },
  { text: 'Принять душ', icon: ShowerHead },
  { text: 'Прогулка 15–20 минут', icon: Footprints },
  { text: 'Обучение или практика', icon: GraduationCap },
  { text: 'Написать одному человеку', icon: UserRound },
  { text: 'Чай или кефир', icon: Coffee },
  { text: 'Убрать телефон', icon: PhoneOff },
  { text: 'Сон до 01:00', icon: Moon },
]

const recovery = ['Не пить алкоголь', 'Поесть нормально', '10 минут прогулки', '20–30 минут обучения', 'Принять душ', 'Лечь до 01:00', 'Не ругать себя']

export function AntiRelapseCard({ entry, review, onChange }: AntiRelapseCardProps) {
  const stress = review?.cravingReason === 'стресс'
  const boredom = review?.cravingReason === 'скучно'
  const recoveryMode = entry.energy <= 4 || entry.alcoholRisk === 'Высокий' || stress || entry.recoveryMode === true
  const showProtocol = entry.alcoholRisk === 'Средний' || entry.alcoholRisk === 'Высокий'
  const toggle = (text: string) => onChange({ completed: entry.completed.includes(text) ? entry.completed.filter(item => item !== text) : [...entry.completed, text] })

  return <div className="space-y-4">
    <div className={`card ${recoveryMode ? 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20' : 'bg-zinc-900 text-white dark:bg-zinc-800'}`}>
      <div className="flex items-start gap-4"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${recoveryMode ? 'bg-blue-600 text-white' : 'bg-acid text-zinc-900'}`}>{recoveryMode ? <HeartHandshake/> : <ShieldCheck/>}</span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Энергия {entry.energy}/10 · риск {entry.alcoholRisk.toLowerCase()}</p><h2 className="mt-2 text-2xl font-extrabold">{recoveryMode ? 'Режим восстановления включён' : 'Сегодня достаточно базовой опоры'}</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-300">{recoveryMode ? 'Сегодня задача не побеждать себя, а безопасно пройти вечер и вернуть телу опору.' : 'Риск невысокий. Сохраняем нормальную еду, контакт с людьми и спокойное завершение дня.'}</p></div></div>
      {recoveryMode && <div className="mt-6 grid gap-2 sm:grid-cols-2">{recovery.map(item => <button key={item} onClick={() => toggle(item)} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition ${entry.completed.includes(item) ? 'border-emerald-500 bg-emerald-500 text-white' : 'bg-white/70 dark:bg-zinc-900/60'}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${entry.completed.includes(item) ? 'border-white' : ''}`}>{entry.completed.includes(item)&&<Check size={12}/>}</span>{item}</button>)}</div>}
    </div>

    {boredom && <TriggerCard title="Если скучно — дай вечеру форму" text="Не нужно ждать мотивации. Выбери одно короткое действие, которое займёт руки и переключит внимание." items={['Добавить одну вечернюю задачу','Пройтись 15–20 минут','Снять короткий контент на телефон','Написать человеку']}/>} 
    {stress && <TriggerCard title="Если стресс — сначала восстановление" text="Снижаем нагрузку, а решения откладываем до более спокойного состояния." items={['Тёплый душ','Спокойная прогулка','Нормальная еда и вода','Лёгкий план без перегруза']}/>} 

    {showProtocol && <div className="card"><div className="flex items-center justify-between gap-3"><div><p className="label">Средний или высокий риск</p><h2 className="text-xl font-bold">Анти-срыв протокол</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${entry.alcoholRisk==='Высокий'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{entry.alcoholRisk}</span></div><div className="mt-5 grid gap-2 md:grid-cols-2">{protocol.map(({text,icon:Icon})=><button key={text} onClick={()=>toggle(text)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${entry.completed.includes(text)?'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30':'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}><Icon size={18} className="shrink-0"/><span className="flex-1">{text}</span>{entry.completed.includes(text)&&<Check size={16}/>}</button>)}</div></div>}
  </div>
}

function TriggerCard({title,text,items}:{title:string;text:string;items:string[]}){return <div className="card border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{items.map(item=><div key={item} className="rounded-xl bg-white/70 p-3 text-sm font-semibold dark:bg-zinc-900/60">{item}</div>)}</div></div>}
