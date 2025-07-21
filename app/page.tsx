"use client"

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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check admin credentials first
      if (userCode === "Fady" && password === "F@dy1313") {
        localStorage.setItem("userRole", "admin")
        localStorage.setItem("userCode", userCode)
        router.push("/admin")
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم",
        })
        return
      }

      // Check if it's a valid user code and password combination
      if (userCode && password) {
        // Check if this code has been used before
        const usedCodes = JSON.parse(localStorage.getItem("usedExamCodes") || "[]")
        
        if (usedCodes.includes(userCode)) {
          throw new Error("تم استخدام هذا الكود من قبل ولا يمكن إعادة استخدامه")
        }

        // For demo: Accept specific test codes or any 4-digit code with password
        const validCodes = ["1001", "1002", "1003", "1004", "1005"]
        const isValidCode = validCodes.includes(userCode) || /^\d{4}$/.test(userCode)
        
        if (isValidCode && password.length >= 6) {
          // Set user session
          localStorage.setItem("userRole", "user")
          localStorage.setItem("userCode", userCode)
          
          // Navigate to exam
          router.push("/exam")
          
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في امتحانات الدرجات",
          })
          return
        }
      }

      // If we reach here, credentials are invalid
      throw new Error("بيانات الدخول غير صحيحة، تأكد من كود المستخدم وكلمة المرور")

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-40 w-40 mb-6 bg-white rounded-full p-3 shadow-2xl border-4 border-purple-300">
            <img src="/scout-logo.svg" alt="شعار الأمانة العامة للكشافة والمرشدات" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-purple-800 mb-2">امتحانات الدرجات</h1>
          <p className="text-lg text-gray-700 font-semibold">الأمانة العامة للكشافة والمرشدات</p>
          <p className="text-base text-gray-600">مطرانية شبرا الخيمة</p>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-purple-300 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-purple-800">تسجيل الدخول</CardTitle>
            <CardDescription className="text-gray-600">أدخل كود المستخدم وكلمة المرور للمتابعة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userCode" className="text-gray-700 font-semibold">كود المستخدم</Label>
                <Input
                  id="userCode"
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="أدخل كود المستخدم"
                  required
                  className="text-right h-12 text-lg border-2 border-gray-300 focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                    className="text-right h-12 text-lg border-2 border-gray-300 focus:border-purple-500 transition-colors pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري التحقق...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LogIn className="h-5 w-5" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-green-50 border-2 border-green-300 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm text-green-800">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-600 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-green-900">للإدارة:</p>
                  <p>استخدم اسم المستخدم وكلمة المرور الخاصة بالإدارة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-600 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-green-900">للطلاب:</p>
                  <p>استخدم كود الامتحان وكلمة المرور المعطاة لك</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-orange-800">تنبيه مهم:</p>
                  <p className="text-orange-800">كل كود يُستخدم مرة واحدة فقط ولا يمكن إعادة الدخول بعد إتمام الامتحان</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card className="bg-blue-50 border-2 border-blue-300 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-blue-800">
              <p className="font-bold text-center text-blue-900 text-base">بيانات تجريبية للاختبار</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                  <p className="font-bold text-blue-900 mb-2">🔑 الإدارة:</p>
                  <p className="font-mono text-sm bg-blue-100 p-2 rounded">المستخدم: Fady</p>
                  <p className="font-mono text-sm bg-blue-100 p-2 rounded mt-1">كلمة المرور: F@dy1313</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                  <p className="font-bold text-blue-900 mb-2">👤 كود تجريبي:</p>
                  <p className="font-mono text-sm bg-blue-100 p-2 rounded">الكود: 1001</p>
                  <p className="font-mono text-sm bg-blue-100 p-2 rounded mt-1">كلمة المرور: 12345678</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-2">
                  <p className="text-xs text-yellow-800">
                    <strong>ملاحظة:</strong> يمكن استخدام أي كود مكون من 4 أرقام مع كلمة مرور من 6 أحرف على الأقل للاختبار
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 bg-white/70 rounded-lg p-3 shadow">
          © 2025 General Secretariat for Scouts & Guides – Shoubra El-Kheima Diocese. All rights reserved.
        </div>
      </div>
    </div>
  )
}
