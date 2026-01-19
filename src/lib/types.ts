export type SyllabusCategory =
  | "general_awareness"
  | "quantitative_aptitude"
  | "reasoning_ability"
  | "general_science"
  | "current_affairs"
  | "railways"

export type ExamCode = "ssc_chsl" | "ssc_cgl" | "ssc_mts" | "rrb_ntpc"

export interface ArticleSource {
  id: string
  name: string
  homepage: string
  categoryBias?: SyllabusCategory
  reliability: "high" | "medium"
  feedUrl: string
  maxItems?: number
}

export interface RawArticle {
  id: string
  title: string
  link: string
  content?: string
  summary?: string
  publishedAt: string
  author?: string
  source: ArticleSource
  categories?: string[]
}

export interface KeywordHighlight {
  term: string
  score: number
  context?: string
}

export interface ArticleMCQOption {
  label: string
  text: string
}

export interface ArticleMCQ {
  id: string
  question: string
  options: ArticleMCQOption[]
  answer: string
  explanation: string
  category: SyllabusCategory
  sourceArticleId: string
  competency: "factual" | "analytical" | "current" | "conceptual"
  difficulty: "easy" | "moderate" | "advanced"
  examTags?: ExamCode[]
}

export interface ArticleRelevance {
  prelims: boolean
  mains: boolean
}

export interface ProcessedArticle {
  id: string
  title: string
  url: string
  source: {
    id: string
    name: string
    homepage: string
  }
  category: SyllabusCategory
  publishedAt: string
  summary: string
  bulletHighlights: string[]
  keywords: KeywordHighlight[]
  mcqs: ArticleMCQ[]
  readingTimeMinutes: number
  importance: number
  relatedTopics: string[]
  digestDate: string
  expiresAt: string
  relevance: ArticleRelevance
}

export interface CategoryDigest {
  category: SyllabusCategory
  articles: ProcessedArticle[]
  spotlight: string
  lastUpdated: string
}

export interface DailyDigest {
  dateKey: string
  generatedAt: string
  categories: CategoryDigest[]
  totalArticles: number
  quiz: QuizBundle
  monthKey: string
  expiresAt: string
}

export interface QuizBundle {
  dateKey: string
  questions: ArticleMCQ[]
  recommendedDuration: number
}

export interface QuizAttempt {
  id: string
  userId: string
  dateKey: string
  score: number
  total: number
  completedAt: string
  answers: Array<{
    questionId: string
    selected: string
    correct: boolean
  }>
}

export interface UserProgressSnapshot {
  userId: string
  completedArticleIds: string[]
  quizAttempts: QuizAttempt[]
  streak: {
    current: number
    longest: number
    lastCompletedOn?: string
  }
  lastUpdated: string
}

export interface CategoryAggregate {
  category: SyllabusCategory
  articles: ProcessedArticle[]
}

export interface MonthlyDigest {
  monthKey: string
  range: {
    start: string
    end: string
  }
  totalArticles: number
  dailyDigests: DailyDigest[]
  categoryAggregates: CategoryAggregate[]
}

export interface CategoryRevision {
  category: SyllabusCategory
  range: {
    start: string
    end: string
  }
  totalArticles: number
  dailyDigests: DailyDigest[]
}
