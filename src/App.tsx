import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Archive, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, Camera, Check, ChevronLeft, Cloud,
  ChevronRight, Clapperboard, Download, Dumbbell, FileJson, Flame, GitBranch,
  GraduationCap, Handshake, HeartPulse, LayoutDashboard, Megaphone, Menu, Moon,
  MoonStar, Palette, Play, ShieldCheck, Sparkles, Sun, Target, TrendingUp, Users,
  Utensils, X, type LucideIcon,
} from 'lucide-react'
import { blankEntry, menu, schedule, skills, todayISO } from './data'
import type { AppData, DayEntry, EveningReviewEntry, HealthEntry, NetworkingActionType, PortfolioProject, Risk, SkillStatus } from './types'
import { DailyForm } from './components/DailyForm'
import { DailyPlan as GeneratedDailyPlanView } from './components/DailyPlan'
import { MealPlan } from './components/MealPlan'
import { generateDailyPlan } from './utils/generateDailyPlan'
import { LearningCard } from './components/LearningCard'
import { SkillTreeView } from './components/SkillTree'
import { MassGainTracker } from './components/MassGainTracker'
import { HealthTracker } from './components/HealthTracker'
import { BlogIdeaCard } from './components/BlogIdeaCard'
import { PortfolioTracker } from './components/PortfolioTracker'
import { NetworkingCard } from './components/NetworkingCard'
import { AntiRelapseCard } from './components/AntiRelapseCard'
import { EveningReview } from './components/EveningReview'
import { ProgressCalendar } from './components/ProgressCalendar'
import { ExportPanel } from './components/ExportPanel'
import { defaultReminders, ReminderSettings } from './components/ReminderSettings'
import { DataBackup } from './components/DataBackup'
import { SyncSettings } from './components/SyncSettings'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { markLocalChange, syncAppData, type SyncStatus, type SyncStrategy } from './utils/cloudSync'

const STORAGE_KEY = 'daily-growth-planner-v1'
const initialData: AppData = { entries: {}, weight: 58, habits: {}, skillProgress: {}, healthEntries: {}, publishedPosts: [], portfolioProjects: [], networkingActions: [], eveningReviews: {}, reminders: defaultReminders }

function normalizeData(parsed: Partial<AppData>): AppData {
    return {
      ...initialData, ...parsed,
      entries: parsed.entries ?? {}, habits: parsed.habits ?? {}, skillProgress: parsed.skillProgress ?? {}, healthEntries: parsed.healthEntries ?? {},
      publishedPosts: Array.isArray(parsed.publishedPosts) ? parsed.publishedPosts : [],
      portfolioProjects: Array.isArray(parsed.portfolioProjects) ? parsed.portfolioProjects : [],
      networkingActions: Array.isArray(parsed.networkingActions) ? parsed.networkingActions : [],
      eveningReviews: parsed.eveningReviews ?? {},
      reminders: Array.isArray(parsed.reminders) && parsed.reminders.length ? parsed.reminders : defaultReminders,
    }
}

function loadData(): AppData {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<AppData>
    return normalizeData(parsed)
  }
  catch { return initialData }
}

const Icons = {
  Archive, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, Camera, Check, ChevronLeft, Cloud,
  ChevronRight, Clapperboard, Download, Dumbbell, FileJson, Flame, GitBranch,
  GraduationCap, Handshake, HeartPulse, LayoutDashboard, Megaphone, Menu, Moon,
  MoonStar, Palette, Play, ShieldCheck, Sparkles, Sun, Target, TrendingUp, Users,
  Utensils, X,
}
const iconMap = Icons as Record<string, LucideIcon>
const cn = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(' ')

const navigationItems = [
  { id: 'plan', label: 'План дня', icon: 'LayoutDashboard' },
  { id: 'learning', label: 'Сегодня учимся', icon: 'GraduationCap' },
  { id: 'skills', label: 'Skill Tree', icon: 'GitBranch' },
  { id: 'nutrition', label: 'Питание', icon: 'Utensils' },
  { id: 'mass', label: 'Набор массы', icon: 'Dumbbell' },
  { id: 'health', label: 'Здоровье', icon: 'HeartPulse' },
  { id: 'blog', label: 'Блог', icon: 'Clapperboard' },
  { id: 'portfolio', label: 'Портфолио', icon: 'BriefcaseBusiness' },
  { id: 'networking', label: 'Нетворкинг', icon: 'Users' },
  { id: 'anti-relapse', label: 'Анти-срыв', icon: 'ShieldCheck' },
  { id: 'evening', label: 'Вечерний разбор', icon: 'MoonStar' },
  { id: 'calendar', label: 'Календарь прогресса', icon: 'CalendarDays' },
  { id: 'reminders', label: 'Напоминания', icon: 'Bell' },
  { id: 'backup', label: 'Данные и резервная копия', icon: 'Archive' },
  { id: 'export', label: 'Экспорт', icon: 'Download' },
  { id: 'sync', label: 'Аккаунт и синхронизация', icon: 'Cloud', component: SyncSettings },
] as const

