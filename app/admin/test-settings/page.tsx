"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  Clock,
  Target,
  HelpCircle,
  Eye,
  Shield,
  GripVertical,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const categories = ["براعم", "أشبال", "كشافة", "مرشدات", "جوالة", "ذوو الهمم"]

interface ExamSettings {
  category: string
  duration: number
  passingScore: number
  mcqCount: number
  trueFalseCount: number
  imageBasedCount: number
  randomizeQuestions: boolean
  showResults: boolean
  allowRetake: boolean
  language: string
}

interface Question {
  id: string
  category: string
  type: "mcq" | "truefalse" | "image"
  question: string
  options?: string[]
  correctAnswer: number | boolean
  order: number
}

export default function TestSettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    category: categories[0],
    duration: 60,
    passingScore: 70,
    mcqCount: 10,
    trueFalseCount: 5,
    imageBasedCount: 0,
    randomizeQuestions: true,
    showResults: true,
    allowRetake: false,
    language: "arabic",
  })

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      category: "كشافة ومرشدات",
      type: "mcq",
      question: "ما هو الهدف الأساسي من الحركة الكشفية؟",
      options: ["تنمية الشخصية المتكاملة", "تعلم المهارات الرياضية", "الحصول على الشارات", "قضاء وقت الفراغ"],
      correctAnswer: 0,
      order: 1,
    },
    {
      id: "2",
      category: "كشافة ومرشدات",
      type: "truefalse",
      question: "الوعد الكشفي يتضمن الولاء لله والوطن والقانون الكشفي",
      correctAnswer: true,
      order: 2,
    },
  ])

  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    type: "mcq" as "mcq" | "truefalse" | "image",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  })
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)

  const { toast } = useToast()

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      setIsAutoSaving(true)
      // Simulate API call
      setTimeout(() => {
        setIsAutoSaving(false)
        setLastSaved(new Date())
      }, 500)
    }

    const interval = setInterval(autoSave, 2000)
    return () => clearInterval(interval)
  }, [examSettings, questions])

  const handleSettingChange = (key: keyof ExamSettings, value: any) => {
    setExamSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص السؤال",
        variant: "destructive",
      })
      return
    }

    const question: Question = {
      id: Date.now().toString(),
      category: selectedCategory,
      type: newQuestion.type,
      question: newQuestion.question,
      options: newQuestion.type === "mcq" ? newQuestion.options : undefined,
      correctAnswer: newQuestion.correctAnswer,
      order: questions.length + 1,
    }

    setQuestions((prev) => [...prev, question])
    setNewQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    })
    setIsAddQuestionOpen(false)

    toast({
      title: "تم إضافة السؤال",
      description: "تم إضافة السؤال بنجاح",
    })
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    toast({
      title: "تم حذف السؤال",
      description: "تم حذف السؤال بنجاح",
    })
  }

  const filteredQuestions = questions.filter((q) => q.category === selectedCategory)

  const ExamPreview = () => (
    <Card className="border-2 border-blue-200">
      <CardHeader className="text-center bg-blue-50">
        <div className="mx-auto h-16 w-16 mb-4">
          <img src="/logo.png" alt="الشعار" className="w-full h-full object-contain" />
        </div>
        <CardTitle>معاينة الامتحان - {selectedCategory}</CardTitle>
        <CardDescription>
          المدة: {examSettings.duration} دقيقة | النجاح: {examSettings.passingScore}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-700 mb-2">تعليمات مهمة قبل البدء</h3>
          <div className="text-sm space-y-2">
            <div>
              <p className="font-semibold">قبل الامتحان:</p>
              <ul className="list-disc list-inside mr-4 space-y-1">
                <li>تأكد من استقرار الاتصال بالإنترنت</li>
                <li>أغلق جميع التطبيقات الأخرى</li>
                <li>تأكد من شحن الجهاز أو توصيله بالكهرباء</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">أثناء الامتحان:</p>
              <ul className="list-disc list-inside mr-4 space-y-1">
                <li>لا تغادر صفحة الامتحان أو تبدل التبويبات</li>
                <li>لا تستخدم النسخ واللصق أو القائمة المنسدلة</li>
                <li>سيتم إنهاء الامتحان تلقائياً عند أي مخالفة</li>
              </ul>
            </div>
            <div className="bg-red-100 p-2 rounded">
              <p className="font-bold text-red-800">
                تحذير مهم: سيتم مراقبة الامتحان بالكامل وتسجيل أي محاولة غش. لديك 3 محاولات فقط لتبديل التبويبات قبل
                الإنهاء التلقائي.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">عينة من الأسئلة:</h4>
          {filteredQuestions.slice(0, 2).map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4">
              <p className="font-medium mb-2">
                السؤال {index + 1}: {question.question}
              </p>
              {question.type === "mcq" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded-full"></div>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              )}
              {question.type === "truefalse" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded-full"></div>
                    <span className="text-sm">صحيح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded-full"></div>
                    <span className="text-sm">خطأ</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الاختبار</h1>
          <p className="text-muted-foreground">تكوين الامتحانات والأسئلة لكل فئة</p>
        </div>
        <div className="flex items-center gap-4">
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              جاري الحفظ...
            </div>
          )}
          {lastSaved && !isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              آخر حفظ: {lastSaved.toLocaleTimeString("ar-EG")}
            </div>
          )}
          <img src="/logo.png" alt="الشعار" className="h-12 w-12" />
        </div>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            اختيار الفئة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">الإعدادات العامة</TabsTrigger>
          <TabsTrigger value="questions">إدارة الأسئلة</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="preview">المعاينة</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Duration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  إعدادات المدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>مدة الامتحان (بالدقائق)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[examSettings.duration]}
                      onValueChange={([value]) => handleSettingChange("duration", value)}
                      max={180}
                      min={15}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-16 text-center font-medium">{examSettings.duration} د</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passing Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  درجة النجاح
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الحد الأدنى للنجاح (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[examSettings.passingScore]}
                      onValueChange={([value]) => handleSettingChange("passingScore", value)}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-16 text-center font-medium">{examSettings.passingScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Distribution */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  توزيع الأسئلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>أسئلة الاختيار المتعدد</Label>
                    <Input
                      type="number"
                      value={examSettings.mcqCount}
                      onChange={(e) => handleSettingChange("mcqCount", Number.parseInt(e.target.value) || 0)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label>أسئلة صح أم خطأ</Label>
                    <Input
                      type="number"
                      value={examSettings.trueFalseCount}
                      onChange={(e) => handleSettingChange("trueFalseCount", Number.parseInt(e.target.value) || 0)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label>الأسئلة المصورة</Label>
                    <Input
                      type="number"
                      value={examSettings.imageBasedCount}
                      onChange={(e) => handleSettingChange("imageBasedCount", Number.parseInt(e.target.value) || 0)}
                      min="0"
                      max="20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>إعدادات إضافية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>ترتيب الأسئلة عشوائياً</Label>
                  <Switch
                    checked={examSettings.randomizeQuestions}
                    onCheckedChange={(checked) => handleSettingChange("randomizeQuestions", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>إظهار النتائج فوراً</Label>
                  <Switch
                    checked={examSettings.showResults}
                    onCheckedChange={(checked) => handleSettingChange("showResults", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>السماح بإعادة المحاولة</Label>
                  <Switch
                    checked={examSettings.allowRetake}
                    onCheckedChange={(checked) => handleSettingChange("allowRetake", checked)}
                  />
                </div>
                <div>
                  <Label>لغة الامتحان</Label>
                  <Select
                    value={examSettings.language}
                    onValueChange={(value) => handleSettingChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arabic">العربية</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="bilingual">ثنائي اللغة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              أسئلة فئة: {selectedCategory} ({filteredQuestions.length} سؤال)
            </h3>
            <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة سؤال
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة سؤال جديد</DialogTitle>
                  <DialogDescription>إضافة سؤال جديد لفئة {selectedCategory}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>نوع السؤال</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value: "mcq" | "truefalse" | "image") =>
                        setNewQuestion((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">اختيار متعدد</SelectItem>
                        <SelectItem value="truefalse">صح أم خطأ</SelectItem>
                        <SelectItem value="image">سؤال مصور</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>نص السؤال</Label>
                    <Textarea
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                      placeholder="اكتب السؤال هنا..."
                      rows={3}
                    />
                  </div>

                  {newQuestion.type === "mcq" && (
                    <div className="space-y-3">
                      <Label>الخيارات</Label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-8 text-center">{index + 1}.</span>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options]
                              newOptions[index] = e.target.value
                              setNewQuestion((prev) => ({ ...prev, options: newOptions }))
                            }}
                            placeholder={`الخيار ${index + 1}`}
                          />
                          <input
                            type="radio"
                            name="correct"
                            checked={newQuestion.correctAnswer === index}
                            onChange={() => setNewQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {newQuestion.type === "truefalse" && (
                    <div>
                      <Label>الإجابة الصحيحة</Label>
                      <Select
                        value={newQuestion.correctAnswer.toString()}
                        onValueChange={(value) =>
                          setNewQuestion((prev) => ({ ...prev, correctAnswer: value === "true" }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">صحيح</SelectItem>
                          <SelectItem value="false">خطأ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={handleAddQuestion} className="w-full">
                    إضافة السؤال
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-2">
                {filteredQuestions.map((question, index) => (
                  <div key={question.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={question.type === "mcq" ? "default" : "secondary"}>
                          {question.type === "mcq"
                            ? "اختيار متعدد"
                            : question.type === "truefalse"
                              ? "صح أم خطأ"
                              : "مصور"}
                        </Badge>
                        <span className="text-sm text-gray-500">السؤال {index + 1}</span>
                      </div>
                      <p className="text-sm">{question.question}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">لا توجد أسئلة لهذه الفئة بعد</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات الأمان ومكافحة الغش
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">مراقبة التبويبات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>عدد المحاولات المسموحة</span>
                      <Badge>3 محاولات</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>الإجراء عند التجاوز</span>
                      <Badge variant="destructive">إنهاء الامتحان</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">تقييد الإدخال</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>النسخ واللصق</span>
                      <Badge variant="destructive">محظور</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>القائمة المنسدلة</span>
                      <Badge variant="destructive">محظور</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>أدوات المطور</span>
                      <Badge variant="destructive">محظور</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">التعليمات المعروضة للطلاب</h4>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>
                    <strong>قبل الامتحان:</strong>
                  </p>
                  <ul className="list-disc list-inside mr-4">
                    <li>تأكد من استقرار الاتصال بالإنترنت</li>
                    <li>أغلق جميع التطبيقات الأخرى</li>
                    <li>تأكد من شحن الجهاز أو توصيله بالكهرباء</li>
                  </ul>
                  <p>
                    <strong>أثناء الامتحان:</strong>
                  </p>
                  <ul className="list-disc list-inside mr-4">
                    <li>لا تغادر صفحة الامتحان أو تبدل التبويبات</li>
                    <li>لا تستخدم النسخ واللصق أو القائمة المنسدلة</li>
                    <li>سيتم إنهاء الامتحان تلقائياً عند أي مخالفة</li>
                  </ul>
                  <p>
                    <strong>تحذير مهم:</strong> سيتم مراقبة الامتحان بالكامل وتسجيل أي محاولة غش. لديك 3 محاولات فقط
                    لتبديل التبويبات قبل الإنهاء التلقائي.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">معاينة الامتحان</h3>
            <Button onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 ml-2" />
              {showPreview ? "إخفاء المعاينة" : "عرض المعاينة"}
            </Button>
          </div>

          {showPreview && <ExamPreview />}

          <Card>
            <CardHeader>
              <CardTitle>ملخص الإعدادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>الفئة:</span>
                    <Badge>{selectedCategory}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>المدة:</span>
                    <span>{examSettings.duration} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>درجة النجاح:</span>
                    <span>{examSettings.passingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>اللغة:</span>
                    <span>
                      {examSettings.language === "arabic"
                        ? "العربية"
                        : examSettings.language === "english"
                          ? "English"
                          : "ثنائي اللغة"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>أسئلة الاختيار المتعدد:</span>
                    <span>{examSettings.mcqCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>أسئلة صح أم خطأ:</span>
                    <span>{examSettings.trueFalseCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الأسئلة المصورة:</span>
                    <span>{examSettings.imageBasedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الأسئلة:</span>
                    <Badge variant="outline">
                      {examSettings.mcqCount + examSettings.trueFalseCount + examSettings.imageBasedCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
