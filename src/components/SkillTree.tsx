import { Award, CalendarClock, CheckCircle2, Circle, Gauge, Sprout } from 'lucide-react'
import { skillTree, type SkillDefinition } from '../data/skillTree'
import type { SkillProgress, SkillStatus } from '../types'

interface SkillTreeProps {
  progress: Record<string, SkillProgress>
  onStatusChange: (skillId: string, status: SkillStatus) => void
}

const statusInfo: Record<SkillStatus, { label: string; color: string }> = {
  not_started: { label: 'Не начат', color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800' },
  learning: { label: 'Изучаю', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  practiced: { label: 'Практикую', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  mastered: { label: 'Освоено', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
}
const statuses: SkillStatus[] = ['not_started', 'learning', 'practiced', 'mastered']

export function SkillTreeView({ progress, onStatusChange }: SkillTreeProps) {
  const resolved = skillTree.map(skill => ({ ...skill, ...(progress[skill.id] ?? {}) }))
  const totalPractices = resolved.reduce((sum, skill) => sum + skill.practices, 0)
  return <>
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Metric icon={Gauge} value="Middle" label="Текущий уровень"/>
      <Metric icon={Award} value="Strong" label="Ближайшая цель"/>
      <Metric icon={Sprout} value={String(totalPractices)} label="Всего практик"/>
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      {resolved.map(skill => <SkillCard key={skill.id} skill={skill} onStatusChange={onStatusChange}/>) }
    </div>
  </>
}

function Metric({ icon: Icon, value, label }: { icon: typeof Gauge; value: string; label: string }) {
  return <div className="card flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-acid text-zinc-900"><Icon size={20}/></span><div><b className="text-xl">{value}</b><p className="text-xs text-zinc-500">{label}</p></div></div>
}

function SkillCard({ skill, onStatusChange }: { skill: SkillDefinition; onStatusChange: (id: string, status: SkillStatus) => void }) {
  const status = statusInfo[skill.status]
  const date = skill.lastPracticed ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(`${skill.lastPracticed}T12:00:00`)) : 'ещё не было'
  const levelBase = { Beginner: 25, Middle: 50, Strong: 75, Pro: 100 }[skill.level]
  const levelProgress = skill.status === 'mastered' ? 100 : Math.min(skill.target === 'Strong' ? 74 : 99, levelBase + skill.practices * 2.5)
  return <div className="card">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-zinc-400">{skill.category} · {skill.id}</p><h3 className="mt-2 text-lg font-bold">{skill.name}</h3></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.color}`}>{status.label}</span></div>
    <div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"><div className="flex items-center justify-between text-xs font-bold"><span>{skill.level} · {Math.round(levelProgress)}%</span><span className="text-cobalt">Цель: {skill.target}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"><div className="h-full rounded-full bg-gradient-to-r from-cobalt to-purple-500 transition-all" style={{width:`${levelProgress}%`}}/></div></div>
    <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500"><span className="flex items-center gap-1.5"><CheckCircle2 size={15}/>{skill.practices} практик</span><span className="flex items-center gap-1.5"><CalendarClock size={15}/>Последняя: {date}</span></div>
    <div className="mt-5 flex flex-wrap gap-1.5">{statuses.map(item => <button key={item} title={statusInfo[item].label} onClick={() => onStatusChange(skill.id, item)} className={`flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition ${skill.status === item ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>{skill.status === item ? <CheckCircle2 size={12}/> : <Circle size={12}/>}<span className="hidden sm:inline">{statusInfo[item].label}</span></button>)}</div>
  </div>
}
