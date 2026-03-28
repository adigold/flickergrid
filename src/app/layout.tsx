import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlickerGrid — Animated Dot Grid Background Generator',
  description: 'Free open-source tool to create beautiful animated flickering dot grid backgrounds. Customize every parameter and export as code or AI prompt.',
  keywords: ['flickering grid', 'dot grid background', 'animated background', 'canvas animation', 'CSS background generator', 'React background'],
  authors: [{ name: 'Adi Goldstein' }],
  openGraph: {
    title: 'FlickerGrid — Animated Dot Grid Background Generator',
    description: 'Create beautiful animated flickering dot grid backgrounds. Free & open source.',
    url: 'https://flickergrid.dev',
    siteName: 'FlickerGrid',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlickerGrid — Animated Dot Grid Background Generator',
    description: 'Create beautiful animated flickering dot grid backgrounds. Free & open source.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
