import type { Metadata } from "next"
import { TopNav } from "@/components/TopNav"

export const metadata: Metadata = {
  title: "About PrepPulse",
  description: "PrepPulse delivers AI-generated SSC and RRB practice questions with instant answer explanations.",
}

const pillars = [
  {
    title: "Previous-year fidelity",
    description: "Prompts guide the AI curator to mirror SSC CGL, CHSL, MTS, and RRB NTPC shifts with accurate references.",
  },
  {
    title: "Instant answer reveals",
    description: "Each item ships with a concise explanation so you can verify logic and facts without hunting for PDFs.",
  },
  {
    title: "Filter-friendly practice",
    description: "Work category-wise, change the exam focus on the fly, and keep things lightweight with client-side filtering.",
  },
]

const stack = [
  "Next.js 14 App Router",
  "Tailwind CSS",
  "Server Components for fast data fetch",
  "TypeScript everywhere",
]

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-20">
      <TopNav />
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
        <h1 className="text-4xl font-semibold text-surface-50">Why PrepPulse?</h1>
        <p className="text-base text-surface-200">
          Competitive exams demand constant question practice. PrepPulse skips the news crawl and goes straight to MCQs,
          prompting a deterministic AI workflow to create previous-year style sets with explanations you can trust.
          Spin up a fresh bank whenever you need variety and focus on solving rather than sourcing.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="panel p-6">
            <h2 className="text-lg font-semibold text-brand-200">{pillar.title}</h2>
            <p className="mt-2 text-sm text-surface-200">{pillar.description}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-4xl space-y-4 px-4">
        <h2 className="text-2xl font-semibold text-surface-50">Tech stack</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {stack.map((item) => (
            <li key={item} className="panel p-4 text-sm text-surface-200">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
