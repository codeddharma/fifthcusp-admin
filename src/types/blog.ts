export interface Blog {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  category: string
  tags: string[]
  readTime: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export type BlogInput = Omit<Blog, '_id' | 'isPublished' | 'publishedAt' | 'createdAt' | 'updatedAt'>
