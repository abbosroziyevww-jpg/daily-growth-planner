import { Apple, Dumbbell } from 'lucide-react'
import type { MealItem } from '../utils/generateDailyPlan'

export function MealPlan({ meals, compact = false }: { meals: MealItem[]; compact?: boolean }) {
  return <section className={compact ? '' : 'card'}>
    <div className="mb-5 flex items-center justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Энергия + масса</p><h2 className="mt-1 text-xl font-bold">Питание на день</h2></div>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Apple size={19}/></span>
    </div>
    <p className="mb-5 text-sm leading-6 text-zinc-500">Не диета для похудения: регулярные приёмы пищи, белок и углеводы для работы, тренировок и спокойного набора массы.</p>
    <div className="grid gap-2 md:grid-cols-2">
      {meals.map(meal => <div key={`${meal.time}-${meal.name}`} className={`rounded-2xl border p-4 ${meal.kind !== 'regular' ? 'border-cobalt/40 bg-blue-50 dark:bg-blue-950/30' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
        <div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-bold text-zinc-400">{meal.time}</span>{meal.kind !== 'regular' && <span className="flex items-center gap-1 rounded-full bg-cobalt px-2 py-1 text-[10px] font-bold text-white"><Dumbbell size={11}/>{meal.kind === 'pre-workout' ? 'ДО СПОРТА' : 'ПОСЛЕ СПОРТА'}</span>}</div>
        <h3 className="mt-2 font-bold">{meal.name}</h3><p className="mt-1 text-sm font-medium">{meal.foods}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{meal.note}</p>
      </div>)}
    </div>
  </section>
}
