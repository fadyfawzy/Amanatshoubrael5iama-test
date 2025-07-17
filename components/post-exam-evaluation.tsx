"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Save, Lock } from "lucide-react"

interface PostExamEvaluationProps {
  answers: Record<number, any>
  questions: any[]
}

export function PostExamEvaluation({ answers, questions }: PostExamEvaluationProps) {
  const [evaluationScore, setEvaluationScore] = useState([75])
  const [leaderPassword, setLeaderPassword] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Calculate automatic score
  const calculateScore = () => {
    let correct = 0
    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      if (userAnswer === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  const automaticScore = calculateScore()

  const handleSaveEvaluation = async () => {
    if (!leaderPassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة مرور القائد",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call to save evaluation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Here you would typically save to database:
      // - User code
      // - Automatic score
      // - Evaluation score
      // - Leader password (hashed)
      // - Timestamp
      // - Lock the exam

      setIsLocked(true)
      toast({
        title: "تم حفظ التقييم بنجاح",
        description: "تم قفل الامتحان ولا يمكن إعادة فتحه",
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

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-700">تم حفظ التقييم</CardTitle>
            <CardDescription>تم قفل الامتحان بنجاح</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p>
                <strong>الدرجة التلقائية:</strong> {automaticScore}%
              </p>
              <p>
                <strong>تقييم القائد:</strong> {evaluationScore[0]}%
              </p>
            </div>
            <p className="text-sm text-muted-foreground">سيتم توجيهك للصفحة الرئيسية خلال ثوانٍ...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تقييم ما بعد الامتحان</h1>
          <p className="text-gray-600">يرجى من القائد إدخال التقييم النهائي</p>
        </div>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص النتائج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">إجمالي الأسئلة</p>
                <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">الدرجة التلقائية</p>
                <p className="text-2xl font-bold text-green-600">{automaticScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Form */}
        <Card>
          <CardHeader>
            <CardTitle>تقييم القائد</CardTitle>
            <CardDescription>يرجى تقييم أداء المتقدم من 0 إلى 100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>التقييم النهائي: {evaluationScore[0]}%</Label>
              <Slider
                value={evaluationScore}
                onValueChange={setEvaluationScore}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaderPassword">كلمة مرور القائد</Label>
              <Input
                id="leaderPassword"
                type="password"
                value={leaderPassword}
                onChange={(e) => setLeaderPassword(e.target.value)}
                placeholder="أدخل كلمة مرور القائد"
                className="text-right"
              />
              <p className="text-xs text-gray-500">مطلوبة لحفظ التقييم وقفل الامتحان</p>
            </div>

            <Button onClick={handleSaveEvaluation} disabled={isLoading || !leaderPassword} className="w-full">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التقييم وقفل الامتحان
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-800 text-sm">
              <strong>تنبيه:</strong> بعد حفظ التقييم، لن يكون بإمكان إعادة فتح هذا الامتحان أو تعديل النتيجة.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
