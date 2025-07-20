"use client"

import { useState, useEffect } from "react"
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
  const [leaderName, setLeaderName] = useState("")
  const [isMemorizationExam, setIsMemorizationExam] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [examAlreadyLocked, setExamAlreadyLocked] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if exam is already locked on component mount
  useEffect(() => {
    const userCode = localStorage.getItem("userCode")
    const lockedExams = JSON.parse(localStorage.getItem("lockedExams") || "[]")

    if (lockedExams.includes(userCode)) {
      setExamAlreadyLocked(true)
    }

    // Check if this is a memorization exam (you can determine this based on question categories or a setting)
    const examSettings = JSON.parse(localStorage.getItem("examSettings") || "{}")
    setIsMemorizationExam(examSettings.isMemorizationExam || false)
  }, [])

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

  // If exam is already locked, show locked message
  if (examAlreadyLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-700">امتحان مقفل</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-600">
              لقد أكملت هذا الامتحان بالفعل ولا يمكن فتحه مرة أخرى. يرجى التواصل مع القائد إذا احتجت مراجعة.
            </p>
            <Button
              onClick={() => {
                localStorage.removeItem("userRole")
                localStorage.removeItem("userCode")
                router.push("/")
              }}
              className="w-full"
            >
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveEvaluation = async () => {
    // For memorization exams, only require leader name
    if (isMemorizationExam) {
      if (!leaderName.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال اسم القائد",
          variant: "destructive",
        })
        return
      }
    } else {
      // For regular exams, require leader password
      if (!leaderPassword) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال كلمة مرور القائد",
          variant: "destructive",
        })
        return
      }

      // Validate leader password
      const validPasswords = ["Leader123", "القائد123", "F@dy1313"]
      if (!validPasswords.includes(leaderPassword)) {
        toast({
          title: "كلمة مرور خاطئة",
          description: "يرجى إدخال كلمة مرور القائد الصحيحة",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Lock the exam for this user
      const userCode = localStorage.getItem("userCode")
      const lockedExams = JSON.parse(localStorage.getItem("lockedExams") || "[]")
      lockedExams.push(userCode)
      localStorage.setItem("lockedExams", JSON.stringify(lockedExams))

      // Save evaluation data
      const evaluationData = {
        userCode,
        automaticScore: calculateScore(),
        evaluationScore: evaluationScore[0],
        leaderPassword: leaderPassword, // In real app, this would be hashed
        timestamp: new Date().toISOString(),
        locked: true,
      }

      localStorage.setItem(`evaluation_${userCode}`, JSON.stringify(evaluationData))

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

            {isMemorizationExam ? (
              <div className="space-y-2">
                <Label htmlFor="leaderName">اسم القائد</Label>
                <Input
                  id="leaderName"
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="أدخل اسم القائد"
                  className="text-right"
                />
                <p className="text-xs text-gray-500">مطلوب لحفظ تقييم امتحان التسميع</p>
              </div>
            ) : (
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
            )}

            <Button 
              onClick={handleSaveEvaluation} 
              disabled={isLoading || (isMemorizationExam ? !leaderName.trim() : !leaderPassword)} 
              className="w-full"
            >
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
