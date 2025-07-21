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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-32 w-32 mb-6 bg-white rounded-full p-4 shadow-lg border-4 border-purple-200">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Outer decorative border in purple */}
              <path d="M100 10 L110 20 L120 10 L130 20 L140 10 L150 20 L160 15 L170 25 L180 20 L185 30 L190 25 L185 35 L190 45 L185 55 L190 65 L185 75 L190 85 L185 95 L190 105 L185 115 L190 125 L185 135 L190 145 L185 155 L190 165 L185 175 L180 180 L170 175 L160 185 L150 180 L140 190 L130 180 L120 190 L110 180 L100 190 L90 180 L80 190 L70 180 L60 190 L50 180 L40 185 L30 175 L20 180 L15 170 L10 175 L15 165 L10 155 L15 145 L10 135 L15 125 L10 115 L15 105 L10 95 L15 85 L10 75 L15 65 L10 55 L15 45 L10 35 L15 25 L20 20 L30 25 L40 15 L50 20 L60 10 L70 20 L80 10 L90 20 Z" fill="#8B4B9C" stroke="#8B4B9C" strokeWidth="2"/>
              
              {/* Main circular frame */}
              <circle cx="100" cy="100" r="75" fill="white" stroke="#2C3E50" strokeWidth="3"/>
              
              {/* Central tent/mountain design in green */}
              <path d="M100 45 L85 75 L70 85 L100 85 L130 85 L115 75 Z" fill="#2E8B57" stroke="#2E8B57" strokeWidth="2"/>
              <path d="M100 45 L115 75 L130 85 L100 85 L70 85 L85 75 Z" fill="#2E8B57" stroke="#2E8B57" strokeWidth="2"/>
              
              {/* Cross in brown */}
              <path d="M100 45 L105 50 L100 55 L95 50 Z" fill="#8B4513"/>
              <rect x="98" y="48" width="4" height="15" fill="#8B4513"/>
              <rect x="92" y="52" width="16" height="4" fill="#8B4513"/>
              
              {/* Central pole in brown */}
              <rect x="98" y="55" width="4" height="25" fill="#8B4513"/>
              
              {/* Water waves in blue */}
              <path d="M 70 110 Q 80 105 90 110 T 110 110 T 130 110" stroke="#4169E1" strokeWidth="3" fill="none"/>
              <path d="M 70 115 Q 80 110 90 115 T 110 115 T 130 115" stroke="#4169E1" strokeWidth="3" fill="none"/>
              <path d="M 70 120 Q 80 115 90 120 T 110 120 T 130 120" stroke="#4169E1" strokeWidth="3" fill="none"/>
              
              {/* Scout fleur-de-lis at bottom in purple */}
              <path d="M100 140 L95 150 L100 155 L105 150 Z M95 145 L90 155 L95 160 L100 155 Z M105 145 L110 155 L105 160 L100 155 Z" fill="#8B4B9C"/>
              
              {/* Text paths */}
              <defs>
                <path id="top-curve" d="M 35,100 A 65,65 0 0,1 165,100"/>
                <path id="bottom-curve" d="M 165,100 A 65,65 0 0,1 35,100"/>
              </defs>
              <text fontSize="10" fontWeight="bold" fill="#2C3E50" textAnchor="middle">
                <textPath href="#top-curve" startOffset="50%">مطرانية شبرا الخيمة</textPath>
              </text>
              <text fontSize="10" fontWeight="bold" fill="#2C3E50" textAnchor="middle">
                <textPath href="#bottom-curve" startOffset="50%">الأمانة العامة للكشافة</textPath>
              </text>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-purple-800 mb-2">امتحانات الدرجات</h1>
          <p className="text-lg text-gray-700">الأمانة العامة للكشافة والمرشدات</p>
          <p className="text-base text-gray-600">مطرانية شبرا الخيمة</p>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-purple-300 shadow-xl bg-white/95 backdrop-blur-sm">
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
                className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
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
        <Card className="bg-green-50 border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm text-green-800">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold">للإدارة:</p>
                  <p>استخدم اسم المستخدم وكلمة المرور الخاصة بالإدارة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold">للطلاب:</p>
                  <p>استخدم كود الامتحان وكلمة المرور المعطاة لك</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold">ملاحظة مهمة:</p>
                  <p>كل كود يُستخدم مرة واحدة فقط ولا يمكن إعادة الدخول بعد إتمام الامتحان</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-blue-800">
              <p className="font-bold text-center text-blue-900">بيانات تجريبية للاختبار</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="font-semibold text-blue-900">الإدارة:</p>
                  <p className="font-mono">المستخدم: Fady</p>
                  <p className="font-mono">كلمة المرور: F@dy1313</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="font-semibold text-blue-900">كود تجريبي:</p>
                  <p className="font-mono">الكود: 1001</p>
                  <p className="font-mono">كلمة المرور: 12345678</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 bg-white/50 rounded-lg p-3">
          © 2025 General Secretariat for Scouts & Guides – Shoubra El-Kheima Diocese. All rights reserved.
        </div>
      </div>
    </div>
  )
}
