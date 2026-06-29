import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Check, Clock3, Eye, FlaskConical, Lightbulb, RefreshCw, Trophy } from 'lucide-react'
import { generateLearningTask } from '../utils/generateLearningTask'

interface LearningCardProps {
  date: string
  onComplete: (skillId: string) => void
}

export function LearningCard({ date, onComplete }: LearningCardProps) {
  const [alternative, setAlternative] = useState(0)
  const [completed, setCompleted] = useState(false)
  const task = useMemo(() => generateLearningTask(date, alternative), [date, alternative])
  useEffect(() => { setAlternative(0); setCompleted(false) }, [date])

  const complete = () => {
    if (completed) return
    onComplete(task.skillId)
    setCompleted(true)
  }

  const another = () => { setAlternative(value => value + 1); setCompleted(false) }

  return <div className="space-y-4">
    <div className="card overflow-hidden bg-zinc-900 text-white dark:bg-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-acid px-3 py-1.5 text-xs font-bold text-zinc-900">{task.dayLabel}</span>
        <span className="flex items-center gap-2 text-xs font-bold text-zinc-300"><Clock3 size={16}/>{task.duration} минут</span>
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-blue-300">{task.direction}</p>
      <h2 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight md:text-3xl">{task.title}</h2>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Info icon={Lightbulb} title="Короткая теория" text={task.theory}/>
      <Info icon={Eye} title="Что посмотреть" text={task.watch}/>
      <Info icon={FlaskConical} title="Практическое задание" text={task.practice} accent/>
      <Info icon={Trophy} title="Критерий проверки" text={task.criterion}/>
    </div>

    <div className="card flex gap-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Bookmark size={20}/></span>
      <div><p className="label text-amber-700 dark:text-amber-300">Что сохранить в портфолио</p><p className="text-sm font-medium leading-6">{task.portfolio}</p></div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <button onClick={complete} className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition ${completed ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900'}`}><Check size={18}/>{completed ? 'Выполнено · практика записана' : 'Выполнено'}</button>
      <button onClick={another} className="flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-bold transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"><RefreshCw size={18}/>Дать другую тему</button>
    </div>
  </div>
}

function Info({ icon: Icon, title, text, accent = false }: { icon: typeof Lightbulb; title: string; text: string; accent?: boolean }) {
  return <div className={`card ${accent ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20' : ''}`}>
    <Icon size={21} className="mb-5 text-cobalt"/><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
  </div>
}
