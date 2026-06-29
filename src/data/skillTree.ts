import type { SkillLevel, SkillStatus } from '../types'

export interface SkillDefinition {
  id: string
  name: string
  category: string
  level: SkillLevel
  status: SkillStatus
  practices: number
  lastPracticed: string | null
  target: SkillLevel
}

export const skillTree: SkillDefinition[] = [
  { id: 'color', name: 'Колористика / DaVinci Resolve', category: 'Постпродакшн', level: 'Middle', target: 'Strong', status: 'learning', practices: 0, lastPracticed: null },
  { id: 'camera', name: 'Оператор-постановщик', category: 'Съёмка', level: 'Middle', target: 'Strong', status: 'learning', practices: 0, lastPracticed: null },
  { id: 'editing', name: 'Монтаж и анимация', category: 'Постпродакшн', level: 'Middle', target: 'Strong', status: 'learning', practices: 0, lastPracticed: null },
  { id: 'directing', name: 'Постановка и режиссура', category: 'Режиссура', level: 'Middle', target: 'Strong', status: 'not_started', practices: 0, lastPracticed: null },
  { id: 'brand', name: 'Личный бренд', category: 'Продвижение', level: 'Middle', target: 'Strong', status: 'learning', practices: 0, lastPracticed: null },
  { id: 'money', name: 'Деньги и клиенты', category: 'Бизнес', level: 'Middle', target: 'Strong', status: 'not_started', practices: 0, lastPracticed: null },
  { id: 'health', name: 'Здоровье и дисциплина', category: 'Основа', level: 'Middle', target: 'Strong', status: 'practiced', practices: 0, lastPracticed: null },
]
