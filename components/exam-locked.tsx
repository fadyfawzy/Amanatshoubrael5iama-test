"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, AlertCircle } from "lucide-react"

interface ExamLockedProps {
  userName?: string
  lockReason?: string
}

export function ExamLocked({ userName, lockReason }: ExamLockedProps) {
  const handleReturnToLogin = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userCode")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-700">امتحان مقفل</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">تم قفل الامتحان نهائياً</span>
            </div>
            <p className="text-sm text-red-700">
              {lockReason || "تم إكمال تقييم القائد وقفل الامتحان. لا يمكن إعادة فتحه مرة أخرى."}
            </p>
          </div>

          {userName && (
            <div className="text-sm text-gray-600">
              <strong>المستخدم:</strong> {userName}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>ملاحظة:</strong> للاستفسار عن النتيجة النهائية، يرجى التواصل مع القائد المسؤول
            </p>
          </div>

          <Button onClick={handleReturnToLogin} className="w-full mt-4">
            العودة للصفحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}