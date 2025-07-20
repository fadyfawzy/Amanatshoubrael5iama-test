"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Clock, Send, BookOpen } from "lucide-react"
import { PostExamEvaluation } from "./post-exam-evaluation"

// Questions will be loaded from localStorage or API
const loadQuestions = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("questions")
    return stored ? JSON.parse(stored) : []
  }
  return []
}

export function ExamInterface() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const router = useRouter()

  // Load questions on component mount
  useEffect(() => {
    const examQuestions = loadQuestions()
    setQuestions(examQuestions)
  }, [])

  // Anti-cheating: Monitor tab switching
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setTabSwitchCount(prev => {
        const newCount = prev + 1
        if (newCount >= 3) {
          setShowWarning(true)
          // Auto-submit exam after 3 tab switches
          setTimeout(() => {
            handleSubmitExam()
          }, 5000)
        }
        return newCount
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [handleVisibilityChange])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !examCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleSubmitExam()
    }
  }, [timeLeft, examCompleted])

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitExam = () => {
    setExamCompleted(true)
    setShowEvaluation(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userCode")
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // If no questions are available, show empty state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد أسئلة متاحة</h2>
            <p className="text-gray-600 mb-6">لم يتم إضافة أي أسئلة للامتحان بعد. يرجى المحاولة لاحقاً.</p>
            <Button onClick={handleLogout}>
              العودة إلى الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  if (showEvaluation) {
    return <PostExamEvaluation answers={answers} questions={questions} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">امتحان الكشافة والمرشدات</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                <span className={timeLeft < 300 ? "text-red-600" : "text-green-600"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>السؤال {currentQuestion + 1} من {questions.length}</span>
              <span>{Math.round(progress)}% مكتمل</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Warning Alert */}
        {showWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              تحذير: تم رصد محاولة غش! تم تسجيل {tabSwitchCount} محاولات تبديل النوافذ. 
              {tabSwitchCount >= 3 && " سيتم إنهاء الامتحان تلقائياً خلال 5 ثوانِ."}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-right">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === "mcq" ? (
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              >
                {question.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-right flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.id, value === "true")}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">صحيح</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">خطأ</Label>
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            السؤال السابق
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 ml-2" />
                إنهاء الامتحان
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                السؤال التالي
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
