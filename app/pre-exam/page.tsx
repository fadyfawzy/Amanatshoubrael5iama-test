"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Shield, Eye, AlertTriangle } from "lucide-react"

export default function PreExamPage() {
  const [userName, setUserName] = useState("")
  const [userCategory, setUserCategory] = useState("")
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")
    const category = localStorage.getItem("userCategory")
    
    if (role !== "student") {
      router.push("/")
      return
    }

    setUserName(name || "")
    setUserCategory(category || "")
  }, [router])

  const handleStartExam = () => {
    router.push("/exam")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-scout-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-scout-900 font-arabic">
              امتحانات الدورة
            </h1>
            <p className="text-lg text-scout-700 font-arabic">
              الأمانة العامة للكشافة والمرشدات - مطرانية شبرا الخيمة
            </p>
          </div>
        </div>

        {/* Bible Verse */}
        <Card className="shadow-lg border-scout-200 bg-gradient-to-r from-scout-50 to-blue-50">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-scout-600 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-arabic text-scout-900">آية للتأمل</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-white/70 rounded-lg p-6 space-y-4">
              <p className="text-xl leading-relaxed text-scout-800 font-arabic">
                "لأَنَّ طُرُقَ الإِنْسَانِ أَمَامَ عَيْنَيِ الرَّبِّ، وَهُوَ يَزِنُ جَمِيعَ سُبُلِهِ"
              </p>
              <p className="text-lg text-scout-600 font-arabic">
                (أمثال 5: 21)
              </p>
            </div>
            <p className="text-sm text-scout-600 font-arabic italic">
              اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ
            </p>
          </CardContent>
        </Card>

        {/* Student Info */}
        {userName && (
          <Card className="border-scout-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-scout-600 font-arabic">اسم المتقدم</p>
                  <p className="text-lg font-semibold text-scout-900 font-arabic">{userName}</p>
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm text-scout-600 font-arabic">الفئة</p>
                  <p className="text-lg font-semibold text-scout-900 font-arabic">{userCategory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exam Instructions */}
        <Card className="border-scout-200">
          <CardHeader>
            <CardTitle className="text-xl font-arabic text-scout-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              تعليمات مهمة قبل بدء الامتحان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Time and Navigation */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-scout-50 rounded-lg">
                  <Clock className="w-5 h-5 text-scout-600" />
                  <div>
                    <p className="font-semibold text-scout-900 font-arabic">المدة الزمنية</p>
                    <p className="text-sm text-scout-600 font-arabic">60 دقيقة للامتحان كاملاً</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-scout-50 rounded-lg">
                  <Eye className="w-5 h-5 text-scout-600" />
                  <div>
                    <p className="font-semibold text-scout-900 font-arabic">التنقل بين الأسئلة</p>
                    <p className="text-sm text-scout-600 font-arabic">يمكنك المراجعة والتعديل</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-scout-50 rounded-lg">
                  <Shield className="w-5 h-5 text-scout-600" />
                  <div>
                    <p className="font-semibold text-scout-900 font-arabic">مكافحة الغش</p>
                    <p className="text-sm text-scout-600 font-arabic">لا تغير النافذة أثناء الامتحان</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-scout-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-scout-600" />
                  <div>
                    <p className="font-semibold text-scout-900 font-arabic">نوع الأسئلة</p>
                    <p className="text-sm text-scout-600 font-arabic">اختيار متعدد وصح/خطأ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Warnings */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="font-arabic text-amber-800">
                <div className="space-y-2">
                  <p className="font-semibold">تحذيرات مهمة:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• تغيير النافذة أو التبديل بين التطبيقات سيؤدي إلى تسليم الامتحان تلقائياً</li>
                    <li>• لا يمكن إعادة دخول الامتحان بعد التسليم</li>
                    <li>• تأكد من اتصال الإنترنت المستقر</li>
                    <li>• اقرأ الأسئلة بعناية قبل الإجابة</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Readiness Check */}
            <div className="space-y-4 p-4 bg-scout-50 rounded-lg">
              <p className="font-semibold text-scout-900 font-arabic">تأكد من الاستعداد:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-scout-300" 
                    onChange={(e) => setIsReady(e.target.checked)}
                  />
                  <span className="text-sm font-arabic">قرأت جميع التعليمات وأنا مستعد لبدء الامتحان</span>
                </label>
              </div>
            </div>

            {/* Start Exam Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleStartExam}
                disabled={!isReady}
                className="flex-1 py-4 text-lg font-arabic bg-scout-600 hover:bg-scout-700 disabled:opacity-50"
              >
                بدء الامتحان الآن
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="px-8 py-4 font-arabic border-scout-300 text-scout-700 hover:bg-scout-50"
              >
                الخروج
              </Button>
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