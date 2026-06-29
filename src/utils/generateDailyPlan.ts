import type { DayEntry } from '../types'

export type PlanCategory = 'Работа' | 'Питание' | 'Обучение' | 'Здоровье' | 'Развитие' | 'Защита' | 'Итоги'

export interface ScheduleItem {
  time: string
  title: string
  details: string
  category: PlanCategory
}

export interface MealItem {
  time: string
  name: string
  foods: string
  note: string
  kind: 'regular' | 'pre-workout' | 'post-workout'
}

export interface GeneratedDailyPlan {
  mode: 'Мягкий' | 'Обычный' | 'Интенсивный'
  summary: string
  schedule: ScheduleItem[]
  meals: MealItem[]
  learning: string
  movement: string
  growth: string
  antiSlip: string[]
  eveningReview: string[]
}

const baseMeals: MealItem[] = [
  { time: '08:00', name: 'Завтрак', foods: 'Яйца, овсянка, банан', note: 'Белок и медленные углеводы для ровной энергии', kind: 'regular' },
  { time: '11:00', name: 'Перекус', foods: 'Творог, йогурт, орехи', note: 'Не допустить провала энергии до обеда', kind: 'regular' },
  { time: '14:00', name: 'Обед', foods: 'Рис или гречка, курица, салат', note: 'Основной плотный приём пищи', kind: 'regular' },
  { time: '17:00', name: 'Перекус', foods: 'Банан, кефир, орехи', note: 'Удобно взять с собой на съёмку', kind: 'regular' },
  { time: '20:30', name: 'Ужин', foods: 'Макароны или картошка, мясо или рыба, салат', note: 'Восстановление и калорийный профицит', kind: 'regular' },
  { time: '23:00', name: 'Перед сном', foods: 'Творог или кефир, немного орехов', note: 'Лёгкий белковый приём пищи', kind: 'regular' },
]

export function generateDailyPlan(entry: DayEntry): GeneratedDailyPlan {
  const lowEnergy = entry.energy <= 4 || entry.recoveryMode === true || entry.alcoholRisk === 'Высокий'
  const highEnergy = entry.energy >= 8
  const mode: GeneratedDailyPlan['mode'] = lowEnergy ? 'Мягкий' : highEnergy ? 'Интенсивный' : 'Обычный'
  const workHours = Math.max(1, Math.min(entry.hours || 4, lowEnergy ? 4 : 8))
  const workTitle = entry.focus || entry.work || 'Главная рабочая задача'
  const learningMinutes = lowEnergy ? 20 : highEnergy ? 60 : 40

  const meals = baseMeals.map(meal => ({ ...meal }))
  if (entry.sport) {
    const lunch = meals.find(meal => meal.name === 'Обед')
    if (lunch) {
      lunch.foods = 'Большая порция риса или макарон, курица или мясо, салат и хлеб'
      lunch.note = 'Более плотный обед: запас энергии для тренировки и профицит калорий'
    }
    meals.push(
      { time: '18:00', name: 'До тренировки', foods: 'Банан, йогурт или овсянка', note: 'Лёгкие углеводы за 60–90 минут', kind: 'pre-workout' },
      { time: '20:00', name: 'После тренировки', foods: 'Рис, курица или рыба', note: 'Белок и углеводы для восстановления', kind: 'post-workout' },
    )
  }
  meals.sort((a, b) => a.time.localeCompare(b.time))

  const schedule: ScheduleItem[] = [
    { time: '07:45', title: 'Спокойный старт', details: 'Вода, короткая разминка, сверка фокуса дня', category: 'Здоровье' },
    { time: '08:00', title: 'Завтрак', details: 'Яйца, овсянка и банан', category: 'Питание' },
    { time: '09:00', title: workTitle, details: lowEnergy ? 'Один спокойный блок без многозадачности' : `Глубокая работа · ориентир ${workHours} ч за день`, category: 'Работа' },
    { time: '11:00', title: 'Перекус и пауза', details: 'Творог или йогурт, пройтись 5 минут', category: 'Питание' },
    { time: '12:00', title: 'Развитие навыка', details: `${learningMinutes} минут практики: свет, камера или цвет`, category: 'Обучение' },
    { time: '14:00', title: 'Обед', details: 'Крупа, белок и овощи', category: 'Питание' },
    { time: '15:00', title: lowEnergy ? 'Лёгкие рабочие задачи' : 'Второй рабочий блок', details: lowEnergy ? 'Ответы, организация файлов, подготовка' : entry.work || 'Проектная работа и коммуникация', category: 'Работа' },
    { time: '17:30', title: 'Личный бренд и связи', details: lowEnergy ? 'Одно короткое полезное сообщение' : 'Пост, backstage или контакт с потенциальным клиентом', category: 'Развитие' },
    { time: '19:00', title: entry.sport ? 'Тренировка' : lowEnergy ? 'Восстановление' : 'Активное восстановление', details: entry.sport ? 'Силовая тренировка без отказных подходов' : 'Прогулка, растяжка и душ', category: 'Здоровье' },
    { time: '22:15', title: 'Вечерний разбор', details: 'Победа, урок и один фокус на завтра', category: 'Итоги' },
  ]

  if (entry.alcoholRisk === 'Высокий') {
    schedule.splice(-1, 0, { time: '20:45', title: 'Анти-срыв протокол', details: 'Поесть, душ, прогулка, сообщение человеку. Алкоголь не покупать', category: 'Защита' })
  }

  const antiSlip = entry.alcoholRisk === 'Высокий'
    ? ['Плотно поесть до вечера', 'Принять тёплый душ', 'Выйти на прогулку на 20 минут', 'Не заходить в магазин и не покупать алкоголь', 'Написать или позвонить своему человеку']
    : entry.alcoholRisk === 'Средний'
      ? ['Не оставаться голодным вечером', 'Запланировать прогулку или фильм', 'Не держать алкоголь дома']
      : ['Ужин по плану', 'Короткая прогулка', 'Закрыть день без лишних решений']

  return {
    mode,
    summary: lowEnergy
      ? entry.recoveryMode ? 'Мягкий день восстановления: вода, нормальная еда, сон и лёгкая прогулка. Без наказаний и перегруза.' : 'Сегодня бережём ресурс: один главный результат, короткая учёба и восстановление.'
      : highEnergy
        ? 'Энергии много: используем её на глубокую работу и сильную практику, но сохраняем питание и паузы.'
        : 'Ровный день: работа, рост навыка, питание и восстановление без перегруза.',
    schedule,
    meals,
    learning: `${learningMinutes} минут: разбор референса и одна практическая попытка по операторскому мастерству или цвету.`,
    movement: entry.sport ? 'Тренировка + обязательное питание до и после.' : lowEnergy ? 'Прогулка 20–30 минут, растяжка и ранний сон.' : 'Прогулка 40 минут или лёгкая мобильность.',
    growth: lowEnergy ? 'Написать одному полезному контакту.' : 'Опубликовать короткий backstage или сделать два тёплых касания по нетворкингу.',
    antiSlip,
    eveningReview: ['Что сегодня получилось?', 'Что забрало или добавило энергию?', 'Какой один фокус поставить на завтра?'],
  }
}
