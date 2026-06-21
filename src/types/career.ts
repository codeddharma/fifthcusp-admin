export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance'
export type ExperienceLevel = 'junior' | 'mid' | 'senior'

export const EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contract', 'freelance']
export const EXPERIENCE_LEVELS: ExperienceLevel[] = ['junior', 'mid', 'senior']

export interface Career {
  _id: string
  title: string
  description: string
  department: string
  location: string
  employmentType: EmploymentType
  experienceLevel: ExperienceLevel
  experienceYears: number
  skills: string[]
  qualifications: string[]
  responsibilities: string[]
  salaryMin?: number
  salaryMax?: number
  applicationDeadline?: string
  isActive: boolean
  isClosed: boolean
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export type CareerInput = Omit<Career, '_id' | 'isClosed' | 'closedAt' | 'createdAt' | 'updatedAt'>
