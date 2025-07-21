"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, BookOpen, Users, Award } from "lucide-react"

export default function LoginPage() {
  const [examCode, setExamCode] = useState("")
  const [showCode, setShowCode] = useState(false)
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
      if (examCode === "admin321") {
        localStorage.setItem("userRole", "admin")
        localStorage.setItem("examCode", examCode)
        router.push("/admin")
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم",
        })
      } else {
        // Check if exam code exists and is not used
        const usedCodes = JSON.parse(localStorage.getItem("usedExamCodes") || "[]")
        const validCodes = JSON.parse(localStorage.getItem("examCodes") || "[]")
        
        // Find the code in valid codes
        const codeData = validCodes.find((code: any) => code.code === examCode)
        
        if (!codeData) {
          throw new Error("كود الامتحان غير صحيح")
        }
        
        if (usedCodes.includes(examCode)) {
          throw new Error("تم استخدام كود الامتحان مسبقاً ولا يمكن إعادة الدخول")
        }

        // Valid code, proceed to exam
        localStorage.setItem("userRole", "student")
        localStorage.setItem("examCode", examCode)
        localStorage.setItem("userCategory", codeData.category)
        localStorage.setItem("userName", codeData.name || "")
        
        router.push("/pre-exam")
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${codeData.name || ""}`,
        })
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-scout-600 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-scout-900 font-arabic">
              امتحانات الدورة
            </h1>
            <p className="text-lg text-scout-700 font-arabic">
              الأمانة العامة للكشافة والمرشدات
            </p>
            <p className="text-base text-scout-600 font-arabic">
              مطرانية شبرا الخيمة
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-scout-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-scout-600" />
            </div>
            <p className="text-xs text-scout-600 font-arabic">جوالة ومرشدات</p>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-scout-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-scout-600" />
            </div>
            <p className="text-xs text-scout-600 font-arabic">أشبال وزهرات</p>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-scout-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-scout-600" />
            </div>
            <p className="text-xs text-scout-600 font-arabic">ذوي الهمم</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-arabic">دخول الامتحان</CardTitle>
            <CardDescription className="text-center font-arabic">
              أدخل كود الامتحان الخاص بك للمتابعة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examCode" className="font-arabic">كود الامتحان</Label>
                <div className="relative">
                  <Input
                    id="examCode"
                    type={showCode ? "text" : "password"}
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    placeholder="أدخل كود الامتحان"
                    required
                    className="text-right pr-4 pl-12 font-arabic text-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !examCode} 
                className="w-full py-3 text-lg font-arabic bg-scout-600 hover:bg-scout-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري التحقق...
                  </div>
                ) : (
                  "دخول الامتحان"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-scout-50 border-scout-200">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-scout-700 font-arabic">
              <p className="flex items-start gap-2">
                <span className="w-2 h-2 bg-scout-400 rounded-full mt-2 flex-shrink-0"></span>
                يمكن استخدام كود الامتحان مرة واحدة فقط
              </p>
              <p className="flex items-start gap-2">
                <span className="w-2 h-2 bg-scout-400 rounded-full mt-2 flex-shrink-0"></span>
                بعد تسليم الامتحان لا يمكن إعادة الدخول
              </p>
              <p className="flex items-start gap-2">
                <span className="w-2 h-2 bg-scout-400 rounded-full mt-2 flex-shrink-0"></span>
                تأكد من اتصال الإنترنت قبل البدء
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-scout-500 font-arabic space-y-1">
          <p>© 2025 الأمانة العامة للكشافة والمرشدات – مطرانية شبرا الخيمة</p>
          <p>جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  )
}
