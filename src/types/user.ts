import type { Specialty } from '@/lib/constants/specialties'

export type UserRole = 'admin' | 'manager' | 'employee'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  specialties?: Specialty[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  specialties?: Specialty[]
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: UserRole
  isActive?: boolean
  specialties?: Specialty[]
}
