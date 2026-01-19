import type { ArticleMCQ, ExamCode, SyllabusCategory } from "../types"
import { SYLLABUS_TOPICS, type SyllabusTopic } from "../syllabus"
import { jsonrepair } from "jsonrepair"

const ALLOWED_EXAM_CODES: ExamCode[] = ["ssc_cgl", "ssc_chsl", "ssc_mts", "rrb_ntpc"]
const ALLOWED_DIFFICULTIES: ArticleMCQ["difficulty"][] = ["easy", "moderate", "advanced"]
const ALLOWED_CATEGORIES = SYLLABUS_TOPICS.map((topic) => topic.id)

const QUESTIONS_PER_CATEGORY = 10

const CATEGORY_FETCH_PLAN = SYLLABUS_TOPICS.map((topic) => ({
  topic,
  questionCount: QUESTIONS_PER_CATEGORY,
}))

const GEMINI_API_KEY = process.env.PREPPULSE_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.PREPPULSE_GEMINI_MODEL ?? "gemini-3-flash-preview"
const GEMINI_ENDPOINT_BASE =
  process.env.PREPPULSE_GEMINI_ENDPOINT ?? "https://generativelanguage.googleapis.com/v1beta/models"
const GEMINI_MAX_CONCURRENCY = (() => {
  const raw = process.env.PREPPULSE_GEMINI_CONCURRENCY ?? process.env.GEMINI_CONCURRENCY
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed)
  }
  return 3
})()

interface AiQuestionPayload {
  id?: string
  question?: unknown
  options?: unknown
  answer?: unknown
  explanation?: unknown
  category?: unknown
  difficulty?: unknown
  examTags?: unknown
  sourceExam?: unknown
}

interface AiResponsePayload {
  questions?: AiQuestionPayload[]
}

type GeminiFunctionCall = {
  name?: string
  args?: unknown
}

type GeminiFunctionResponse = {
  name?: string
  response?: unknown
}

type GeminiContentPart = {
  text?: string
  functionCall?: GeminiFunctionCall
  functionResponse?: GeminiFunctionResponse
}

type GeminiCandidate = {
  content?: {
    parts?: GeminiContentPart[]
  }
}

type ParseSuccess = {
  ok: true
  payload: AiResponsePayload
}

type ParseFailure = {
  ok: false
  error: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80) || "question"
}

function normaliseOptions(raw: unknown): ArticleMCQ["options"] | null {
  if (Array.isArray(raw)) {
    const items = raw
      .map((option) => {
        if (!option || typeof option !== "object") return null
        const label = "label" in option ? String(option.label).trim().toUpperCase() : null
        const text = "text" in option ? String(option.text).trim() : null
        if (!label || !text) return null
        if (!/^[A-D]$/.test(label)) return null
        return { label, text }
      })
      .filter((option): option is ArticleMCQ["options"][number] => option !== null)

    if (items.length === 4) {
      return items
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const entries = Object.entries(raw as Record<string, unknown>)
      .map(([key, value]) => {
        const label = key.trim().toUpperCase()
        if (!/^[A-D]$/.test(label)) return null
        if (typeof value !== "string") return null
        const text = value.trim()
        if (!text) return null
        return { label, text }
      })
      .filter((entry): entry is ArticleMCQ["options"][number] => entry !== null)

    if (entries.length === 4) {
      return entries.sort((a, b) => a.label.localeCompare(b.label))
    }
  }

  return null
}

function normaliseExamTags(raw: unknown): ExamCode[] {
  if (!Array.isArray(raw)) {
    return []
  }
  const tags = raw
    .map((value) => String(value).toLowerCase().trim())
    .filter((value) => ALLOWED_EXAM_CODES.includes(value as ExamCode))
  return tags.length > 0 ? (Array.from(new Set(tags)) as ExamCode[]) : []
}

function normaliseCategory(raw: unknown, fallback?: SyllabusCategory): SyllabusCategory | null {
  const candidates: string[] = []

  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (trimmed) {
      candidates.push(trimmed)
      const lower = trimmed.toLowerCase()
      if (lower !== trimmed) {
        candidates.push(lower)
      }
      const snake = lower.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
      if (snake && snake !== lower) {
        candidates.push(snake)
      }
      const hyphen = snake.replace(/_/g, "-")
      if (hyphen && hyphen !== snake) {
        candidates.push(hyphen)
      }
    }
  }

  if (fallback) {
    candidates.push(fallback)
  }

  for (const candidate of candidates) {
    if (ALLOWED_CATEGORIES.includes(candidate as SyllabusCategory)) {
      return candidate as SyllabusCategory
    }
  }

  return null
}

