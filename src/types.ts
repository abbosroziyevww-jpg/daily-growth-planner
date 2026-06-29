export type Risk = 'Низкий' | 'Средний' | 'Высокий'

export interface DayEntry {
  date: string
  hours: number
  work: string
  energy: number
  focus: string
  alcoholRisk: Risk
  sport: boolean
  comment: string
  completed: string[]
  recoveryMode?: boolean
}

export interface AppData {
  entries: Record<string, DayEntry>
  weight: number
  habits: Record<string, boolean>
  skillProgress: Record<string, SkillProgress>
  healthEntries: Record<string, HealthEntry>
  publishedPosts: PublishedPost[]
  portfolioProjects: PortfolioProject[]
  networkingActions: NetworkingAction[]
  eveningReviews: Record<string, EveningReviewEntry>
  reminders: ReminderSetting[]
}

export type ReminderKind = 'morning' | 'after_work' | 'learning' | 'review' | 'blog' | 'sport'

export interface ReminderSetting {
  id: ReminderKind
  title: string
  message: string
  time: string
  days: number[]
  enabled: boolean
}

export type CravingReason = '' | 'скучно' | 'стресс' | 'усталость' | 'одиночество' | 'друзья' | 'другое'

export interface EveningReviewEntry {
  date: string
  didWell: string
  didNotWork: string
  whyNot: string
  alcohol: boolean
  craving: boolean
  cravingReason: CravingReason
  cigarettes: number
  easierTomorrow: string
  mainLesson: string
  completed: boolean
}

export interface PublishedPost {
  id: string
  ideaId: string
  date: string
}

export type PortfolioCategory = 'bank projects' | 'corporate videos' | 'interviews' | 'reels' | 'color grading before/after' | 'camera work' | 'animation / titles'

export interface PortfolioProject {
  id: string
  category: PortfolioCategory
  title: string
  client: string
  role: string
  work: string
  link: string
  strengths: string
  improve: string
  showreel: boolean
}

export type NetworkingActionType = 'client' | 'director' | 'followup'

export interface NetworkingAction {
  id: string
  type: NetworkingActionType
  date: string
  templateId: string
}

export interface HealthEntry {
  date: string
  weight: number
  training: boolean
  meals: number
  water: number
  sleepTime: string
  alcohol: boolean
  cigarettes: number
  energy: number
}

export type SkillLevel = 'Beginner' | 'Middle' | 'Strong' | 'Pro'
export type SkillStatus = 'not_started' | 'learning' | 'practiced' | 'mastered'

export interface SkillProgress {
  status: SkillStatus
  practices: number
  lastPracticed: string | null
}
