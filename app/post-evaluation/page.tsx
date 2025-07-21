"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Save, Lock, CheckCircle, BookOpen } from "lucide-react"

export default function PostEvaluationPage() {
  const [evaluationScore, setEvaluationScore] = useState([75])
  const [leaderPassword, setLeaderPassword] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [examResult, setExamResult] = useState<any>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem("userRole")
    if (role !== "student") {
      router.push("/")
      return
    }

    // Load exam result
    const examCode = localStorage.getItem("examCode")
    const results = JSON.parse(localStorage.getItem("examResults") || "[]")
    const result = results.find((r: any) => r.examCode === examCode)
    
    if (result) {
      setExamResult(result)
      setEvaluationScore([result.score]) // Start with automatic score
    }
  }, [router])

  const handlePasswordSubmit = () => {
    if (leaderPassword === "321m") {
      setShowPasswordForm(false)
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في صفحة التقييم",
      })
    } else {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى إدخال كلمة مرور القائد الصحيحة: 321m",
        variant: "destructive",
      })
    }
  }

  const handleSaveEvaluation = async () => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update exam result with leader evaluation
      const examCode = localStorage.getItem("examCode")
      const results = JSON.parse(localStorage.getItem("examResults") || "[]")
      const resultIndex = results.findIndex((r: any) => r.examCode === examCode)
      
      if (resultIndex !== -1) {
        results[resultIndex] = {
          ...results[resultIndex],
          leaderScore: evaluationScore[0],
          finalScore: evaluationScore[0], // Leader score overrides automatic score
          evaluatedAt: new Date().toISOString(),
          evaluatedBy: "Leader"
        }
        localStorage.setItem("examResults", JSON.stringify(results))
      }

      setIsLocked(true)
      toast({
        title: "تم حفظ التقييم بنجاح",
        description: "تم إقفال الامتحان نهائياً",
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/")
      }, 3000)

    } catch (error) {
      toast({
        title: "خطأ في حفظ التقييم",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!examResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="font-arabic">جاري تحميل نتائج الامتحان...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showPasswordForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-scout-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-scout-900 font-arabic">
                تقييم امتحان التسميع
              </h1>
              <p className="text-scout-700 font-arabic">
                الأمانة العامة للكشافة والمرشدات
              </p>
            </div>
          </div>

          {/* Password Form */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-arabic">دخول القائد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="leaderPassword" className="font-arabic">كلمة مرور القائد</Label>
                <Input
                  id="leaderPassword"
                  type="password"
                  value={leaderPassword}
                  onChange={(e) => setLeaderPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور القائد"
                  className="text-center text-lg font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <p className="text-xs text-scout-600 text-center font-arabic">
                  كلمة المرور الموحدة للقادة: 321m
                </p>
              </div>

              <Button 
                onClick={handlePasswordSubmit}
                disabled={!leaderPassword}
                className="w-full py-3 text-lg font-arabic bg-scout-600 hover:bg-scout-700"
              >
                دخول التقييم
              </Button>
            </CardContent>
          </Card>

          {/* Student Info */}
          <Card className="bg-scout-50 border-scout-200">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-scout-700 font-arabic">
                <div className="flex justify-between">
                  <span>اسم المتقدم:</span>
                  <span className="font-semibold">{examResult.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span>الفئة:</span>
                  <span className="font-semibold">{examResult.userCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span>الدرجة التلقائية:</span>
                  <span className="font-semibold">{examResult.score}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-green-800 font-arabic">تم إكمال التقييم</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white/70 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700 font-arabic mb-2">
                  {evaluationScore[0]}%
                </p>
                <p className="text-green-600 font-arabic">الدرجة النهائية</p>
              </div>
              <p className="text-green-700 font-arabic">
                تم حفظ التقييم وإقفال الامتحان نهائياً
              </p>
              <p className="text-sm text-green-600 font-arabic">
                سيتم توجيهك للصفحة الرئيسية خلال ثوانٍ...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-scout-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-scout-900 font-arabic">
              تقييم امتحان التسميع
            </h1>
            <p className="text-lg text-scout-700 font-arabic">
              الأمانة العامة للكشافة والمرشدات - مطرانية شبرا الخيمة
            </p>
          </div>
        </div>

        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">معلومات المتقدم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-scout-600 font-arabic">اسم المتقدم:</span>
                  <span className="font-semibold font-arabic">{examResult.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-600 font-arabic">الفئة:</span>
                  <span className="font-semibold font-arabic">{examResult.userCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-600 font-arabic">كود الامتحان:</span>
                  <span className="font-semibold font-mono">{examResult.examCode}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-scout-600 font-arabic">تاريخ التسليم:</span>
                  <span className="font-semibold">{new Date(examResult.submittedAt).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-600 font-arabic">وقت التسليم:</span>
                  <span className="font-semibold">{new Date(examResult.submittedAt).toLocaleTimeString('ar-EG')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-600 font-arabic">الإجابات الصحيحة:</span>
                  <span className="font-semibold">{examResult.correctAnswers}/{examResult.totalQuestions}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">ملخص النتائج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-scout-600 font-arabic">إجمالي الأسئلة</p>
                <p className="text-2xl font-bold text-blue-600">{examResult.totalQuestions}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-scout-600 font-arabic">الدرجة التلقائية</p>
                <p className="text-2xl font-bold text-green-600">{examResult.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leader Evaluation */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">تقييم القائد (امتحان التسميع)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="font-arabic">التقييم النهائي: {evaluationScore[0]}%</Label>
              <Slider
                value={evaluationScore}
                onValueChange={setEvaluationScore}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-scout-500 font-arabic">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <Button 
              onClick={handleSaveEvaluation} 
              disabled={isLoading} 
              className="w-full py-3 text-lg font-arabic bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التقييم وإقفال الامتحان
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-800 text-sm font-arabic">
              <strong>تنبيه:</strong> بعد حفظ التقييم، لن يكون بإمكان إعادة فتح هذا الامتحان أو تعديل النتيجة.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-scout-500 font-arabic">
          © 2025 الأمانة العامة للكشافة والمرشدات – مطرانية شبرا الخيمة
        </div>
      </div>
    </div>
  )
}