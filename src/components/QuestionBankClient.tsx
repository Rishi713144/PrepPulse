'use client'

import { useMemo, useState } from "react"
import { CATEGORY_LABEL, SYLLABUS_TOPICS } from "@/lib/syllabus"
import { EXAMS, EXAM_LABEL } from "@/lib/exams"
import type { ArticleMCQ, ExamCode, SyllabusCategory } from "@/lib/types"

interface QuestionBankClientProps {
  questions: ArticleMCQ[]
  initialExam?: ExamFilter
}

type DifficultyFilter = "all" | ArticleMCQ["difficulty"]

type CategoryFilter = "all" | SyllabusCategory

type ExamFilter = "all" | ExamCode

const difficultyLabels: Record<Exclude<DifficultyFilter, "all">, string> = {
  easy: "Easy",
  moderate: "Moderate",
  advanced: "Advanced",
}

export function QuestionBankClient({ questions, initialExam = "all" }: QuestionBankClientProps) {
  const [examFilter, setExamFilter] = useState<ExamFilter>(initialExam)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all")
  const [search, setSearch] = useState("")
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(() => new Set())

  const normalisedSearch = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    return questions.filter((question) => {
      if (examFilter !== "all") {
        const tags = question.examTags ?? []
        if (!tags.includes(examFilter)) {
          return false
        }
      }
      if (categoryFilter !== "all" && question.category !== categoryFilter) {
        return false
      }
      if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter) {
        return false
      }
      if (normalisedSearch.length > 0) {
        const haystack = `${question.id} ${question.question} ${question.explanation} ${question.options
          .map((option) => option.text)
          .join(" ")}`.toLowerCase()
        if (!haystack.includes(normalisedSearch)) {
          return false
        }
      }
      return true
    })
  }, [questions, examFilter, categoryFilter, difficultyFilter, normalisedSearch])

  const grouped = useMemo(() => {
    const order = new Map(SYLLABUS_TOPICS.map((topic, index) => [topic.id, index] as const))
    const map = new Map<SyllabusCategory, ArticleMCQ[]>()

    for (const question of filtered) {
      if (!map.has(question.category)) {
        map.set(question.category, [])
      }
      map.get(question.category)!.push(question)
    }

    return Array.from(map.entries())
      .sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0))
      .map(([category, items]) => ({ category, items }))
  }, [filtered])

  const toggleReveal = (id: string) => {
    setRevealedAnswers((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalMatches = filtered.length

  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="panel space-y-6 p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">SSC Question Bank</p>
            <h1 className="text-3xl font-semibold text-surface-50">Previous year styled practice set</h1>
            <p className="text-sm text-surface-200">
              Filter category-wise SSC and Railway questions, review detailed explanations, and pin the ones you
              want to revise. Questions mirror trends from CGL, CHSL, CPO, and RRB papers.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-surface-400">
              Exam
              <select
                value={examFilter}
                onChange={(event) => setExamFilter(event.target.value as ExamFilter)}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-surface-50 focus:border-brand-400 focus:outline-none"
              >
                <option value="all">All exams</option>
                {EXAMS.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-surface-400">
              Category
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-surface-50 focus:border-brand-400 focus:outline-none"
              >
                <option value="all">All categories</option>
                {SYLLABUS_TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {CATEGORY_LABEL[topic.id]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-surface-400">
              Difficulty
              <select
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-surface-50 focus:border-brand-400 focus:outline-none"
              >
                <option value="all">All levels</option>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="md:col-span-1 lg:col-span-2">
              <span className="text-xs uppercase tracking-wide text-surface-400">Search</span>
              <input
                type="search"
                placeholder="Search by keyword or code..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-surface-50 focus:border-brand-400 focus:outline-none"
              />
            </label>
          </div>
          <p className="text-xs text-surface-400">
            Showing {totalMatches} questions
            {examFilter !== "all" ? ` for ${EXAM_LABEL[examFilter]}` : " across all exams"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16">
        {grouped.length === 0 ? (
          <div className="panel p-6 text-sm text-surface-300">No questions match the applied filters.</div>
        ) : (
          grouped.map((group) => (
            <div key={group.category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-surface-50">{CATEGORY_LABEL[group.category]}</h2>
                <span className="badge-muted text-[11px] uppercase">{group.items.length} questions</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {group.items.map((question) => {
                  const answerOption = question.options.find((option) => option.label === question.answer)

                  return (
                    <article key={question.id} className="panel flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-200">
                            {CATEGORY_LABEL[question.category]}
                          </p>
                          <h3 className="text-lg font-semibold text-white">
                            {question.question || "Question text unavailable"}
                          </h3>
                        </div>
                        <span className="badge-muted text-[11px] uppercase">
                          {difficultyLabels[question.difficulty] ?? question.difficulty}
                        </span>
                      </div>
                      <ol className="space-y-2 text-sm text-white/90">
                        {question.options.map((option) => (
                          <li key={option.label} className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-surface-100">
                              {option.label}
                            </span>
                            <span className="text-white/80">{option.text || "Option unavailable"}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="flex items-center justify-between text-xs text-surface-200">
                        <span className="font-mono text-white/70">Code: {question.id}</span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(question.id)}
                          className="cta-secondary px-3 py-1 text-xs"
                        >
                          {revealedAnswers.has(question.id) ? "Hide answer" : "Reveal answer"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-200">
                        {(question.examTags ?? tagAllFallback).map((exam) => (
                          <span key={`${question.id}-${exam}`} className="badge-muted text-[11px]">
                            {EXAM_LABEL[exam] ?? exam}
                          </span>
                        ))}
                      </div>
                      {revealedAnswers.has(question.id) && (
                        <div className="rounded-xl bg-white/5 p-4 text-sm text-white/90">
                          <p className="font-semibold text-white">
                            Correct: {question.answer}
                            {answerOption ? ` (${answerOption.text})` : ""}
                          </p>
                          <p className="mt-2 text-white/70">{question.explanation}</p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

const tagAllFallback: ExamCode[] = ["ssc_cgl", "ssc_chsl", "ssc_mts", "rrb_ntpc"]
