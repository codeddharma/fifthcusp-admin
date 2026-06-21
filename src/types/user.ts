export type UserRole = 'admin' | 'manager' | 'employee'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: UserRole
  isActive?: boolean
}
