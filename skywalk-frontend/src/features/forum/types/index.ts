export interface User {
  id: string
  name: string
  avatar?: string
  reputation: number
  joinDate: string
  location?: string
  badges: Badge[]
  isOnline: boolean
}

export interface Badge {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  postCount: number
  lastPost?: {
    id: string
    title: string
    author: string
    date: string
  }
  subcategories?: Category[]
}

export interface Post {
  id: string
  title: string
  content: string
  author: User
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  views: number
  votes: number
  replies: Reply[]
  isPinned: boolean
  isClosed: boolean
  isSolved: boolean
  bestReply?: string
}

export interface Reply {
  id: string
  content: string
  author: User
  createdAt: string
  updatedAt: string
  votes: number
  parentId?: string
  isAccepted: boolean
}

export interface ForumStats {
  totalPosts: number
  totalUsers: number
  totalReplies: number
  activeUsers: number
  topContributors: User[]
}

export interface SearchFilters {
  query: string
  category: string
  tags: string[]
  author: string
  sortBy: 'recent' | 'votes' | 'replies' | 'views'
  timeRange: 'all' | 'today' | 'week' | 'month'
  status: 'all' | 'solved' | 'unsolved'
}