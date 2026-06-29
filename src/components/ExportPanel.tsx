import { useState } from 'react'
import { CalendarRange, Check, Clipboard, Download, FileJson, FileText, Send } from 'lucide-react'
import { blankEntry } from '../data'
import type { AppData, DayEntry } from '../types'
import { generateDailyPlan } from '../utils/generateDailyPlan'

function planText(entry:DayEntry){const plan=generateDailyPlan(entry);return [`DAILY GROWTH · ${entry.date}`,`Фокус: ${entry.focus||'не указан'}`,`Работа: ${entry.work||'не указана'} · ${entry.hours} ч`,`Энергия: ${entry.energy}/10 · спорт: ${entry.sport?'да':'нет'} · риск: ${entry.alcoholRisk}`,'',`Режим: ${plan.mode}. ${plan.summary}`,'','РАСПИСАНИЕ',...plan.schedule.map(item=>`${item.time} — ${item.title}: ${item.details}`),'','ПИТАНИЕ',...plan.meals.map(meal=>`${meal.time} — ${meal.name}: ${meal.foods}`),'','АНТИ-СРЫВ',...plan.antiSlip.map(item=>`• ${item}`)].join('\n')}
function download(name:string,text:string,type='text/plain'){const blob=new Blob([text],{type:`${type};charset=utf-8`});const anchor=document.createElement('a');anchor.href=URL.createObjectURL(blob);anchor.download=name;anchor.click();URL.revokeObjectURL(anchor.href)}

export function ExportPanel({date,data}: {date:string;data:AppData}){
  const [copied,setCopied]=useState('')
  const entry=data.entries[date]??blankEntry(date),text=planText(entry)
  const copy=async(value:string,key:string)=>{try{await navigator.clipboard.writeText(value);setCopied(key)}catch{setCopied('')}}
  const telegram=()=>{const telegramText=`План на ${date}\n\n${text}`;window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(telegramText)}`,'_blank','noopener,noreferrer')}
  const exportWeek=()=>{const base=new Date(`${date}T12:00:00`);base.setDate(base.getDate()-((base.getDay()||7)-1));const parts=Array.from({length:7},(_,index)=>{const value=new Date(base);value.setDate(value.getDate()+index);const iso=value.toISOString().slice(0,10);return planText(data.entries[iso]??blankEntry(iso))});download(`daily-growth-week-${date}.txt`,parts.join('\n\n====================\n\n'))}
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Action icon={Clipboard} title="Скопировать план" text="Полный план дня в буфер обмена." onClick={()=>copy(text,'plan')} done={copied==='plan'}/>
    <Action icon={Send} title="Экспорт в Telegram" text="Открыть готовый текст в окне отправки Telegram." onClick={telegram}/>
    <Action icon={FileText} title="Экспорт в текст" text="Скачать текущий план в формате .txt." onClick={()=>download(`daily-growth-${date}.txt`,text)}/>
    <Action icon={CalendarRange} title="Экспорт недели" text="Скачать семь планов одним текстовым файлом." onClick={exportWeek}/>
    <Action icon={FileJson} title="Резервная копия JSON" text="Все записи, прогресс и настройки приложения." onClick={()=>download(`daily-growth-backup-${date}.json`,JSON.stringify(data,null,2),'application/json')}/>
    <Action icon={Download} title="Текст для Telegram" text="Скопировать короткий Telegram-формат без открытия приложения." onClick={()=>copy(`Мой план на ${date}\n\n${text}`,'telegram')} done={copied==='telegram'}/>
  </div>
}

function Action({icon:Icon,title,text,onClick,done=false}:{icon:typeof Clipboard;title:string;text:string;onClick:()=>void;done?:boolean}){return <button onClick={onClick} className="card flex min-h-52 flex-col text-left transition hover:-translate-y-0.5 hover:border-zinc-400"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${done?'bg-emerald-500 text-white':'bg-acid text-zinc-900'}`}>{done?<Check/>:<Icon/>}</span><h2 className="mt-6 text-lg font-bold">{done?'Готово':title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">{text}</p><span className="mt-5 text-xs font-bold text-cobalt">Выполнить →</span></button>}
