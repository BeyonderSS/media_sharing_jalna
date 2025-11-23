"use client"
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { usePathname } from "next/navigation"
import MobileNav from "@/components/mobile-nav"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, Eye, EyeOff } from "lucide-react"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || ""
const LOCKOUT_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

const navLinks = [
  { href: "/", label: "Gallery" },
  { href: "/generator", label: "URL Generator" },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isTempPlayerPage = pathname.startsWith("/temp-player")

  const [isLocked, setIsLocked] = useState(true)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isTempPlayerPage) {
      setIsLocked(false)
      return
    }

    const storedTimestamp = localStorage.getItem("lockoutTimestamp")
    if (storedTimestamp) {
      const timestamp = Number.parseInt(storedTimestamp)
      if (Date.now() - timestamp < LOCKOUT_DURATION) {
        setIsLocked(false)
      } else {
        localStorage.removeItem("lockoutTimestamp")
        setIsLocked(true)
      }
    } else {
      setIsLocked(true)
    }
  }, [isTempPlayerPage])

  const handleUnlock = () => {
    if (passwordInput === APP_PASSWORD) {
      localStorage.setItem("lockoutTimestamp", Date.now().toString())
      setIsLocked(false)
      setPasswordError("")
    } else {
      setPasswordError("Incorrect password")
    }
  }

  if (isLocked && !isTempPlayerPage) {
    return (
      <html lang="en" suppressHydrationWarning={true}>
        <body className="font-sans antialiased">
          <div className="flex h-screen items-center justify-center bg-background text-foreground p-4">
            <Card className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full">
              <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Access Restricted</h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Please enter the password to access the application.
              </p>
              <div className="relative w-full mb-4">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnlock()
                    }
                  }}
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {passwordError && <p className="text-destructive text-sm mb-4">{passwordError}</p>}
              <Button onClick={handleUnlock} className="w-full">
                Unlock
              </Button>
            </Card>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex h-screen bg-background text-foreground">
          {!isTempPlayerPage && (
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
          )}

          {/* Mobile Header */}
          {!isTempPlayerPage && <MobileNav navLinks={navLinks} />}

          {/* Main Content */}
          <main className={`flex-1 overflow-auto ${!isTempPlayerPage ? "lg:ml-0 pt-16 lg:pt-0" : ""}`}>{children}</main>
        </div>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