function normaliseDifficulty(raw: unknown): ArticleMCQ["difficulty"] {
  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase()
    if (ALLOWED_DIFFICULTIES.includes(value as ArticleMCQ["difficulty"])) {
      return value as ArticleMCQ["difficulty"]
    }
  }
  return "moderate"
}

function extractAnswer(options: ArticleMCQ["options"], rawAnswer: unknown): string | null {
  if (typeof rawAnswer !== "string") return null
  const value = rawAnswer.trim().toUpperCase()
  return options.some((option) => option.label === value) ? value : null
}

function buildSourceId(sourceExam: unknown, fallbackId: string): string {
  if (typeof sourceExam !== "string" || !sourceExam.trim()) {
    return `ai-generated-${fallbackId}`
  }
  return `ai-${slugify(sourceExam)}`
}

function buildPromptForTopic(topic: SyllabusTopic, questionCount: number): string {
  const keywordList = topic.keywords.slice(0, 12).join(", ")
  return `You are an exam content curator for Indian competitive exams. Create exactly ${questionCount} previous-year style multiple choice questions for the ${topic.title} section.

Focus on ${topic.description}.

Prioritise question stems rooted in cues such as ${keywordList}. Ensure every question feels like a real SSC CGL, SSC CHSL, SSC MTS, or RRB NTPC prompt.

Return STRICT JSON (no backticks, no commentary) matching this structure:
{"questions": [
  {
    "id": "${topic.id}-sample-id",
    "question": "Question text",
    "options": [
      { "label": "A", "text": "Option text" },
      { "label": "B", "text": "Option text" },
      { "label": "C", "text": "Option text" },
      { "label": "D", "text": "Option text" }
    ],
    "answer": "A",
    "explanation": "Short answer explanation describing the fact or calculation.",
    "category": "${topic.id}",
    "difficulty": "one of easy | moderate | advanced",
    "examTags": ["subset of ${ALLOWED_EXAM_CODES.join(", ")}"],
    "sourceExam": "Exam reference like SSC CGL 2022 Shift 2"
  }
]}

Guidelines:
- Produce only ${questionCount} questions.
- Keep IDs unique, kebab-case, and include exam code hints.
- Use authentic phrasing aligned with SSC/RRB papers.
- Always include 4 options labelled A-D and ensure the answer label matches the correct option.
- Make explanations concise (2-3 sentences) and rooted in verifiable facts or calculation steps.
- All category fields MUST be "${topic.id}" and exam tags must stay within ${ALLOWED_EXAM_CODES.join(", ")}.
- Responses must be valid JSON that can be parsed without correction.`
}

function normaliseQuestion(raw: AiQuestionPayload, expectedCategory?: SyllabusCategory): ArticleMCQ | null {
  const options = normaliseOptions(raw.options)
  if (!options) {
    return null
  }

  const category = normaliseCategory(raw.category, expectedCategory)
  if (!category) {
    return null
  }

  const questionText = typeof raw.question === "string" ? raw.question.trim() : ""
  if (!questionText) {
    return null
  }

  const explanation = typeof raw.explanation === "string" ? raw.explanation.trim() : ""
  if (!explanation) {
    return null
  }

  const answer = extractAnswer(options, raw.answer)
  if (!answer) {
    return null
  }

  const providedId = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : undefined
  const generatedId = providedId ?? `${category}-${slugify(questionText).slice(0, 40)}`

  return {
    id: generatedId,
    question: questionText,
    options,
    answer,
    explanation,
    category,
    sourceArticleId: buildSourceId(raw.sourceExam, generatedId),
    competency: "factual",
    difficulty: normaliseDifficulty(raw.difficulty),
    examTags: normaliseExamTags(raw.examTags),
  }
}

