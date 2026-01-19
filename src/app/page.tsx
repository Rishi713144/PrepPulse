import Link from "next/link"
import { TopNav } from "@/components/TopNav"

export default function Home() {
  return (
    <main className="min-h-screen pb-24">
      <TopNav />
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-16">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">SSC &amp; RRB Practice Studio</p>
          <h1 className="text-4xl font-semibold text-surface-50 sm:text-5xl">
            Drill previous-year style questions with instant answer keys.
          </h1>
          <p className="text-base text-surface-200 sm:text-lg">
            PrepPulse now focuses exclusively on objective practice. Refresh the question bank whenever you need a
            fresh set and filter by exam, category, and difficulty to match your upcoming SSC or Railway shift.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/questions" className="cta-primary px-5 py-3 text-sm">
            Open Question Bank
          </Link>
          <Link href="/about" className="cta-secondary px-5 py-3 text-sm">
            How it works
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-6 px-4 sm:grid-cols-2">
        <article className="panel space-y-3 p-6">
          <h2 className="text-lg font-semibold text-surface-50">AI-generated with previous-year rigor</h2>
          <p className="text-sm text-surface-300">
            Each refresh prompts the AI curator to assemble authentic SSC CGL, CHSL, MTS, and RRB NTPC style questions
            with shift references, explanations, and difficulty cues.
          </p>
        </article>
        <article className="panel space-y-3 p-6">
          <h2 className="text-lg font-semibold text-surface-50">Filter the way you revise</h2>
          <p className="text-sm text-surface-300">
            Slice the bank exam-wise, drill quant or reasoning sprints, and reveal solutions only when you are ready.
            Your filters stay local to keep practice lightweight.
          </p>
        </article>
      </section>
    </main>
  )
}
