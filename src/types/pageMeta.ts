export interface PageMeta {
  _id: string
  pagePath: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface PageMetaInput {
  pagePath: string
  metaTitle: string
  metaDescription: string
  metaKeywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
}
