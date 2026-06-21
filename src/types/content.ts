export interface PageSection {
  key: string
  title: string
  order: number
  isVisible: boolean
  data: unknown
  updatedAt?: string
  updatedBy?: string
}

export interface PageContent {
  _id: string
  page: string
  slug: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  sections: PageSection[]
  createdAt: string
  updatedAt: string
}

export interface CreatePageInput {
  page: string
  slug: string
  metaTitle: string
  metaDescription: string
  isPublished?: boolean
}

export interface UpdatePageMetaInput {
  metaTitle?: string
  metaDescription?: string
  isPublished?: boolean
  slug?: string
}

export interface UpsertSectionInput {
  title: string
  order?: number
  isVisible?: boolean
  data: unknown
}
