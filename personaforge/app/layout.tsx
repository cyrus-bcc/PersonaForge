import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add Geist font CDN links */}
        <link rel="stylesheet" href="https://geist-fonts.vercel.app/sans.css" />
        <link rel="stylesheet" href="https://geist-fonts.vercel.app/mono.css" />
        <style>{`
html {
  font-family: 'Geist Sans', 'Geist Mono', sans-serif;
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