function extractAssistantText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return ""
  }

  if ("output" in payload && Array.isArray((payload as { output: unknown }).output)) {
    for (const item of (payload as { output: unknown[] }).output) {
      if (!item || typeof item !== "object") continue
      if ("content" in item && Array.isArray((item as { content: unknown[] }).content)) {
        for (const block of (item as { content: unknown[] }).content) {
          if (!block || typeof block !== "object") continue
          if ("text" in block && typeof (block as { text: unknown }).text === "string") {
            return (block as { text: string }).text
          }
          if ("functionCall" in block) {
            const args = (block as { functionCall?: GeminiFunctionCall }).functionCall?.args
            if (typeof args === "string") {
              return args
            }
            if (args && typeof args === "object") {
              try {
                return JSON.stringify(args)
              } catch (_error) {
                continue
              }
            }
          }
          if ("functionResponse" in block) {
            const response = (block as { functionResponse?: GeminiFunctionResponse }).functionResponse?.response
            if (typeof response === "string") {
              return response
            }
            if (response && typeof response === "object") {
              try {
                return JSON.stringify(response)
              } catch (_error) {
                continue
              }
            }
          }
        }
      }
    }
  }

  if ("choices" in payload && Array.isArray((payload as { choices: unknown[] }).choices)) {
    for (const choice of (payload as { choices: unknown[] }).choices) {
      if (!choice || typeof choice !== "object") continue
      const message = "message" in choice ? (choice as { message: unknown }).message : undefined
      if (message && typeof message === "object" && "content" in message && typeof (message as { content: unknown }).content === "string") {
        return (message as { content: string }).content
      }
    }
  }

  if ("output_text" in payload && Array.isArray((payload as { output_text: unknown[] }).output_text)) {
    const text = (payload as { output_text: unknown[] }).output_text.find((value) => typeof value === "string")
    if (typeof text === "string") {
      return text
    }
  }

  if ("candidates" in payload && Array.isArray((payload as { candidates: unknown[] }).candidates)) {
    for (const candidate of (payload as { candidates: unknown[] }).candidates) {
      if (!candidate || typeof candidate !== "object") continue
      const parts = (candidate as GeminiCandidate).content?.parts ?? []
      for (const part of parts) {
        if (!part) {
          continue
        }
        if (typeof part?.text === "string" && part.text.trim().length > 0) {
          return part.text
        }
        if (part.functionCall?.args) {
          const args = part.functionCall.args
          if (typeof args === "string") {
            return args
          }
          if (typeof args === "object") {
            try {
              return JSON.stringify(args)
            } catch (_error) {
              continue
            }
          }
        }
        if (part.functionResponse?.response) {
          const response = part.functionResponse.response
          if (typeof response === "string") {
            return response
          }
          if (typeof response === "object") {
            try {
              return JSON.stringify(response)
            } catch (_error) {
              continue
            }
          }
        }
      }
    }
  }

  return ""
}

function cloneQuestions(list: ArticleMCQ[]): ArticleMCQ[] {
  return list.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
    examTags: question.examTags ? [...question.examTags] : undefined,
  }))
}

function getGeminiEndpoint(): string | null {
  if (!GEMINI_API_KEY) {
    return null
  }
  const encodedModel = encodeURIComponent(GEMINI_MODEL)
  return `${GEMINI_ENDPOINT_BASE}/${encodedModel}:generateContent?key=${GEMINI_API_KEY}`
}

function stripTrailingCommas(candidate: string): string {
  return candidate.replace(/,\s*([}\]])/g, "$1")
}

