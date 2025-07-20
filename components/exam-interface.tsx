"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Clock, Send } from "lucide-react"
import { PostExamEvaluation } from "./post-exam-evaluation"

// Sample questions data
const sampleQuestions = [
  {
    id: 1,
    question: "ما هو الهدف الأساسي من الحركة الكشفية؟",
    type: "mcq",
    options: ["تنمية الشخصية المتكاملة للفرد", "تعلم المهارات الرياضية فقط", "الحصول على الشارات", "قضاء وقت الفراغ"],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "الوعد الكشفي يتضمن الولاء لله والوطن والقانون الكشفي",
    type: "truefalse",
    correctAnswer: true,
  },
  {
    id: 3,
    question: "كم عدد مبادئ الحركة الكشفية الأساسية؟",
    type: "mcq",
    options: ["2", "3", "4", "5"],
    correctAnswer: 1,
  },
]

export function ExamInterface() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const router = useRouter()

  // Anti-cheating: Monitor tab switching
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1
        if (newCount >= 3) {
          // Force submit exam
          setExamCompleted(true)
          alert("تم إنهاء الامتحان تلقائياً بسبب تبديل التبويبات")
        } else {
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 5000)
        }
        return newCount
      })
    }
  }, [])

  // Anti-cheating: Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "c") ||
        (e.ctrlKey && e.key === "v")
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !examCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setExamCompleted(true)
    }
  }, [timeLeft, examCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setExamCompleted(true)
    setShowEvaluation(true)
  }

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100
  const question = sampleQuestions[currentQuestion]

  if (showEvaluation) {
    return <PostExamEvaluation answers={answers} questions={sampleQuestions} />
  }

  if (examCompleted && !showEvaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>تم إكمال الامتحان</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium">تم تسجيل إجاباتك</p>
            <p className="text-sm text-muted-foreground">
              يرجى انتظار تقييم القائد. سيتم إشعارك بالنتيجة النهائية بعد اكتمال التقييم.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>ملاحظة:</strong> لا يمكن إعادة فتح هذا الامتحان مرة أخرى
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem("userRole")
                localStorage.removeItem("userCode")
                window.location.href = "/"
              }}
              className="w-full mt-4"
            >
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 exam-container no-context-menu">
      {/* Warning Alert */}
      {showWarning && (
        <Alert className="fixed top-4 left-4 right-4 z-50 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            تحذير: تم رصد تبديل التبويبات ({tabSwitchCount}/3). عند الوصول لـ 3 محاولات سيتم إنهاء الامتحان تلقائياً.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">امتحان الكشافة والمرشدات</h1>
            <p className="text-sm text-muted-foreground">
              السؤال {currentQuestion + 1} من {sampleQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 300 ? "text-red-600 font-bold" : ""}>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm">محاولات التبديل: {tabSwitchCount}/3</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.type === "mcq" && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
                >
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "truefalse" && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value === "true")}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="cursor-pointer">
                      صحيح
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="cursor-pointer">
                      خطأ
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              السؤال السابق
            </Button>

            <div className="flex gap-2">
              {currentQuestion === sampleQuestions.length - 1 ? (
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  إنهاء الامتحان
                </Button>
              ) : (
                <Button onClick={handleNext}>السؤال التالي</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2">
        <div className="text-center text-xs text-gray-500">
          © 2025 الأمانة العامة للكشافة والمرشدات بمطرانية شبرا الخيمة - جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  )
}
