import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "PrepPulse · SSC & Railway Exam Prep",
  description:
    "PrepPulse generates previous-year style SSC and Railway MCQs with AI so you can drill General Awareness, Quant, Reasoning, Science, and Railway awareness with instant explanations.",
  keywords: [
    "SSC",
    "RRB",
    "railway exams",
    "ssc practice questions",
    "rrb question bank",
    "quantitative aptitude",
    "reasoning",
    "mcq practice",
  ],
  openGraph: {
    title: "PrepPulse",
    description:
      "AI-backed SSC and Railway practice studio with filterable question banks and instant answer reveals.",
    url: "https://preppulse.app",
    siteName: "PrepPulse",
    type: "website",
  },
  metadataBase: new URL("https://preppulse.app"),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-surface-950 text-surface-50 antialiased`}>
        {children}
      </body>
    </html>
  )
}