function buildParseAttempts(raw: string): string[] {
  const attempts: string[] = []
  const trimmed = raw.trim()
  if (!trimmed) {
    return attempts
  }

  attempts.push(trimmed)
  attempts.push(stripTrailingCommas(trimmed))

  const jsonBlockMatch = trimmed.match(/```json\s*([\s\S]+?)```/i)
  if (jsonBlockMatch?.[1]) {
    const block = jsonBlockMatch[1].trim()
    attempts.push(block)
    attempts.push(stripTrailingCommas(block))
    const repairedBlock = repairJsonString(block)
    if (repairedBlock) {
      attempts.push(repairedBlock)
    }
  }

  const genericBlockMatch = trimmed.match(/```([\s\S]+?)```/)
  if (genericBlockMatch?.[1]) {
    const block = genericBlockMatch[1].trim()
    attempts.push(block)
    attempts.push(stripTrailingCommas(block))
    const repairedGeneric = repairJsonString(block)
    if (repairedGeneric) {
      attempts.push(repairedGeneric)
    }
  }

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start !== -1 && end !== -1 && end > start) {
    const slice = trimmed.slice(start, end + 1)
    attempts.push(slice)
    attempts.push(stripTrailingCommas(slice))
    const repairedSlice = repairJsonString(slice)
    if (repairedSlice) {
      attempts.push(repairedSlice)
    }
  }

  const repaired = repairJsonString(trimmed)
  if (repaired) {
    attempts.push(repaired)
  }

  return attempts
}

function parseAiResponse(raw: string): ParseSuccess | ParseFailure {
  const attempts = buildParseAttempts(raw)
  if (attempts.length === 0) {
    return { ok: false, error: "Gemini response did not contain JSON content." }
  }

  const seen = new Set<string>()
  const queue: string[] = [...attempts]
  let lastParseError = ""
  let lastRepairError: string | null = null

  while (queue.length > 0) {
    const attempt = queue.shift()
    if (!attempt || seen.has(attempt)) {
      continue
    }
    seen.add(attempt)

    try {
      const payload = JSON.parse(attempt) as AiResponsePayload
      return { ok: true, payload }
    } catch (error) {
      lastParseError = (error as Error).message
      try {
        const repaired = jsonrepair(attempt)
        if (repaired && !seen.has(repaired)) {
          queue.push(repaired)
        }
      } catch (repairError) {
        lastRepairError = (repairError as Error).message
      }
    }
  }

  const detail = lastRepairError
    ? `Gemini JSON parse failed: ${lastParseError}; repair failed: ${lastRepairError}`
    : lastParseError

  return {
    ok: false,
    error: detail ? detail : "Gemini JSON parse failed after cleanup attempts.",
  }
}

function repairJsonString(input: string): string {
  let result = input.replace(/^\uFEFF/, "")
  result = removeJsonComments(result)
  result = result.replace(/\r/g, "")
  result = convertSingleQuotedKeys(result)
  result = ensureQuotedPropertyNames(result)
  result = convertSingleQuotedValues(result)
  result = stripTrailingCommas(result)
  result = balanceStructuralBrackets(result)
  return result.trim()
}

function removeJsonComments(input: string): string {
  let output = ""
  let inString = false
  let stringChar: '"' | "'" | null = null
  let escape = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (inString) {
      output += char
      if (escape) {
        escape = false
        continue
      }
      if (char === "\\") {
        escape = true
        continue
      }
      if (char === stringChar) {
        inString = false
        stringChar = null
      }
      continue
    }

    const nextChar = input[i + 1]
    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      output += char
      continue
    }

    if (char === "/" && nextChar === "/") {
      let j = i + 2
      while (j < input.length && input[j] !== "\n" && input[j] !== "\r") {
        j += 1
      }
      i = j - 1
      continue
    }

    if (char === "/" && nextChar === "*") {
      let j = i + 2
      while (j < input.length && !(input[j] === "*" && input[j + 1] === "/")) {
        j += 1
      }
      i = j + 1
      continue
    }

    output += char
  }

  return output
}

function convertSingleQuotedKeys(input: string): string {
  return input.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'\s*:/g, (_match, key) => {
    const normalised = key.replace(/\\'/g, "'")
    return `"${normalised}":`
  })
}

function ensureQuotedPropertyNames(input: string): string {
  return input.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, (match, prefix, key, suffix) => {
    if (key.startsWith('"')) {
      return match
    }
    return `${prefix}"${key}"${suffix}`
  })
}

