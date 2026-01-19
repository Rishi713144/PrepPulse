import type { SyllabusCategory } from "./types"

export interface SyllabusTopic {
  id: SyllabusCategory
  title: string
  description: string
  keywords: string[]
  tone: "awareness" | "math" | "reasoning" | "science" | "current" | "railway"
}

export const SYLLABUS_TOPICS: SyllabusTopic[] = [
  {
    id: "general_awareness",
    title: "General Awareness",
    description: "Static GK, constitutional provisions, geography highlights, culture, awards, and government initiatives frequently tested in SSC exams.",
    keywords: [
      "constitution",
      "amendment",
      "governor",
      "capital",
      "festival",
      "award",
      "committee",
      "scheme",
      "history",
      "geography",
      "culture",
    ],
    tone: "awareness",
  },
  {
    id: "quantitative_aptitude",
    title: "Quantitative Aptitude",
    description: "Shortcuts, formulae, and practice drills for arithmetic, algebra, geometry, and data interpretation.",
    keywords: [
      "percentage",
      "profit",
      "loss",
      "ratio",
      "interest",
      "algebra",
      "mensuration",
      "geometry",
      "data",
      "average",
      "speed",
      "time",
    ],
    tone: "math",
  },
  {
    id: "reasoning_ability",
    title: "Reasoning Ability",
    description: "Coding-decoding, syllogisms, puzzles, series, and other pattern-recognition topics for SSC and RRB papers.",
    keywords: [
      "analogy",
      "classification",
      "series",
      "coding",
      "decoding",
      "blood relation",
      "direction",
      "puzzle",
      "inequality",
      "statement",
      "conclusion",
    ],
    tone: "reasoning",
  },
  {
    id: "general_science",
    title: "General Science",
    description: "Concept notes from physics, chemistry, biology, space science, and everyday applications aligned with SSC and RRB syllabi.",
    keywords: [
      "physics",
      "chemistry",
      "biology",
      "vitamin",
      "disease",
      "space",
      "mission",
      "energy",
      "nuclear",
      "plant",
      "organ",
    ],
    tone: "science",
  },
  {
    id: "current_affairs",
    title: "Current Affairs",
    description: "Exam-oriented updates on national programmes, sports, rankings, and international meetings with SSC/RRB relevance.",
    keywords: [
      "summit",
      "tournament",
      "cabinet",
      "launch",
      "report",
      "ranking",
      "awarded",
      "initiative",
      "mission",
      "policy",
    ],
    tone: "current",
  },
  {
    id: "railways",
    title: "Railway Awareness",
    description: "Schemes, safety programmes, production units, and infrastructure facts unique to Indian Railways examinations.",
    keywords: [
      "railway",
      "rrb",
      "station",
      "locomotive",
      "coach",
      "freight",
      "amrit bharat",
      "mission raftaar",
      "vande bharat",
      "headquarters",
      "zone",
    ],
    tone: "railway",
  },
]

export const CATEGORY_LABEL: Record<SyllabusCategory, string> = SYLLABUS_TOPICS.reduce(
  (acc, topic) => ({ ...acc, [topic.id]: topic.title }),
  {} as Record<SyllabusCategory, string>,
)
