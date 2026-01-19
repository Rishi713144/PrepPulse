import type { ArticleMCQ } from "../types"
import { generateQuestionBankFromAi } from "../ai/questionGenerator"

const CACHE_TTL_MS = 1000 * 60 * 60

let cachedQuestions: { fetchedAt: number; questions: ArticleMCQ[] } | null = null

function cloneQuestion(question: ArticleMCQ): ArticleMCQ {
  return {
    ...question,
    options: question.options.map((option) => ({ ...option })),
    examTags: question.examTags ? [...question.examTags] : undefined,
  }
}

export async function loadQuestionBank(): Promise<ArticleMCQ[]> {
  const now = Date.now()
  if (cachedQuestions && now - cachedQuestions.fetchedAt < CACHE_TTL_MS) {
    return cachedQuestions.questions.map(cloneQuestion)
  }

  const previous = cachedQuestions
  let fresh: ArticleMCQ[]
  try {
    fresh = await generateQuestionBankFromAi()
  } catch (error) {
    if (previous) {
      
      cachedQuestions = {
        fetchedAt: now,
        questions: previous.questions,
      }
      return previous.questions.map(cloneQuestion)
    }
    throw error
  }

  cachedQuestions = {
    fetchedAt: now,
    questions: fresh,
  }

  return fresh.map(cloneQuestion)
}

export function invalidateQuestionBankCache() {
  cachedQuestions = null
}
