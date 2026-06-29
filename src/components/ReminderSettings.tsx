import { Bell, BellRing, Check, Clipboard, Clock3 } from 'lucide-react'
import type { ReminderSetting } from '../types'

export const defaultReminders:ReminderSetting[]=[
  {id:'morning',title:'План дня',message:'Доброе утро. Выбери один главный фокус, оцени энергию и собери план дня.',time:'08:00',days:[1,2,3,4,5,6,0],enabled:true},
  {id:'after_work',title:'После работы',message:'Работа закончена. Нормально поешь, прими душ, не покупай алкоголь и дай голове выдохнуть.',time:'19:00',days:[1,2,3,4,5,6,0],enabled:true},
  {id:'learning',title:'Обучение',message:'20–30 минут практики сегодня уже считаются. Открой тему дня и сделай одну попытку.',time:'20:00',days:[1,2,3,4,5,6,0],enabled:true},
  {id:'review',title:'Вечерний разбор',message:'Закрой день спокойно: победа, трудность, причина и один простой шаг на завтра.',time:'23:15',days:[1,2,3,4,5,6,0],enabled:true},
  {id:'blog',title:'Контент для блога',message:'Сегодня день публикации. Возьми готовую идею, адаптируй под свой голос и сними короткий Reels.',time:'18:00',days:[2,5],enabled:true},
  {id:'sport',title:'Спорт',message:'Тренировка сегодня. Подготовь перекус, воду и еду после зала.',time:'17:30',days:[1,3,6],enabled:true},
]

const dayNames=['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

export function ReminderSettings({settings,onChange}:{settings:ReminderSetting[];onChange:(settings:ReminderSetting[])=>void}){
  const update=(id:string,patch:Partial<ReminderSetting>)=>onChange(settings.map(item=>item.id===id?{...item,...patch}:item))
  const copyAll=async()=>{const text=settings.filter(item=>item.enabled).map(item=>`${item.time} · ${item.title}\n${item.message}`).join('\n\n');try{await navigator.clipboard.writeText(text)}catch{/* Буфер может быть недоступен без разрешения */}}
  const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes()
  const active=settings.filter(item=>item.enabled&&item.days.includes(now.getDay())).map(item=>({...item,diff:Number(item.time.slice(0,2))*60+Number(item.time.slice(3))-nowMinutes})).filter(item=>item.diff>=-30&&item.diff<=60)
  return <div className="space-y-4">
    {active.length>0&&<div className="card border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20"><div className="flex items-start gap-3"><BellRing className="shrink-0 text-cobalt"/><div><p className="label">Актуально сейчас</p>{active.map(item=><div key={item.id}><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-sm leading-6 text-zinc-500">{item.message}</p></div>)}</div></div></div>}
    <div className="grid gap-4 lg:grid-cols-2">{settings.map(item=><div key={item.id} className={`card ${item.enabled?'':'opacity-60'}`}><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${item.enabled?'bg-acid text-zinc-900':'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}><Bell size={19}/></span><button onClick={()=>update(item.id,{enabled:!item.enabled})} className={`relative h-7 w-12 rounded-full transition ${item.enabled?'bg-cobalt':'bg-zinc-300 dark:bg-zinc-700'}`}><i className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.enabled?'left-6':'left-1'}`}/></button></div><h2 className="mt-5 text-lg font-bold">{item.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500">{item.message}</p><div className="mt-4 flex items-center gap-3"><Clock3 size={16} className="text-zinc-400"/><input type="time" value={item.time} onChange={event=>update(item.id,{time:event.target.value})} className="field w-32 py-2"/><div className="flex flex-wrap gap-1">{dayNames.map((day,index)=><button key={day} onClick={()=>update(item.id,{days:item.days.includes(index)?item.days.filter(value=>value!==index):[...item.days,index]})} className={`grid h-7 w-7 place-items-center rounded-full text-[9px] font-bold ${item.days.includes(index)?'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900':'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>{day}</button>)}</div></div></div>)}</div>
    <button onClick={copyAll} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-4 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"><Clipboard size={18}/>Скопировать напоминания для Telegram</button>
    <div className="card flex gap-3"><Check className="shrink-0 text-emerald-500"/><p className="text-sm leading-6 text-zinc-500">Напоминания работают внутри приложения, пока оно открыто. Настройки времени и дней сохраняются локально.</p></div>
  </div>
}
