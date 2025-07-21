"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, LogIn, Shield } from "lucide-react"

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
        // Check if code has been used before
        const usedCodes = JSON.parse(localStorage.getItem("usedExamCodes") || "[]")
        if (usedCodes.includes(userCode)) {
          throw new Error("تم استخدام هذا الكود من قبل ولا يمكن إعادة استخدامه")
        }

        // Check regular user credentials (simulate)
        if (userCode && password) {
          // In a real system, you would validate against a database
          // For demo purposes, accept any code/password combination that isn't already used
          localStorage.setItem("userRole", "user")
          localStorage.setItem("userCode", userCode)
          router.push("/exam")
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في امتحانات الدرجات",
          })
        } else {
          throw new Error("بيانات غير صحيحة")
        }
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-green-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-32 w-32 mb-6">
            <img src="/logo.svg" alt="شعار الأمانة العامة للكشافة والمرشدات" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">امتحانات الدرجات</h1>
          <p className="text-sm text-gray-600">الأمانة العامة للكشافة والمرشدات</p>
          <p className="text-sm text-gray-600">مطرانية شبرا الخيمة</p>
        </div>

        {/* Bible Verse */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <blockquote className="text-blue-800 font-medium italic mb-2">
                "لأن طرق الإنسان أمام عيني الرب، وهو يزن جميع سبله"
              </blockquote>
              <cite className="text-blue-600 text-sm">أمثال 5: 21</cite>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="border-2 shadow-lg" style={{ borderColor: 'hsl(var(--logo-purple))' }}>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: 'hsl(var(--logo-purple))' }}>تسجيل الدخول</CardTitle>
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full"
                style={{ 
                  backgroundColor: 'hsl(var(--logo-purple))', 
                  borderColor: 'hsl(var(--logo-purple))'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري التحقق...
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

        {/* Instructions */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-green-800">
              <p className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <strong>للإدارة:</strong> استخدم اسم المستخدم وكلمة المرور الخاصة بالإدارة
              </p>
              <p className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <strong>للطلاب:</strong> استخدم كود الامتحان وكلمة المرور المعطاة لك
              </p>
              <p className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                كل كود يُستخدم مرة واحدة فقط ولا يمكن إعادة الدخول بعد إتمام الامتحان
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="space-y-2 text-xs text-purple-800">
              <p className="font-bold">بيانات تجريبية للاختبار:</p>
              <p><strong>الإدارة:</strong> Fady / F@dy1313</p>
              <p><strong>كود تجريبي:</strong> 1001 / 12345678</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          © 2025 General Secretariat for Scouts & Guides – Shoubra El-Kheima Diocese. All rights reserved.
        </div>
      </div>
    </div>
  )
}
