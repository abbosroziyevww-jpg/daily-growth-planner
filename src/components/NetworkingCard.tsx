import { useState } from 'react'
import { Check, Clipboard, MessageCircle, RefreshCw, Send, UserRound, UsersRound } from 'lucide-react'
import { messageTemplates } from '../data/messageTemplates'
import type { NetworkingAction, NetworkingActionType } from '../types'

function weekStart(date:string){const value=new Date(`${date}T12:00:00`);value.setDate(value.getDate()-((value.getDay()||7)-1));return value.toISOString().slice(0,10)}

export function NetworkingCard({date,actions,onSend}:{date:string;actions:NetworkingAction[];onSend:(type:NetworkingActionType,templateId:string)=>void}){
  const [index,setIndex]=useState(0)
  const [copied,setCopied]=useState(false)
  const template=messageTemplates[index%messageTemplates.length]
  const week=actions.filter(action=>weekStart(action.date)===weekStart(date))
  const counts={client:week.filter(a=>a.type==='client').length,director:week.filter(a=>a.type==='director').length,followup:week.filter(a=>a.type==='followup').length}
  const copy=async()=>{try{await navigator.clipboard.writeText(template.text);setCopied(true)}catch{setCopied(false)}}
  const next=()=>{setIndex(value=>value+1);setCopied(false)}
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-3"><Goal icon={UsersRound} label="Клиентам" value={counts.client} goal={2}/><Goal icon={UserRound} label="Режиссёрам" value={counts.director} goal={2}/><Goal icon={RefreshCw} label="Старый контакт" value={counts.followup} goal={1}/></div>
    <div className="card overflow-hidden p-0 md:p-0"><div className="bg-zinc-900 p-6 text-white md:p-8"><div className="flex items-center justify-between"><span className="rounded-full bg-acid px-3 py-1.5 text-xs font-bold text-zinc-900">{template.audience}</span><span className="text-xs text-zinc-400">ШАБЛОН {index%messageTemplates.length+1}/{messageTemplates.length}</span></div><h2 className="mt-6 text-2xl font-extrabold">{template.title}</h2></div><div className="p-6 md:p-8"><p className="whitespace-pre-line text-sm leading-7 text-zinc-600 dark:text-zinc-300">{template.text}</p><p className="mt-5 text-xs text-zinc-400">Замени текст в [скобках] конкретными деталями — персонализация важнее идеальной формулировки.</p></div></div>
    <div className="grid gap-3 sm:grid-cols-3"><button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-4 text-sm font-bold dark:bg-zinc-900">{copied?<Check size={18}/>:<Clipboard size={18}/>} {copied?'Скопировано':'Копировать'}</button><button onClick={()=>onSend(template.type,template.id)} className="flex items-center justify-center gap-2 rounded-2xl bg-cobalt px-4 py-4 text-sm font-bold text-white"><Send size={18}/>Отметить отправленным</button><button onClick={next} className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"><MessageCircle size={18}/>Другой шаблон</button></div>
  </div>
}

function Goal({icon:Icon,label,value,goal}:{icon:typeof UsersRound;label:string;value:number;goal:number}){const done=value>=goal;return <div className="card"><div className="flex items-center justify-between"><Icon className={done?'text-emerald-500':'text-cobalt'}/>{done&&<Check className="text-emerald-500" size={18}/>}</div><p className="mt-5 text-3xl font-extrabold">{value} <span className="text-base text-zinc-400">/ {goal}</span></p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</p><div className="mt-4 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${done?'bg-emerald-500':'bg-cobalt'}`} style={{width:`${Math.min(100,value/goal*100)}%`}}/></div></div>}
