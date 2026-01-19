import type { ExamCode } from "./types"

export interface ExamDefinition {
  id: ExamCode
  name: string
  description: string
  pattern: string
}

export const EXAMS: ExamDefinition[] = [
  {
    id: "ssc_cgl",
    name: "SSC CGL",
    description: "Graduate-level recruitment focussed on advanced reasoning, quantitative aptitude, and current affairs.",
    pattern: "Tier-I objective with 100 questions across GA, Reasoning, Quant, and English.",
  },
  {
    id: "ssc_chsl",
    name: "SSC CHSL",
    description: "Higher Secondary exam emphasising accuracy and speed across foundational SSC subjects.",
    pattern: "Tier-I CBT with 100 questions split evenly across GA, Reasoning, Quant, and English.",
  },
  {
    id: "ssc_mts",
    name: "SSC MTS",
    description: "Matric-level selection with simplified reasoning and general awareness coverage.",
    pattern: "Session-I tests Reasoning and Numerical Ability, Session-II adds GA and English.",
  },
  {
    id: "rrb_ntpc",
    name: "RRB NTPC",
    description: "Railway level graduate and undergraduate posts with strong focus on GA and railway awareness.",
    pattern: "Stage-I CBT features 100 questions balanced between GA, Math, and Reasoning.",
  },
]

export const EXAM_LABEL: Record<ExamCode, string> = EXAMS.reduce(
  (acc, exam) => {
    acc[exam.id] = exam.name
    return acc
  },
  {} as Record<ExamCode, string>,
)
