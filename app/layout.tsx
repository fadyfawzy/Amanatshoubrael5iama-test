import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "امتحانات الدرجات | Emtihanat Eldorou'",
  description: "General Secretariat for Scouts & Guides – Shoubra El-Kheima Diocese",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} font-cairo`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
