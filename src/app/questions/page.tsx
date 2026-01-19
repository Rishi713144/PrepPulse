import type { Metadata } from "next"
import { TopNav } from "@/components/TopNav"
import { QuestionBankClient } from "@/components/QuestionBankClient"
import { loadQuestionBank } from "@/lib/quiz/sscBank"
import type { ArticleMCQ, ExamCode } from "@/lib/types"
import { EXAMS } from "@/lib/exams"

export const metadata: Metadata = {
  title: "Practice SSC & RRB Questions · PrepPulse",
  description:
    "Solve SSC CHSL, CGL, MTS, and RRB NTPC style multiple choice questions with instant explanations across GA, Quant, Reasoning, Science, and Railway Awareness.",
}

function isExamCode(value: string | undefined): value is ExamCode {
  return value ? EXAMS.some((exam) => exam.id === value) : false
}

interface QuestionBankPageProps {
  searchParams?: {
    exam?: string
  }
}

export default async function QuestionBankPage({ searchParams }: QuestionBankPageProps) {
  let questions: ArticleMCQ[] = []
  let loadError: string | null = null

  try {
    questions = await loadQuestionBank()
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Question bank could not be generated."
  }
  const params = await searchParams
  const examParam = params?.exam
  const initialExam = isExamCode(examParam) ? examParam : "all"

  return (
    <main className="min-h-screen pb-16">
      <TopNav />
      {loadError ? (
        <section className="mx-auto max-w-3xl px-4 pt-12">
          <div className="panel space-y-4 p-6 text-sm text-surface-200">
            <h1 className="text-2xl font-semibold text-surface-50">Unable to fetch question bank</h1>
            <p>{loadError}</p>
            <p>
              Check that <span className="font-mono text-white/80">PREPPULSE_GEMINI_API_KEY</span> (or
              <span className="font-mono text-white/80">GEMINI_API_KEY</span>) is configured, and that any optional
              Gemini overrides like <span className="font-mono text-white/80">PREPPULSE_GEMINI_MODEL</span> or
              <span className="font-mono text-white/80">PREPPULSE_GEMINI_ENDPOINT</span> are valid for your project.
            </p>
          </div>
        </section>
      ) : (
        <QuestionBankClient questions={questions} initialExam={initialExam} />
      )}
    </main>
  )
}
