import Link from "next/link"
import { TopNav } from "@/components/TopNav"

export default function NotFoundPage() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="panel panel-hover max-w-md space-y-4 p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">404</p>
          <h1 className="text-3xl font-semibold text-surface-50">Digest not found</h1>
          <p className="text-sm text-surface-200">
            The resource you&apos;re after isn&apos;t indexed yet. Return to the daily dashboard to explore the latest briefs and quizzes.
          </p>
          <Link href="/" className="cta-primary">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
