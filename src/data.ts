import type { DayEntry, HealthEntry } from './types'

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const blankEntry = (date = todayISO()): DayEntry => ({
  date, hours: 0, work: '', energy: 7, focus: '', alcoholRisk: 'Низкий', sport: false, comment: '', completed: [],
})

export const blankHealthEntry = (date = todayISO()): HealthEntry => ({
  date, weight: 58, training: false, meals: 4, water: 2, sleepTime: '00:30', alcohol: false, cigarettes: 0, energy: 7,
})

export const menu = [
  ['План дня', 'LayoutDashboard'], ['Сегодня учимся', 'GraduationCap'], ['Skill Tree', 'GitBranch'],
  ['Питание', 'Utensils'], ['Набор массы', 'Dumbbell'], ['Здоровье', 'HeartPulse'],
  ['Блог', 'Clapperboard'], ['Портфолио', 'BriefcaseBusiness'], ['Нетворкинг', 'Users'],
  ['Анти-срыв', 'ShieldCheck'], ['Вечерний разбор', 'MoonStar'], ['Календарь прогресса', 'CalendarDays'],
  ['Напоминания', 'Bell'], ['Аккаунт и синхронизация', 'Cloud'], ['Данные и резервная копия', 'Archive'], ['Экспорт', 'Download'],
] as const

export const schedule = [
  { time: '08:00', title: 'Старт и планирование', tag: 'Фокус', color: 'bg-[#dbe5ff]' },
  { time: '10:00', title: 'Глубокая работа', tag: 'Проекты', color: 'bg-[#dff4d7]' },
  { time: '14:00', title: 'Развитие навыка', tag: 'Учёба', color: 'bg-[#f7e3c1]' },
  { time: '18:30', title: 'Спорт и восстановление', tag: 'Здоровье', color: 'bg-[#eadcf7]' },
]

export const skills = [
  { name: 'Операторское мастерство', level: 4, max: 10, color: 'bg-cobalt' },
  { name: 'Колористика', level: 6, max: 10, color: 'bg-purple-500' },
  { name: 'Личный бренд', level: 3, max: 10, color: 'bg-orange-400' },
  { name: 'Продажи и корпораты', level: 2, max: 10, color: 'bg-emerald-500' },
]
