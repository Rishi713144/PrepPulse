import Link from "next/link"

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-500/20 p-2 text-brand-200">
            <span className="text-lg font-semibold">PP</span>
          </div>
          <div className="hidden flex-col text-sm font-semibold text-surface-100 sm:flex">
            <span>PrepPulse</span>
            <span className="text-xs font-normal text-surface-300">SSC &amp; RRB Practice Bank</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-xs font-medium text-surface-200">
          <Link href="/" className="cta-secondary">Home</Link>
          <Link href="/questions" className="cta-secondary">Question Bank</Link>
          <Link href="/about" className="cta-secondary">About</Link>
        </div>
      </nav>
    </header>
  )
}