function convertSingleQuotedValues(input: string): string {
  const escapeValue = (value: string) => value.replace(/\\'/g, "'").replace(/"/g, '\\"')

  let result = input.replace(/(:\s*)'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_match, prefix, value) => {
    return `${prefix}"${escapeValue(value)}"`
  })

  result = result.replace(/([\[,]\s*)'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_match, prefix, value) => {
    return `${prefix}"${escapeValue(value)}"`
  })

  return result
}

function balanceStructuralBrackets(input: string): string {
  const stack: ('{' | '[')[] = []
  let output = ""
  let inString = false
  let escape = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    output += char

    if (inString) {
      if (escape) {
        escape = false
        continue
      }
      if (char === "\\") {
        escape = true
        continue
      }
      if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === "{" || char === "[") {
      stack.push(char)
      continue
    }

    if (char === "}" || char === "]") {
      const counterpart = char === "}" ? "{" : "["
      const index = stack.lastIndexOf(counterpart)
      if (index !== -1) {
        stack.splice(index, 1)
      }
    }
  }

  while (stack.length > 0) {
    const opener = stack.pop()
    output += opener === "{" ? "}" : "]"
  }

  return output
}

async function fetchQuestionsForTopic(
  endpoint: string,
  topic: SyllabusTopic,
  questionCount: number,
): Promise<ArticleMCQ[]> {
  const prompt = buildPromptForTopic(topic, questionCount)
  let payload: AiResponsePayload

  try {
    payload = await requestGemini(endpoint, prompt)
  } catch (error) {
    throw new Error(`Gemini request failed for category ${topic.id}: ${(error as Error).message}`)
  }

  const questions = (payload.questions ?? [])
    .map((item) => normaliseQuestion(item, topic.id))
    .filter((item): item is ArticleMCQ => item !== null)
    .filter((question) => question.category === topic.id)
    .slice(0, questionCount)

  if (questions.length === 0) {
    throw new Error(`Gemini did not return valid questions for category ${topic.id}.`)
  }

  return questions
}

async function requestGemini(endpoint: string, prompt: string): Promise<AiResponsePayload> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini responded with ${response.status}: ${errorBody}`)
  }

  const payload = await response.json()
  const assistantText = extractAssistantText(payload)

  if (!assistantText.trim()) {
    throw new Error("Gemini response did not include any assistant text.")
  }

  const parseResult = parseAiResponse(assistantText)
  if (!parseResult.ok) {
    throw new Error(parseResult.error)
  }

  return parseResult.payload
}

export async function generateQuestionBankFromAi(): Promise<ArticleMCQ[]> {
  const geminiEndpoint = getGeminiEndpoint()
  if (!geminiEndpoint) {
    throw new Error("Gemini API key not provided.")
  }

  if (CATEGORY_FETCH_PLAN.length === 0) {
    return []
  }

  // Run Gemini prompts in parallel to shrink overall generation time.
  const workerCount = Math.min(Math.max(1, GEMINI_MAX_CONCURRENCY), CATEGORY_FETCH_PLAN.length)
  const topicResults: (ArticleMCQ[] | undefined)[] = new Array(CATEGORY_FETCH_PLAN.length)
  const errors: string[] = []
  let nextIndex = 0

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex
      if (currentIndex >= CATEGORY_FETCH_PLAN.length) {
        break
      }
      nextIndex += 1
      const { topic, questionCount } = CATEGORY_FETCH_PLAN[currentIndex]
      try {
        topicResults[currentIndex] = await fetchQuestionsForTopic(geminiEndpoint, topic, questionCount)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(message)
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  if (errors.length > 0) {
    throw new Error(errors.join("; "))
  }

  const collected = topicResults.flatMap((entry) => entry ?? [])

  const seen = new Set<string>()
  const deduped: ArticleMCQ[] = []
  for (const question of collected) {
    if (seen.has(question.id)) {
      continue
    }
    seen.add(question.id)
    deduped.push(question)
  }

  return cloneQuestions(deduped)
}
