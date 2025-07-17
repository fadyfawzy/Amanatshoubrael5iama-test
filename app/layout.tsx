import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "منصة الامتحانات - الأمانة العامة للكشافة والمرشدات",
  description: "منصة امتحانات الكشافة والمرشدات بمطرانية شبرا الخيمة",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo bg-white min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
