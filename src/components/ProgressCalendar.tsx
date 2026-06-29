import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Circle, Footprints, GraduationCap, MoonStar, Salad, ShieldCheck } from 'lucide-react'
import type { DayEntry, EveningReviewEntry, HealthEntry, SkillProgress } from '../types'

interface ProgressCalendarProps {
  entries: Record<string, DayEntry>
  healthEntries: Record<string, HealthEntry>
  reviews: Record<string, EveningReviewEntry>
  skillProgress: Record<string, SkillProgress>
}

type DayStatus = 'green' | 'yellow' | 'red' | 'future'
const statusStyle: Record<DayStatus,string> = { green:'bg-emerald-500 text-white', yellow:'bg-amber-300 text-zinc-900', red:'bg-red-400 text-white', future:'text-zinc-300 dark:text-zinc-700' }

function isoDate(year:number,month:number,day:number){return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}
function localToday(){const now=new Date();return isoDate(now.getFullYear(),now.getMonth(),now.getDate())}

export function ProgressCalendar({entries,healthEntries,reviews,skillProgress}:ProgressCalendarProps){
  const [cursor,setCursor]=useState(new Date())
  const [selected,setSelected]=useState(localToday)
  const year=cursor.getFullYear(),month=cursor.getMonth()
  const days=new Date(year,month+1,0).getDate(),offset=(new Date(year,month,1).getDay()+6)%7
  const monthName=new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(cursor)
  const practices=useMemo(()=>Object.values(skillProgress).map(item=>item.lastPracticed).filter(Boolean),[skillProgress])
  const signals=(date:string)=>{
    const day=entries[date],health=healthEntries[date],review=reviews[date]
    const alcoholKnown=Boolean(health||review)
    const noAlcohol=alcoholKnown && !health?.alcohol && !review?.alcohol
    const learning=practices.includes(date)||Boolean(day?.completed.some(item=>/обуч|навык|практик/i.test(item)))
    const food=Boolean(health&&health.meals>=3&&health.meals<=5)
    const movement=Boolean(health?.training||day?.sport||day?.completed.some(item=>/прогул|тренир|движ/i.test(item)))
    const evening=Boolean(review?.completed)
    const alcohol=Boolean(health?.alcohol||review?.alcohol)
    return {noAlcohol,learning,food,movement,evening,alcohol}
  }
  const status=(date:string):DayStatus=>{if(date>localToday())return 'future';const value=signals(date);if(value.alcohol)return'red';const count=[value.noAlcohol,value.learning,value.food,value.movement,value.evening].filter(Boolean).length;return count===5?'green':count>0?'yellow':'red'}
  const detail=signals(selected),detailItems=[['Не пить алкоголь',detail.noAlcohol,ShieldCheck],['20+ минут обучения',detail.learning,GraduationCap],['Нормальная еда',detail.food,Salad],['10 минут движения',detail.movement,Footprints],['Вечерняя отметка',detail.evening,MoonStar]] as const
  return <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
    <div className="card"><div className="mb-6 flex items-center justify-between"><button className="icon-button" onClick={()=>setCursor(new Date(year,month-1))}><ChevronLeft size={18}/></button><h2 className="text-lg font-bold capitalize">{monthName}</h2><button className="icon-button" onClick={()=>setCursor(new Date(year,month+1))}><ChevronRight size={18}/></button></div><div className="grid grid-cols-7 gap-1 text-center">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day=><div key={day} className="pb-2 text-[10px] font-bold text-zinc-400">{day}</div>)}{Array.from({length:offset}).map((_,index)=><div key={`e-${index}`}/>)}{Array.from({length:days},(_,index)=>index+1).map(day=>{const date=isoDate(year,month,day),dayStatus=status(date);return <button key={date} onClick={()=>setSelected(date)} className={`mx-auto grid aspect-square w-full max-w-12 place-items-center rounded-xl text-sm font-bold transition ${statusStyle[dayStatus]} ${selected===date?'ring-2 ring-cobalt ring-offset-2 dark:ring-offset-zinc-900':''}`}>{day}</button>})}</div><div className="mt-6 flex flex-wrap gap-4 border-t pt-5 text-xs text-zinc-500"><Legend color="bg-emerald-500" text="Минимум выполнен"/><Legend color="bg-amber-300" text="Частично"/><Legend color="bg-red-400" text="Срыв / ничего"/></div></div>
    <div className="card"><p className="label">{new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${selected}T12:00:00`))}</p><h2 className="text-xl font-bold">Минимум дня</h2><div className="mt-5 space-y-2">{detailItems.map(([label,done,Icon])=><div key={label} className={`flex items-center gap-3 rounded-2xl border p-4 ${done?'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20':''}`}><Icon size={18} className={done?'text-emerald-600':'text-zinc-400'}/><span className="flex-1 text-sm font-semibold">{label}</span>{done?<Check size={17} className="text-emerald-600"/>:<Circle size={17} className="text-zinc-300"/>}</div>)}</div>{detail.alcohol&&<p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700 dark:bg-red-950/20 dark:text-red-300">Был алкоголь — день отмечен красным. Это данные для восстановления, а не повод ругать себя.</p>}</div>
  </div>
}

function Legend({color,text}:{color:string;text:string}){return <span className="flex items-center gap-2"><i className={`h-3 w-3 rounded ${color}`}/>{text}</span>}
