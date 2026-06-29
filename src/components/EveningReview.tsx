import { Check, Cigarette, GlassWater, Lightbulb, MoonStar, Save } from 'lucide-react'
import type { CravingReason, EveningReviewEntry } from '../types'

interface EveningReviewProps {
  review: EveningReviewEntry
  onChange: (patch: Partial<EveningReviewEntry>) => void
}

const reasons: Exclude<CravingReason,''>[] = ['скучно','стресс','усталость','одиночество','друзья','другое']
const cn=(...values:Array<string|false>)=>values.filter(Boolean).join(' ')

export function EveningReview({review,onChange}:EveningReviewProps){
  return <div className="space-y-4">
    <div className="card bg-zinc-900 text-white dark:bg-zinc-800"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500"><MoonStar/></span><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Закрытие дня</p><h2 className="mt-1 text-2xl font-extrabold">Без суда — только факты и выводы</h2></div></div></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <TextArea label="Что сегодня сделал хорошо?" value={review.didWell} onChange={didWell=>onChange({didWell})}/>
      <TextArea label="Что не получилось?" value={review.didNotWork} onChange={didNotWork=>onChange({didNotWork})}/>
      <TextArea label="Почему не получилось?" value={review.whyNot} onChange={whyNot=>onChange({whyNot})}/>
      <TextArea label="Что завтра сделать проще?" value={review.easierTomorrow} onChange={easierTomorrow=>onChange({easierTomorrow})}/>
    </div>
    <div className="card"><div className="grid gap-6 lg:grid-cols-2"><ToggleField icon={GlassWater} label="Был ли алкоголь сегодня?" value={review.alcohol} onChange={alcohol=>onChange({alcohol})}/><ToggleField icon={Lightbulb} label="Было ли желание выпить?" value={review.craving} onChange={craving=>onChange({craving, ...(!craving?{cravingReason:'' as const}:{})})}/></div>{review.craving&&<div className="mt-6 border-t pt-5"><p className="label">Причина желания</p><div className="flex flex-wrap gap-2">{reasons.map(reason=><button key={reason} onClick={()=>onChange({cravingReason:reason})} className={cn('chip capitalize',review.cravingReason===reason&&'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900')}>{reason}</button>)}</div></div>}</div>
    <div className="grid gap-4 lg:grid-cols-[.35fr_.65fr]"><label className="card"><span className="mb-3 flex items-center gap-2"><Cigarette size={18} className="text-cobalt"/><span className="label mb-0">Курение · количество</span></span><input className="field" min="0" max="100" type="number" value={review.cigarettes} onChange={event=>onChange({cigarettes:Math.max(0,Number(event.target.value))})}/></label><TextArea label="Главный урок дня" value={review.mainLesson} onChange={mainLesson=>onChange({mainLesson})}/></div>
    <button onClick={()=>onChange({completed:true})} className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold ${review.completed?'bg-emerald-500 text-white':'bg-cobalt text-white'}`}>{review.completed?<Check size={18}/>:<Save size={18}/>} {review.completed?'Разбор сохранён':'Завершить вечерний разбор'}</button>
  </div>
}

function TextArea({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="card"><span className="label">{label}</span><textarea className="field min-h-28" value={value} onChange={event=>onChange(event.target.value)} placeholder="Одно честное предложение…"/></label>}
function ToggleField({icon:Icon,label,value,onChange}:{icon:typeof GlassWater;label:string;value:boolean;onChange:(value:boolean)=>void}){return <div><div className="mb-3 flex items-center gap-2"><Icon size={18} className="text-cobalt"/><p className="label mb-0">{label}</p></div><div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">{[[true,'Да'],[false,'Нет']].map(([option,text])=><button key={text as string} onClick={()=>onChange(option as boolean)} className={cn('rounded-xl px-4 py-2.5 text-sm font-semibold',value===option?'bg-white shadow-sm dark:bg-zinc-700':'text-zinc-500')}>{text as string}</button>)}</div></div>}
