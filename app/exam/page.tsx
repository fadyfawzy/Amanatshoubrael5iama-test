"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Clock, ChevronRight, ChevronLeft, Send } from "lucide-react"

interface Question {
  id: number
  question: string
  type: "mcq" | "truefalse"
  options?: string[]
  correctAnswer: number | boolean
  category?: string
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Load questions on component mount
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const userCategory = localStorage.getItem("userCategory")
    
    if (role !== "student") {
      router.push("/")
      return
    }

    // Load questions from localStorage and filter by category
    const storedQuestions = localStorage.getItem("questions")
    if (storedQuestions) {
      try {
        const allQuestions = JSON.parse(storedQuestions)
        const filteredQuestions = allQuestions.filter((q: Question) => 
          !q.category || q.category === userCategory
        )
        setQuestions(filteredQuestions)
      } catch (error) {
        console.error("Error loading questions:", error)
      }
    }
  }, [router])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitExam()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

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
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitExam = async () => {
    setIsSubmitting(true)
    
    try {
      // Calculate score
      let correctAnswers = 0
      questions.forEach(question => {
        const userAnswer = answers[question.id]
        if (userAnswer === question.correctAnswer) {
          correctAnswers++
        }
      })
      
      const score = Math.round((correctAnswers / questions.length) * 100)
      
      // Save results
      const examCode = localStorage.getItem("examCode")
      const userName = localStorage.getItem("userName")
      const userCategory = localStorage.getItem("userCategory")
      
      const result = {
        examCode,
        userName,
        userCategory,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        answers,
        submittedAt: new Date().toISOString(),
        tabSwitches: tabSwitchCount
      }
      
      // Store result
      const results = JSON.parse(localStorage.getItem("examResults") || "[]")
      results.push(result)
      localStorage.setItem("examResults", JSON.stringify(results))
      
      // Mark exam code as used
      const usedCodes = JSON.parse(localStorage.getItem("usedExamCodes") || "[]")
      usedCodes.push(examCode)
      localStorage.setItem("usedExamCodes", JSON.stringify(usedCodes))
      
      // Redirect to post-evaluation
      router.push("/post-evaluation")
      
    } catch (error) {
      console.error("Error submitting exam:", error)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-arabic">لا توجد أسئلة متاحة</h2>
            <p className="text-gray-600 mb-6 font-arabic">لم يتم إضافة أي أسئلة لفئتك بعد. يرجى المحاولة لاحقاً.</p>
            <Button onClick={() => router.push("/")} className="font-arabic">
              العودة إلى الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]
  const isAnswered = answers[question.id] !== undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Timer */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-scout-900 font-arabic">
                امتحانات الدورة
              </div>
              <div className="text-sm text-scout-600 font-arabic">
                الأمانة العامة للكشافة والمرشدات
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-scout-100 text-scout-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-scout-600 font-arabic">
              السؤال {currentQuestion + 1} من {questions.length}
            </span>
            <span className="text-sm text-scout-600 font-arabic">
              {Math.round(progress)}% مكتمل
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Warning Alert */}
        {showWarning && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="font-arabic text-red-800">
              تحذير: تم رصد محاولات غش متعددة. سيتم تسليم الامتحان تلقائياً خلال 5 ثوانٍ.
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Switch Warning */}
        {tabSwitchCount > 0 && tabSwitchCount < 3 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="font-arabic text-yellow-800">
              تحذير: تم رصد تغيير النافذة ({tabSwitchCount}/3). عند الوصول لـ 3 مرات سيتم تسليم الامتحان تلقائياً.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-scout-900 font-arabic leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {question.type === "mcq" ? (
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              >
                {question.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg hover:bg-scout-50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-right flex-1 cursor-pointer font-arabic leading-relaxed">
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
                <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg hover:bg-scout-50 transition-colors">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer font-arabic text-lg">صحيح</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg hover:bg-scout-50 transition-colors">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer font-arabic text-lg">خطأ</Label>
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 font-arabic"
            >
              <ChevronRight className="w-4 h-4" />
              السؤال السابق
            </Button>

            {/* Question Status */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-arabic ${
                isAnswered 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isAnswered ? 'تم الإجابة' : 'لم تتم الإجابة'}
              </span>
            </div>

            {/* Next/Submit Button */}
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 font-arabic"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري التسليم...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    تسليم الامتحان
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 font-arabic"
              >
                السؤال التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-scout-500 font-arabic">
          © 2025 الأمانة العامة للكشافة والمرشدات – مطرانية شبرا الخيمة
        </div>
      </div>
    </div>
  )
}