function formatLong(date: string) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`))
}

function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="mb-6">
    {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-cobalt">{eyebrow}</p>}
    <h1 className="text-3xl font-extrabold tracking-[-.04em] md:text-4xl">{title}</h1>
    {text && <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{text}</p>}
  </div>
}

function Toggle({ value, onChange, labels = ['Да', 'Нет'] }: { value: boolean; onChange: (v: boolean) => void; labels?: [string, string] }) {
  return <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
    {[true, false].map((v, i) => <button key={`${v}`} onClick={() => onChange(v)} className={cn('rounded-xl px-4 py-2.5 text-sm font-semibold transition', value === v ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-zinc-500')}>{labels[i]}</button>)}
  </div>
}

function ProgressRing({ value }: { value: number }) {
  const r = 42, c = 2 * Math.PI * r
  return <div className="relative grid h-28 w-28 place-items-center">
    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800"/><circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="text-cobalt transition-all duration-700"/></svg>
    <div className="text-center"><b className="text-2xl">{value}%</b><span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">дня</span></div>
  </div>
}

function DayPlan({ entry, update }: { entry: DayEntry; update: (patch: Partial<DayEntry>) => void }) {
  const required = [entry.work, entry.focus, entry.hours > 0, entry.comment, entry.sport]
  const progress = Math.round((required.filter(Boolean).length / required.length) * 100)
  const toggleTask = (title: string) => update({ completed: entry.completed.includes(title) ? entry.completed.filter(x => x !== title) : [...entry.completed, title] })
  return <>
    <div className="flex items-start justify-between gap-4"><SectionTitle eyebrow="Точка сборки" title="План дня" text={formatLong(entry.date)} /><ProgressRing value={progress}/></div>
    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <div className="card">
        <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold text-zinc-400">ГЛАВНОЕ НА СЕГОДНЯ</p><h2 className="mt-1 text-xl font-bold">Работа и фокус</h2></div><Icons.Target className="text-cobalt" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="label">Дата</span><input className="field" type="date" value={entry.date} onChange={e => update({ date: e.target.value })}/></label>
          <label><span className="label">Рабочие часы</span><div className="relative"><input className="field pr-14" min="0" max="24" step="0.5" type="number" value={entry.hours || ''} placeholder="0" onChange={e => update({ hours: Number(e.target.value) })}/><span className="absolute right-4 top-3 text-sm text-zinc-400">час.</span></div></label>
          <label className="sm:col-span-2"><span className="label">Фокус дня</span><input className="field" value={entry.focus} placeholder="Одна вещь, которая двигает всё вперёд" onChange={e => update({ focus: e.target.value })}/></label>
          <label className="sm:col-span-2"><span className="label">Описание работы</span><textarea className="field min-h-24 resize-y" value={entry.work} placeholder="Съёмка, монтаж, переговоры…" onChange={e => update({ work: e.target.value })}/></label>
        </div>
      </div>
      <div className="card space-y-5">
        <div><span className="label">Энергия · {entry.energy}/10</span><input className="h-2 w-full accent-cobalt" type="range" min="1" max="10" value={entry.energy} onChange={e => update({ energy: Number(e.target.value) })}/><div className="mt-2 flex justify-between text-[10px] font-semibold text-zinc-400"><span>НА НУЛЕ</span><span>В ПОТОКЕ</span></div></div>
        <div><span className="label">Спорт сегодня</span><Toggle value={entry.sport} onChange={sport => update({ sport })}/></div>
        <div><span className="label">Риск алкоголя</span><div className="grid grid-cols-3 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">{(['Низкий','Средний','Высокий'] as Risk[]).map(r => <button key={r} onClick={() => update({ alcoholRisk: r })} className={cn('rounded-xl px-1 py-2.5 text-xs font-semibold transition', entry.alcoholRisk === r && (r === 'Низкий' ? 'bg-emerald-500 text-white' : r === 'Средний' ? 'bg-amber-400 text-black' : 'bg-red-500 text-white'))}>{r}</button>)}</div></div>
        <label><span className="label">Комментарий дня</span><textarea className="field min-h-20" value={entry.comment} placeholder="Что важно не забыть?" onChange={e => update({ comment: e.target.value })}/></label>
      </div>
    </div>
    <div className="card mt-4 overflow-hidden p-0 md:p-0">
      <div className="flex items-center justify-between border-b p-5 md:px-6"><div><p className="text-xs font-semibold text-zinc-400">РИТМ</p><h2 className="mt-1 text-xl font-bold">Каркас дня</h2></div><span className="rounded-full bg-acid px-3 py-1.5 text-xs font-bold text-zinc-900">4 блока</span></div>
      <div>{schedule.map((item, i) => <button onClick={() => toggleTask(item.title)} key={item.time} className="grid w-full grid-cols-[58px_1fr_auto] items-center gap-3 border-b px-5 py-4 text-left last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 md:grid-cols-[80px_1fr_110px_auto] md:px-6">
        <span className="font-mono text-xs font-semibold text-zinc-400">{item.time}</span><span className={cn('font-semibold', entry.completed.includes(item.title) && 'text-zinc-400 line-through')}>{item.title}</span><span className={cn('hidden w-fit rounded-full px-2.5 py-1 text-[11px] font-bold text-zinc-800 md:block', item.color)}>{item.tag}</span><span className={cn('grid h-6 w-6 place-items-center rounded-full border', entry.completed.includes(item.title) && 'border-cobalt bg-cobalt text-white')}>{entry.completed.includes(item.title) && <Icons.Check size={14}/>}</span>
      </button>)}</div>
    </div>
  </>
}

function DailyPlanModule({ entry, update }: { entry: DayEntry; update: (patch: Partial<DayEntry>) => void }) {
  const required = [entry.work, entry.focus, entry.hours > 0, entry.comment, entry.sport]
  const progress = Math.round((required.filter(Boolean).length / required.length) * 100)
  return <>
    <div className="flex items-start justify-between gap-4"><SectionTitle eyebrow="Точка сборки" title="План дня" text={`${formatLong(entry.date)} · план меняется вместе с вводными`} /><ProgressRing value={progress}/></div>
    <DailyForm entry={entry} onChange={update}/>
    <GeneratedDailyPlanView entry={entry} onChange={update}/>
  </>
}

function LearningModule({ date, onComplete }: { date: string; onComplete: (skillId: string) => void }) {
  const week = [['Пн','Цвет'],['Вт','Камера'],['Ср','Монтаж'],['Чт','Режиссура'],['Пт','Бренд'],['Сб','Съёмка'],['Вс','Разбор']]
  const currentDay = new Date(`${date}T12:00:00`).getDay()
  const mondayIndex = currentDay === 0 ? 6 : currentDay - 1
  return <>
    <SectionTitle eyebrow="Middle → Strong" title="Сегодня учимся" text="90 минут направленной практики. Тема зависит от дня недели и помогает собирать доказательства навыка в портфолио."/>
    <div className="mb-4 grid grid-cols-7 gap-1 rounded-2xl border bg-white p-2 dark:bg-[#171816]">{week.map(([day,topic], index) => <div key={day} className={cn('rounded-xl px-1 py-2 text-center', index === mondayIndex && 'bg-zinc-900 text-white dark:bg-acid dark:text-zinc-900')}><b className="block text-xs">{day}</b><span className="mt-1 hidden text-[9px] font-semibold sm:block">{topic}</span></div>)}</div>
    <LearningCard date={date} onComplete={onComplete}/>
  </>
}

function SkillTreeModule({ progress, onStatusChange }: { progress: AppData['skillProgress']; onStatusChange: (id: string, status: SkillStatus) => void }) {
  return <><SectionTitle eyebrow="Карта развития" title="Skill Tree" text="Стартовый уровень — Middle. Цель — перейти к Strong через повторяемую практику, сильное качество и портфолио для корпоративных клиентов."/><SkillTreeView progress={progress} onStatusChange={onStatusChange}/></>
}

function NutritionPlan({ entry }: { entry: DayEntry }) {
  const plan = generateDailyPlan(entry)
  return <>
    <SectionTitle eyebrow="Топливо" title="Питание для энергии и массы" text={`План на ${formatLong(entry.date)}. ${entry.sport ? 'Учтена тренировка и добавлены приёмы пищи до и после.' : 'Сегодня без тренировки — держим стабильную энергию и умеренный профицит.'}`}/>
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      {[['6–8','приёмов пищи'],['≈ 2 850','ккал · ориентир'],['≈ 170','г белка · ориентир']].map(([value,label]) => <div className="card" key={label}><b className="text-2xl">{value}</b><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p></div>)}
    </div>
    <MealPlan meals={plan.meals}/>
  </>
}

function MassGainModule({ date, entries, sportToday, onChange }: { date: string; entries: AppData['healthEntries']; sportToday: boolean; onChange: (patch: Partial<HealthEntry>) => void }) {
  return <><SectionTitle eyebrow="58 → 70 кг" title="Набор массы" text="Цель — постепенно набрать 12 кг, сохраняя энергию, сон и три тренировки в неделю."/><MassGainTracker date={date} entries={entries} sportToday={sportToday} onChange={onChange}/></>
}

function HealthModule({ date, entries, onChange }: { date: string; entries: AppData['healthEntries']; onChange: (patch: Partial<HealthEntry>) => void }) {
  return <><SectionTitle eyebrow="Без наказаний" title="Здоровье и восстановление" text="Честно фиксируем сон, питание, воду, алкоголь и курение. Ищем устойчивый тренд, а не идеальный день."/><HealthTracker date={date} entries={entries} onChange={onChange}/></>
}

function BlogModule({ date, published, onPublish }: { date: string; published: AppData['publishedPosts']; onPublish: (ideaId:string)=>void }) {
  return <><SectionTitle eyebrow="2 публикации в неделю" title="Блог" text="Готовые идеи для Reels и сторис: от хука до кадров и спокойного CTA. Выбирай, адаптируй под свой голос и публикуй."/><BlogIdeaCard date={date} published={published} onPublish={onPublish}/></>
}

function PortfolioModule({ projects, onAdd, onDelete }: { projects: PortfolioProject[]; onAdd: (project: Omit<PortfolioProject,'id'>)=>void; onDelete:(id:string)=>void }) {
  return <><SectionTitle eyebrow="Доказательства качества" title="Портфолио" text="Собирай не просто красивые кадры, а кейсы: задача, роль, сильные стороны, выводы и готовность к шоурилу."/><PortfolioTracker projects={projects} onAdd={onAdd} onDelete={onDelete}/></>
}

function NetworkingModule({ date, actions, onSend }: { date:string; actions:AppData['networkingActions']; onSend:(type:NetworkingActionType,templateId:string)=>void }) {
  return <><SectionTitle eyebrow="2 клиента · 2 режиссёра · 1 follow-up" title="Нетворкинг" text="Небольшие персональные касания каждую неделю. Без массовой рассылки и натянутых продаж."/><NetworkingCard date={date} actions={actions} onSend={onSend}/></>
}

function AntiRelapseModule({ entry, review, onChange }: { entry:DayEntry; review?:EveningReviewEntry; onChange:(patch:Partial<DayEntry>)=>void }) {
  return <><SectionTitle eyebrow="Скука · стресс" title="Анти-срыв" text="Практический протокол на сложный вечер. Без переговоров с тягой и без самонаказания."/><AntiRelapseCard entry={entry} review={review} onChange={onChange}/></>
}

function EveningReviewModule({ review, entry, onReviewChange, onEntryChange }: { review:EveningReviewEntry; entry:DayEntry; onReviewChange:(patch:Partial<EveningReviewEntry>)=>void; onEntryChange:(patch:Partial<DayEntry>)=>void }) {
  return <><SectionTitle eyebrow="Честно и спокойно" title="Вечерний разбор" text="Закрой день фактами: что получилось, где было трудно и как сделать завтра немного проще."/><EveningReview review={review} onChange={onReviewChange}/>{review.cravingReason&&<div className="mt-4"><AntiRelapseCard entry={entry} review={review} onChange={onEntryChange}/></div>}</>
}

function CalendarModule({data}: {data:AppData}) { return <><SectionTitle eyebrow="Пять опор" title="Календарь прогресса" text="Зелёный — минимум дня собран. Жёлтый — сделана часть. Красный — срыв или день остался без опор."/><ProgressCalendar entries={data.entries} healthEntries={data.healthEntries} reviews={data.eveningReviews} skillProgress={data.skillProgress}/></> }
function ExportModule({date,data}:{date:string;data:AppData}) { return <><SectionTitle eyebrow="Твои данные" title="Экспорт" text="Скопируй план, отправь его в Telegram или сохрани текущий день, неделю и полную резервную копию."/><ExportPanel date={date} data={data}/></> }
function RemindersModule({settings,onChange}:{settings:AppData['reminders'];onChange:(settings:AppData['reminders'])=>void}) { return <><SectionTitle eyebrow="Локально и спокойно" title="Напоминания" text="Настрой время и дни. Приложение покажет актуальную подсказку и подготовит весь график для копирования в Telegram."/><ReminderSettings settings={settings} onChange={onChange}/></> }
function DataBackupModule() { return <><SectionTitle eyebrow="Mac ↔ iPhone" title="Данные и резервная копия" text="Скачивай все данные одним JSON-файлом, переноси их между устройствами и восстанавливай приложение без облачного аккаунта."/><DataBackup/></> }
function SyncModule({status,lastSyncedAt,message,onSync}:{status:SyncStatus;lastSyncedAt:string|null;message:string|null;onSync:(strategy?:SyncStrategy)=>Promise<void>}) { return <><SectionTitle eyebrow="Mac ↔ iPhone" title="Аккаунт и синхронизация" text="Войди с одним email на обоих устройствах. Изменения остаются локально и автоматически отправляются в защищённое облако."/><SyncSettings status={status} lastSyncedAt={lastSyncedAt} message={message} onSync={onSync}/></> }

function blankReview(date:string):EveningReviewEntry{return {date,didWell:'',didNotWork:'',whyNot:'',alcohol:false,craving:false,cravingReason:'',cigarettes:0,easierTomorrow:'',mainLesson:'',completed:false}}

function Learning({ habits, setHabit }: { habits: Record<string, boolean>; setHabit: (k: string, v: boolean) => void }) {
  const lessons = [
    ['Свет для интервью', 'Разобрать мягкий ключевой свет и negative fill', '35 мин', 'Оператор'],
    ['Node Tree в DaVinci', 'Собрать чистую структуру для коммерческого ролика', '45 мин', 'Цвет'],
    ['Разбор кейса банка', 'Выписать визуальные приёмы и подачу результата', '20 мин', 'Бизнес'],
  ]
  return <><SectionTitle eyebrow="Ежедневная практика" title="Сегодня учимся" text="Маленькие направленные повторения сильнее редких марафонов."/><div className="grid gap-4 lg:grid-cols-3">{lessons.map(([title,text,time,tag], i) => <div className="card flex min-h-56 flex-col" key={title}><div className="mb-5 flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-acid text-zinc-900"><Icons.Play size={18} fill="currentColor"/></span><span className="text-xs font-bold text-zinc-400">{time}</span></div><span className="text-xs font-bold uppercase tracking-wider text-cobalt">{tag}</span><h3 className="mt-2 text-lg font-bold">{title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">{text}</p><button onClick={() => setHabit(`lesson-${i}`, !habits[`lesson-${i}`])} className={cn('mt-4 rounded-2xl py-3 text-sm font-bold transition', habits[`lesson-${i}`] ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900')}>{habits[`lesson-${i}`] ? 'Выполнено ✓' : 'Начать практику'}</button></div>)}</div></>
}

function SkillTree() {
  return <><SectionTitle eyebrow="Траектория" title="Skill Tree" text="Не просто учиться всему — видеть, какой навык открывает следующий уровень проектов."/><div className="grid gap-4 lg:grid-cols-2">{skills.map((skill, i) => <div className="card" key={skill.name}><div className="flex items-center gap-4"><div className={cn('grid h-12 w-12 place-items-center rounded-2xl text-white', skill.color)}>{i === 0 ? <Icons.Camera/> : i === 1 ? <Icons.Palette/> : i === 2 ? <Icons.Megaphone/> : <Icons.Handshake/>}</div><div className="flex-1"><div className="flex justify-between"><h3 className="font-bold">{skill.name}</h3><b className="text-sm">{skill.level}/{skill.max}</b></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={cn('h-full rounded-full', skill.color)} style={{width: `${skill.level / skill.max * 100}%`}}/></div></div></div><div className="mt-5 flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"><span className="text-sm text-zinc-500">Следующий шаг</span><span className="text-sm font-semibold">{['Движение камеры','Skin tones','Серия из 5 Reels','Тендерная презентация'][i]} →</span></div></div>)}</div></>
}

const sectionContent: Record<string, { eyebrow: string; title: string; text: string; cards: Array<[string,string,string]> }> = {
  'Питание': { eyebrow: 'Топливо', title: 'Питание', text: 'Простой контроль без невроза: регулярность, белок и вода.', cards: [['Цель дня','2 850','ккал'],['Белок','148 / 170','грамм'],['Вода','1.8 / 2.5','литра']] },
  'Набор массы': { eyebrow: 'Система тела', title: 'Набор массы', text: 'Спокойный профицит и наблюдение за трендом веса.', cards: [['Текущий вес','72.0','кг'],['Цель','78.0','кг'],['Темп','+0.3','кг / нед']] },
  'Здоровье': { eyebrow: 'База', title: 'Здоровье', text: 'Сон, движение и восстановление поддерживают амбиции.', cards: [['Сон','7 ч 40','сегодня'],['Шаги','6 420','из 8 000'],['Тренировки','3','на неделе']] },
  'Блог': { eyebrow: 'Личный бренд', title: 'Блог', text: 'Показывай процесс, вкус и компетентность — регулярно.', cards: [['Идеи','12','в бэклоге'],['Опубликовано','3','в этом месяце'],['Следующий пост','Разбор света','черновик']] },
  'Портфолио': { eyebrow: 'Витрина', title: 'Портфолио', text: 'Кейсы должны продавать решение бизнес-задачи, а не только красивый кадр.', cards: [['Готовые кейсы','6','проектов'],['В работе','2','кейса'],['Приоритет','Банковский ролик','до пятницы']] },
  'Нетворкинг': { eyebrow: 'Связи', title: 'Нетворкинг', text: 'Сильная сеть строится из полезных, человеческих касаний.', cards: [['Новые контакты','4','на неделе'],['Follow-up','3','нужно сделать'],['Встречи','2','запланировано']] },
  'Анти-срыв': { eyebrow: 'Опора', title: 'Анти-срыв', text: 'Когда штормит — не спорить с собой, а пройти короткий протокол.', cards: [['Шаг 1','Выпить воды','2 минуты'],['Шаг 2','Выйти на улицу','10 минут'],['Шаг 3','Позвонить близкому','не оставаться одному']] },
  'Вечерний разбор': { eyebrow: 'Закрытие дня', title: 'Вечерний разбор', text: 'Зафиксируй победы и освободи голову перед сном.', cards: [['Победа дня','Что получилось?','запиши одним предложением'],['Урок','Что изменить?','без самокритики'],['Завтра','Главный фокус','одна задача']] },
}

function GenericSection({ name, habits, setHabit }: { name: string; habits: Record<string, boolean>; setHabit: (k:string,v:boolean)=>void }) {
  const s = sectionContent[name]
  if (!s) return null
  return <><SectionTitle eyebrow={s.eyebrow} title={s.title} text={s.text}/><div className="grid gap-4 md:grid-cols-3">{s.cards.map(([title,value,unit],i) => <button key={title} onClick={() => setHabit(`${name}-${i}`, !habits[`${name}-${i}`])} className={cn('card text-left transition hover:-translate-y-0.5', habits[`${name}-${i}`] && 'ring-2 ring-cobalt')}><div className="mb-8 flex justify-between"><span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</span><Icons.ArrowUpRight size={17}/></div><div className="text-2xl font-extrabold tracking-tight">{value}</div><p className="mt-1 text-sm text-zinc-500">{unit}</p></button>)}</div><div className="card mt-4"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-acid text-zinc-900"><Icons.Sparkles size={18}/></span><div><h3 className="font-bold">Действие на сегодня</h3><p className="mt-1 text-sm leading-6 text-zinc-500">Нажми на любую карточку, чтобы отметить касание к этой сфере. В следующей версии здесь появятся детальные записи и аналитика.</p></div></div></div></>
}

function Calendar({ entries }: { entries: Record<string, DayEntry> }) {
  const [cursor, setCursor] = useState(new Date())
  const year = cursor.getFullYear(), month = cursor.getMonth()
  const days = new Date(year, month + 1, 0).getDate(), offset = (new Date(year, month, 1).getDay() + 6) % 7
  const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(cursor)
  return <><SectionTitle eyebrow="История" title="Календарь прогресса" text="Заполненные дни складываются в видимый ритм."/><div className="card max-w-3xl"><div className="mb-6 flex items-center justify-between"><button className="icon-button" onClick={() => setCursor(new Date(year, month - 1))}><Icons.ChevronLeft size={18}/></button><h2 className="text-lg font-bold capitalize">{monthName}</h2><button className="icon-button" onClick={() => setCursor(new Date(year, month + 1))}><Icons.ChevronRight size={18}/></button></div><div className="grid grid-cols-7 gap-1 text-center">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x => <div className="pb-2 text-[10px] font-bold text-zinc-400" key={x}>{x}</div>)}{Array.from({length: offset}).map((_,i)=><div key={`e${i}`}/>)}{Array.from({length: days},(_,i)=>i+1).map(day => { const date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`, has = !!entries[date]; return <div key={day} className={cn('mx-auto grid aspect-square w-full max-w-12 place-items-center rounded-xl text-sm font-semibold', date === todayISO() && 'ring-2 ring-cobalt', has && 'bg-acid text-zinc-900')}>{day}</div> })}</div><div className="mt-6 flex gap-4 border-t pt-5 text-xs text-zinc-500"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-acid"/>Есть запись</span><span>{Object.keys(entries).length} дней за всё время</span></div></div></>
}

