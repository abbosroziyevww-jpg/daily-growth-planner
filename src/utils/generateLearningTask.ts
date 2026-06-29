import { learningTopics, type LearningCategory, type LearningTopic } from '../data/learningTopics'

export interface LearningTask extends LearningTopic {
  dayLabel: string
  duration: 90
  skillId: string
}

const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
const categoryByDay: Partial<Record<number, LearningCategory>> = {
  1: 'color', 2: 'camera', 3: 'editing', 4: 'directing', 5: 'brand', 6: 'camera',
}

function dateHash(date: string) {
  return [...date].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
}

export function generateLearningTask(date: string, alternative = 0): LearningTask {
  const day = new Date(`${date}T12:00:00`).getDay()

  if (day === 0) {
    const references = learningTopics.filter(topic => ['camera', 'color', 'directing'].includes(topic.category))
    const reference = references[(dateHash(date) + alternative) % references.length]
    return {
      ...reference,
      id: `weekly-${reference.id}`,
      direction: 'Разбор недели + референсы',
      title: `Недельный разбор: ${reference.title}`,
      theory: 'Рост закрепляется, когда практика превращается в выводы. Сравни результат недели с сильным референсом и назови одно конкретное улучшение.',
      watch: `Пересмотри свои материалы недели и затем изучи референс по теме «${reference.title}».`,
      practice: 'Выбери три результата недели: удачный, средний и слабый. Разбери решения и составь план одной повторной попытки.',
      criterion: 'Есть три честных наблюдения, один измеримый вывод и выбран фокус следующей недели.',
      portfolio: 'Сохрани страницу недельного разбора и лучший кадр или фрагмент недели.',
      dayLabel: weekdays[day], duration: 90, skillId: 'directing',
    }
  }

  const category = categoryByDay[day] ?? 'money'
  const pool = learningTopics.filter(topic => topic.category === category)
  const topic = pool[(dateHash(date) + alternative) % pool.length]

  if (day === 6) {
    return {
      ...topic,
      direction: 'Практика съёмки + портфолио',
      practice: `${topic.practice} Собери результат в законченную сцену, а не отдельный тест.`,
      criterion: `${topic.criterion} Материал должен быть готов к показу потенциальному корпоративному клиенту.`,
      portfolio: 'Сохрани финальный ролик 20–30 секунд, 3 лучших стоп-кадра, BTS и короткое описание задачи.',
      dayLabel: weekdays[day], duration: 90, skillId: 'camera',
    }
  }

  return { ...topic, dayLabel: weekdays[day], duration: 90, skillId: topic.category }
}
