import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleAnalytics } from '@next/third-parties/google' // <--- 1. IMPORT THIS

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Madison Daily Specials',
  description: 'Find the best happy hours and daily drink specials in Madison, WI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
      {/* 2. ADD THIS COMPONENT AT THE BOTTOM */}
      <GoogleAnalytics gaId="G-B06TY8N46F" /> 
    </html>
  )
}