"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, Shield, Eye } from "lucide-react"
import { ExamInterface } from "@/components/exam-interface"

export default function ExamPage() {
  const [showInstructions, setShowInstructions] = useState(true)
  const [examStarted, setExamStarted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "user") {
      router.push("/")
    }
  }, [router])

  const handleStartExam = () => {
    setShowInstructions(false)
    setExamStarted(true)
  }

  if (examStarted) {
    return <ExamInterface />
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 mb-4">
              <img
                src="/logo.png"
                alt="شعار الأمانة العامة للكشافة والمرشدات"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">منصة الامتحانات</h1>
            <p className="text-gray-600">الأمانة العامة للكشافة والمرشدات - مطرانية شبرا الخيمة</p>
          </div>

          {/* Instructions Card */}
          <Card className="border-2 border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-700">تعليمات مهمة قبل البدء</CardTitle>
              <CardDescription>يرجى قراءة التعليمات بعناية قبل البدء في الامتحان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Before Exam */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  قبل الامتحان:
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    تأكد من استقرار الاتصال بالإنترنت
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    أغلق جميع التطبيقات الأخرى
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    تأكد من شحن الجهاز أو توصيله بالكهرباء
                  </li>
                </ul>
              </div>

              {/* During Exam */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  أثناء الامتحان:
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    لا تغادر صفحة الامتحان أو تبدل التبويبات
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    لا تستخدم النسخ واللصق أو القائمة المنسدلة
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    سيتم إنهاء الامتحان تلقائياً عند أي مخالفة
                  </li>
                </ul>
              </div>

              {/* Warning */}
              <Alert className="border-red-200 bg-red-50">
                <Eye className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>تحذير مهم:</strong> سيتم مراقبة الامتحان بالكامل وتسجيل أي محاولة غش. لديك 3 محاولات فقط
                  لتبديل التبويبات قبل الإنهاء التلقائي.
                </AlertDescription>
              </Alert>

              {/* Start Button */}
              <div className="text-center pt-4">
                <Button onClick={handleStartExam} size="lg" className="px-8 py-3 text-lg">
                  بدء الامتحان
                </Button>
              </div>
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

  return null
}
