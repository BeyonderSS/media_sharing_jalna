import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import MobileNav from "@/components/mobile-nav"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediaHub - Content Management Platform",
  description: "Professional media management and analytics platform",
  generator: "v0.app",
}

const navLinks = [
  { href: "/", label: "Gallery" },
  { href: "/generator", label: "URL Generator" },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex h-screen bg-background text-foreground">
          {/* Desktop Navigation Sidebar */}
          <nav className="hidden lg:flex w-64 border-r border-border bg-card p-4 md:p-6 flex-col">
            <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-primary">MediaHub</h1>
            <ul className="space-y-2 flex-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block px-3 md:px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm md:text-base"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Header */}
          <MobileNav navLinks={navLinks} />

          {/* Main Content */}
          <main className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">{children}</main>
        </div>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