function Export({ data }: { data: AppData }) {
  const download = () => { const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`daily-growth-${todayISO()}.json`; a.click(); URL.revokeObjectURL(a.href) }
  return <><SectionTitle eyebrow="Твои данные" title="Экспорт" text="Сохрани резервную копию. Данные остаются в этом браузере, пока ты сам их не экспортируешь или не очистишь."/><div className="card max-w-2xl"><div className="mb-8 grid h-16 w-16 place-items-center rounded-3xl bg-acid text-zinc-900"><Icons.FileJson/></div><h2 className="text-xl font-bold">Полная копия данных</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Дневные записи, отметки и прогресс в универсальном формате JSON.</p><button onClick={download} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-4 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"><Icons.Download size={18}/>Скачать JSON</button></div></>
}

export default function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [active, setActive] = useState('plan')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [dark, setDark] = useState(() => { const saved=localStorage.getItem('dgp-theme'); return saved ? saved==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches })
  const [storageOk, setStorageOk] = useState(true)
  const dataRef = useRef(data)
  const skipCloudMarkRef = useRef(false)
  const syncTimerRef = useRef<number | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured ? (navigator.onLine ? 'local' : 'offline') : 'not_configured')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const entry = useMemo(() => data.entries[selectedDate] || blankEntry(selectedDate), [data.entries, selectedDate])
  const eveningReview = useMemo(() => data.eveningReviews[selectedDate] || blankReview(selectedDate), [data.eveningReviews, selectedDate])
  const runCloudSync = useCallback(async (strategy: SyncStrategy = 'auto') => {
    setSyncStatus(isSupabaseConfigured ? (navigator.onLine ? 'syncing' : 'offline') : 'not_configured')
    setSyncMessage(null)
    const result = await syncAppData(dataRef.current, strategy)
    setSyncStatus(result.status)
    setSyncMessage(result.message ?? null)
    if (result.syncedAt) setLastSyncedAt(result.syncedAt)
    if (result.data) {
      const nextData = normalizeData(result.data)
      skipCloudMarkRef.current = true
      dataRef.current = nextData
      setData(nextData)
    }
  }, [])
  useEffect(() => {
    dataRef.current = data
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setStorageOk(true) } catch { setStorageOk(false); return }
    if (skipCloudMarkRef.current) { skipCloudMarkRef.current = false; return }
    if (!isSupabaseConfigured) { setSyncStatus('not_configured'); return }
    markLocalChange()
    setSyncStatus(current => current === 'conflict' ? current : (navigator.onLine ? 'local' : 'offline'))
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => void runCloudSync(), 1800)
    return () => { if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current) }
  }, [data, runCloudSync])
  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data: auth }) => auth.session ? void runCloudSync() : setSyncStatus('signed_out'))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { setSyncStatus('signed_out'); return }
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') window.setTimeout(() => void runCloudSync(), 0)
    })
    const handleOnline = () => void runCloudSync()
    const handleOffline = () => setSyncStatus('offline')
    const handleVisibility = () => { if (document.visibilityState === 'visible' && navigator.onLine) void runCloudSync() }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibility)
    const interval = window.setInterval(() => { if (navigator.onLine) void runCloudSync() }, 60_000)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.clearInterval(interval)
    }
  }, [runCloudSync])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('dgp-theme', dark ? 'dark' : 'light'); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e0f0d' : '#f5f5f3') }, [dark])
  const update = (patch: Partial<DayEntry>) => {
    if (patch.date && patch.date !== selectedDate) { setSelectedDate(patch.date); return }
    setData(prev => ({...prev, entries: {...prev.entries, [selectedDate]: {...(prev.entries[selectedDate] || blankEntry(selectedDate)), ...patch}}}))
  }
  const setHabit = (k: string, v: boolean) => setData(p => ({...p, habits: {...p.habits, [k]: v}}))
  const completeLearning = (skillId: string) => setData(prev => {
    const current = prev.skillProgress[skillId] ?? { status: 'not_started' as const, practices: 0, lastPracticed: null }
    return { ...prev, skillProgress: { ...prev.skillProgress, [skillId]: { ...current, status: current.status === 'mastered' ? 'mastered' : 'practiced', practices: current.practices + 1, lastPracticed: selectedDate } } }
  })
  const changeSkillStatus = (skillId: string, status: SkillStatus) => setData(prev => {
    const current = prev.skillProgress[skillId] ?? { status, practices: 0, lastPracticed: null }
    return { ...prev, skillProgress: { ...prev.skillProgress, [skillId]: { ...current, status } } }
  })
  const updateHealth = (patch: Partial<HealthEntry>) => setData(prev => {
    const currentHealth = prev.healthEntries[selectedDate] ?? { date: selectedDate, weight: 58, training: false, meals: 4, water: 2, sleepTime: '00:30', alcohol: false, cigarettes: 0, energy: 7 }
    const currentDay = prev.entries[selectedDate] ?? blankEntry(selectedDate)
    const syncedDay: DayEntry = { ...currentDay, ...(patch.training !== undefined ? { sport: patch.training } : {}), ...(patch.energy !== undefined ? { energy: patch.energy } : {}) }
    const entries = { ...prev.entries, [selectedDate]: syncedDay }
    if (patch.alcohol !== undefined) {
      const tomorrowValue = new Date(`${selectedDate}T12:00:00`)
      tomorrowValue.setDate(tomorrowValue.getDate() + 1)
      const tomorrow = `${tomorrowValue.getFullYear()}-${String(tomorrowValue.getMonth() + 1).padStart(2, '0')}-${String(tomorrowValue.getDate()).padStart(2, '0')}`
      entries[tomorrow] = { ...(prev.entries[tomorrow] ?? blankEntry(tomorrow)), recoveryMode: patch.alcohol }
    }
    return { ...prev, entries, healthEntries: { ...prev.healthEntries, [selectedDate]: { ...currentHealth, ...patch } } }
  })
  const publishPost = (ideaId: string) => setData(prev => {
    if (prev.publishedPosts.some(post => post.date === selectedDate && post.ideaId === ideaId)) return prev
    return { ...prev, publishedPosts: [...prev.publishedPosts, { id: `${selectedDate}-${ideaId}`, ideaId, date: selectedDate }] }
  })
  const addPortfolioProject = (project: Omit<PortfolioProject,'id'>) => setData(prev => ({ ...prev, portfolioProjects: [...prev.portfolioProjects, { ...project, id: `project-${Date.now()}` }] }))
  const deletePortfolioProject = (id: string) => setData(prev => ({ ...prev, portfolioProjects: prev.portfolioProjects.filter(project => project.id !== id) }))
  const addNetworkingAction = (type: NetworkingActionType, templateId: string) => setData(prev => ({ ...prev, networkingActions: [...prev.networkingActions, { id: `contact-${Date.now()}`, type, templateId, date: selectedDate }] }))
  const updateReminders = (reminders: AppData['reminders']) => setData(prev => ({...prev,reminders}))
  const updateEveningReview = (patch: Partial<EveningReviewEntry>) => setData(prev => {
    const currentReview = prev.eveningReviews[selectedDate] ?? blankReview(selectedDate)
    const nextReview = { ...currentReview, ...patch }
    const entries = { ...prev.entries }
    const currentDay = entries[selectedDate] ?? blankEntry(selectedDate)
    if (nextReview.cravingReason === 'стресс') entries[selectedDate] = { ...currentDay, recoveryMode: true }
    const healthEntries = { ...prev.healthEntries }
    if (patch.alcohol !== undefined || patch.cigarettes !== undefined) {
      const currentHealth = healthEntries[selectedDate] ?? { date:selectedDate,weight:58,training:false,meals:4,water:2,sleepTime:'00:30',alcohol:false,cigarettes:0,energy:currentDay.energy }
      healthEntries[selectedDate] = { ...currentHealth, ...(patch.alcohol !== undefined ? { alcohol: patch.alcohol } : {}), ...(patch.cigarettes !== undefined ? { cigarettes: patch.cigarettes } : {}) }
    }
    if (patch.alcohol === true) {
      const tomorrowValue = new Date(`${selectedDate}T12:00:00`)
      tomorrowValue.setDate(tomorrowValue.getDate() + 1)
      const tomorrow = `${tomorrowValue.getFullYear()}-${String(tomorrowValue.getMonth()+1).padStart(2,'0')}-${String(tomorrowValue.getDate()).padStart(2,'0')}`
      entries[tomorrow] = { ...(entries[tomorrow] ?? blankEntry(tomorrow)), recoveryMode:true }
    }
    return { ...prev, entries, healthEntries, eveningReviews: { ...prev.eveningReviews, [selectedDate]: nextReview } }
  })
  let content: ReactNode
  if (active === 'plan') content = <DailyPlanModule entry={entry} update={update}/>
  else if (active === 'learning') content = <LearningModule date={selectedDate} onComplete={completeLearning}/>
  else if (active === 'skills') content = <SkillTreeModule progress={data.skillProgress} onStatusChange={changeSkillStatus}/>
  else if (active === 'nutrition') content = <NutritionPlan entry={entry}/>
  else if (active === 'mass') content = <MassGainModule date={selectedDate} entries={data.healthEntries} sportToday={entry.sport} onChange={updateHealth}/>
  else if (active === 'health') content = <HealthModule date={selectedDate} entries={data.healthEntries} onChange={updateHealth}/>
  else if (active === 'blog') content = <BlogModule date={selectedDate} published={data.publishedPosts} onPublish={publishPost}/>
  else if (active === 'portfolio') content = <PortfolioModule projects={data.portfolioProjects} onAdd={addPortfolioProject} onDelete={deletePortfolioProject}/>
  else if (active === 'networking') content = <NetworkingModule date={selectedDate} actions={data.networkingActions} onSend={addNetworkingAction}/>
  else if (active === 'anti-relapse') content = <AntiRelapseModule entry={entry} review={data.eveningReviews[selectedDate]} onChange={update}/>
  else if (active === 'evening') content = <EveningReviewModule review={eveningReview} entry={entry} onReviewChange={updateEveningReview} onEntryChange={update}/>
  else if (active === 'calendar') content = <CalendarModule data={data}/>
  else if (active === 'reminders') content = <RemindersModule settings={data.reminders} onChange={updateReminders}/>
  else if (active === 'sync') content = <SyncModule status={syncStatus} lastSyncedAt={lastSyncedAt} message={syncMessage} onSync={runCloudSync}/>
  else if (active === 'backup') content = <DataBackupModule/>
  else if (active === 'export') content = <ExportModule date={selectedDate} data={data}/>
  else content = null
  const dayProgress = Math.round([Boolean(entry.focus), Boolean(entry.work), entry.hours>0, entry.completed.length>0, Boolean(data.eveningReviews[selectedDate]?.completed)].filter(Boolean).length/5*100)
  const navigate = (value: string) => {
    const item = navigationItems.find(route => route.id === value || route.label === value)
    setActive(item?.id ?? value)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return <div className="min-h-screen">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-[#f5f5f3] p-4 dark:bg-[#0e0f0d] lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2 py-4"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 text-white dark:bg-acid dark:text-zinc-900"><Icons.TrendingUp size={20}/></span><div><b className="block text-sm">Daily Growth</b><span className="text-[10px] font-bold uppercase tracking-[.17em] text-zinc-400">Planner</span></div></div>
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">{navigationItems.map(item => { const Icon=iconMap[item.icon]; return <button key={item.id} onClick={()=>navigate(item.id)} className={cn('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] font-semibold transition', active===item.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-zinc-500 hover:bg-white/60 dark:hover:bg-zinc-900')}><Icon size={17}/>{item.label}</button>})}</nav>
      <div className="mt-3 rounded-2xl bg-zinc-900 p-4 text-white dark:bg-zinc-800"><div className="flex items-center justify-between gap-2 text-xs font-bold"><span className="flex items-center gap-2"><Icons.Flame size={16} className="text-orange-400"/>Сегодня</span><span>{dayProgress}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-700"><div className="h-full rounded-full bg-acid transition-all" style={{width:`${dayProgress}%`}}/></div><p className="mt-2 text-[10px] text-zinc-400">{Object.keys(data.entries).length} дней с записями</p></div>
    </aside>
    <header className="safe-header sticky top-0 z-20 border-b bg-[#f5f5f3]/90 px-4 pb-3 backdrop-blur-xl dark:bg-[#0e0f0d]/90 lg:ml-64 lg:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><button onClick={()=>navigate('План дня')} className="flex items-center gap-2 font-bold lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white dark:bg-acid dark:text-zinc-900"><Icons.TrendingUp size={17}/></span>Daily Growth</button><div className="hidden items-center gap-3 text-sm text-zinc-500 lg:flex"><span>Собери день → укрепи систему</span><span className="flex items-center gap-1.5 text-[11px]"><i className={`h-2 w-2 rounded-full ${storageOk?'bg-emerald-500':'bg-red-500'}`}/>{storageOk?'Сохранено локально':'Ошибка сохранения'}</span></div><div className="flex items-center gap-2"><button className="icon-button" onClick={()=>setDark(!dark)} aria-label="Сменить тему">{dark?<Icons.Sun size={18}/>:<Icons.Moon size={18}/>}</button><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cobalt to-purple-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20">ВГ</div></div></div></header>
    <main className="mobile-main lg:ml-64 lg:pb-10"><div className="mx-auto max-w-6xl px-4 py-7 md:px-8 md:py-10">{content}</div></main>
    {mobileMenu && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={()=>setMobileMenu(false)}><div className="absolute inset-x-3 bottom-24 max-h-[70vh] overflow-y-auto rounded-[28px] border bg-white p-3 shadow-2xl dark:bg-zinc-900" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between px-3 py-2"><b>Все разделы</b><button className="icon-button" onClick={()=>setMobileMenu(false)}><Icons.X size={18}/></button></div><div className="mt-2 grid grid-cols-2 gap-2">{menu.slice(4).map(([name,icon])=>{const Icon=iconMap[icon]; return <button key={name} onClick={()=>navigate(name)} className={cn('flex items-center gap-3 rounded-2xl border p-3 text-left text-xs font-semibold', active===name && 'border-zinc-900 bg-zinc-900 text-white dark:border-acid dark:bg-acid dark:text-zinc-900')}><Icon size={17}/>{name}</button>})}</div></div></div>}
    <nav className="mobile-dock fixed inset-x-3 z-40 grid grid-cols-5 rounded-[24px] border bg-white/95 p-2 shadow-2xl backdrop-blur dark:bg-zinc-900/95 lg:hidden">{menu.slice(0,4).map(([name, icon])=>{const Icon=iconMap[icon]; return <button key={name} onClick={()=>navigate(name)} className={cn('flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[9px] font-bold', active===name?'bg-zinc-900 text-white dark:bg-acid dark:text-zinc-900':'text-zinc-400')}><Icon size={18}/>{name==='Сегодня учимся'?'Учёба':name}</button>})}<button onClick={()=>setMobileMenu(!mobileMenu)} className={cn('flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[9px] font-bold', !menu.slice(0,4).some(x=>x[0]===active)?'bg-zinc-900 text-white dark:bg-acid dark:text-zinc-900':'text-zinc-400')}><Icons.Menu size={18}/>Ещё</button></nav>
  </div>
}
