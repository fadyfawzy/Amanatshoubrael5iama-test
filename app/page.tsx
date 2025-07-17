"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const [userCode, setUserCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check admin credentials
      if (userCode === "Fady" && password === "F@dy1313") {
        localStorage.setItem("userRole", "admin")
        localStorage.setItem("userCode", userCode)
        router.push("/admin")
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم",
        })
      } else {
        // Check regular user credentials (simulate)
        if (userCode && password) {
          localStorage.setItem("userRole", "user")
          localStorage.setItem("userCode", userCode)
          router.push("/exam")
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في منصة الامتحانات",
          })
        } else {
          throw new Error("بيانات غير صحيحة")
        }
      }
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى التحقق من كود المستخدم وكلمة المرور",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-32 w-32 mb-6">
            <img src="/logo.png" alt="شعار الأمانة العامة للكشافة والمرشدات" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">منصة الامتحانات</h1>
          <p className="text-sm text-gray-600">الأمانة العامة للكشافة والمرشدات</p>
          <p className="text-sm text-gray-600">مطرانية شبرا الخيمة وكل توابعها</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">أدخل كود المستخدم وكلمة المرور للمتابعة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userCode">كود المستخدم</Label>
                <Input
                  id="userCode"
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="أدخل كود المستخدم"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                    className="text-right pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          © 2025 الأمانة العامة للكشافة والمرشدات بمطرانية شبرا الخيمة - جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  )
}
