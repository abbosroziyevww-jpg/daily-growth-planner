import { useMemo, useState } from 'react'
import { Check, ChevronRight, Clapperboard, Film, Megaphone, Quote, RefreshCw, Video } from 'lucide-react'
import { blogIdeas, getBlogIdea } from '../data/blogIdeas'
import type { PublishedPost } from '../types'

interface BlogIdeaCardProps {
  date: string
  published: PublishedPost[]
  onPublish: (ideaId: string) => void
}

function weekStart(date: string) {
  const value = new Date(`${date}T12:00:00`)
  value.setDate(value.getDate() - ((value.getDay() || 7) - 1))
  return value.toISOString().slice(0, 10)
}

export function BlogIdeaCard({ date, published, onPublish }: BlogIdeaCardProps) {
  const seed = useMemo(() => [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0), [date])
  const [offset, setOffset] = useState(0)
  const idea = getBlogIdea(seed + offset)
  const postsThisWeek = published.filter(post => weekStart(post.date) === weekStart(date)).length
  const isPublished = published.some(post => post.ideaId === idea.id && post.date === date)

  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="card sm:col-span-2"><div className="flex items-center justify-between"><div><p className="label">Ритм публикаций</p><p className="text-3xl font-extrabold">{postsThisWeek} / 2</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-acid text-zinc-900"><Megaphone/></div></div><div className="mt-5 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-cobalt" style={{width:`${Math.min(100, postsThisWeek / 2 * 100)}%`}}/></div></div>
      <div className="card"><p className="label">База генератора</p><p className="text-3xl font-extrabold">{blogIdeas.length}</p><p className="mt-1 text-sm text-zinc-500">идей · 9 категорий</p></div>
    </div>

    <article className="card overflow-hidden p-0 md:p-0">
      <div className="bg-zinc-900 p-6 text-white md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-acid px-3 py-1.5 text-xs font-bold text-zinc-900">{idea.category}</span><span className="text-xs font-bold text-zinc-400">REELS · 30–60 СЕК</span></div><h2 className="mt-7 max-w-3xl text-2xl font-extrabold tracking-tight md:text-3xl">{idea.topic}</h2></div>
      <div className="grid gap-0 lg:grid-cols-2">
        <Block icon={Quote} title="Хук"><p className="text-lg font-bold leading-7">«{idea.hook}»</p></Block>
        <Block icon={Film} title="Структура ролика"><ol className="space-y-2">{idea.structure.map((step,index)=><li key={step} className="flex gap-3 text-sm"><b className="text-cobalt">0{index+1}</b>{step}</li>)}</ol></Block>
        <Block icon={Clapperboard} title="Текст 30–60 секунд"><p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{idea.script}</p></Block>
        <Block icon={Video} title="Что снять"><ul className="space-y-2">{idea.shots.map(shot=><li key={shot} className="flex gap-2 text-sm"><ChevronRight size={16} className="mt-0.5 shrink-0 text-cobalt"/>{shot}</li>)}</ul></Block>
      </div>
      <div className="border-t bg-zinc-50 p-5 dark:bg-zinc-900 md:px-8"><p className="label">CTA без навязчивости</p><p className="text-sm font-semibold">{idea.cta}</p></div>
    </article>

    <div className="grid gap-3 sm:grid-cols-2"><button onClick={() => !isPublished && onPublish(idea.id)} className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold ${isPublished ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'}`}><Check size={18}/>{isPublished ? 'Опубликовано сегодня' : 'Отметить опубликованным'}</button><button onClick={() => setOffset(value => value + 1)} className="flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-bold dark:bg-zinc-900"><RefreshCw size={18}/>Дать другую идею</button></div>
  </div>
}

function Block({ icon: Icon, title, children }: { icon: typeof Quote; title: string; children: React.ReactNode }) {
  return <section className="border-b p-6 last:border-b-0 lg:border-r lg:p-8 lg:even:border-r-0"><Icon className="mb-4 text-cobalt" size={20}/><h3 className="label">{title}</h3>{children}</section>
}
