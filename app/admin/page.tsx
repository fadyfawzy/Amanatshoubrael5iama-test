"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Download, Users, BookOpen, BarChart3, Settings, Trash2 } from "lucide-react"

const categories = [
  "جوالة ودليلات", // Rovers and Guides
  "كشافة ومرشدات", // Scouts and Guides  
  "أشبال وزهرات", // Cubs and Brownies
  "براعم وذو الهمم" // Cubs and People with Disabilities
]

export default function AdminPage() {
  const [examCodes, setExamCodes] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "mcq" as "mcq" | "truefalse",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: ""
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is admin
    const role = localStorage.getItem("userRole")
    if (role !== "admin") {
      router.push("/")
      return
    }

    // Load data
    loadData()
  }, [router])

  const loadData = () => {
    setExamCodes(JSON.parse(localStorage.getItem("examCodes") || "[]"))
    setQuestions(JSON.parse(localStorage.getItem("questions") || "[]"))
    setResults(JSON.parse(localStorage.getItem("examResults") || "[]"))
  }

  const handleAddExamCode = () => {
    if (!newCode || !newName || !newCategory) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      })
      return
    }

    const existingCodes = JSON.parse(localStorage.getItem("examCodes") || "[]")
    if (existingCodes.find((code: any) => code.code === newCode)) {
      toast({
        title: "خطأ",
        description: "كود الامتحان موجود مسبقاً",
        variant: "destructive",
      })
      return
    }

    const codeData = {
      code: newCode,
      name: newName,
      category: newCategory,
      createdAt: new Date().toISOString()
    }

    existingCodes.push(codeData)
    localStorage.setItem("examCodes", JSON.stringify(existingCodes))
    setExamCodes(existingCodes)
    setNewCode("")
    setNewName("")
    setNewCategory("")

    toast({
      title: "تم إضافة الكود بنجاح",
      description: `تم إنشاء كود امتحان: ${newCode}`,
    })
  }

  const handleDeleteCode = (codeToDelete: string) => {
    const updatedCodes = examCodes.filter(code => code.code !== codeToDelete)
    localStorage.setItem("examCodes", JSON.stringify(updatedCodes))
    setExamCodes(updatedCodes)
    
    toast({
      title: "تم حذف الكود",
      description: "تم حذف كود الامتحان بنجاح",
    })
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    if (newQuestion.type === "mcq" && (!newQuestion.options[0] || !newQuestion.options[1])) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال خيارين على الأقل للأسئلة متعددة الخيارات",
        variant: "destructive",
      })
      return
    }

    const questionData = {
      id: Date.now(),
      question: newQuestion.question,
      type: newQuestion.type,
      options: newQuestion.type === "mcq" ? newQuestion.options.filter(opt => opt.trim()) : undefined,
      correctAnswer: newQuestion.type === "mcq" ? newQuestion.correctAnswer : undefined,
      category: newQuestion.category
    }

    const existingQuestions = JSON.parse(localStorage.getItem("questions") || "[]")
    existingQuestions.push(questionData)
    localStorage.setItem("questions", JSON.stringify(existingQuestions))
    setQuestions(existingQuestions)
    
    setNewQuestion({
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: 0,
      category: ""
    })

    toast({
      title: "تم إضافة السؤال بنجاح",
      description: "تم إضافة السؤال إلى قاعدة البيانات",
    })
  }

  const handleDownloadResults = () => {
    const csv = results.map(result => 
      `${result.examCode},${result.userName},${result.userCategory},${result.score}%,${result.finalScore || result.score}%,${new Date(result.submittedAt).toLocaleDateString('ar-EG')}`
    ).join('\n')
    
    const content = `كود الامتحان,اسم المتقدم,الفئة,الدرجة التلقائية,الدرجة النهائية,تاريخ التسليم\n${csv}`
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `exam_results_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const stats = {
    totalCodes: examCodes.length,
    usedCodes: results.length,
    totalQuestions: questions.length,
    averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.finalScore || r.score), 0) / results.length) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-scout-50 to-scout-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-scout-900 font-arabic">
              لوحة تحكم الإدارة
            </h1>
            <p className="text-scout-700 font-arabic">
              امتحانات الدورة - الأمانة العامة للكشافة والمرشدات
            </p>
          </div>
          <Button onClick={() => router.push("/")} variant="outline" className="font-arabic">
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-scout-600 font-arabic">إجمالي الأكواد</p>
                  <p className="text-2xl font-bold text-scout-900">{stats.totalCodes}</p>
                </div>
                <Users className="w-8 h-8 text-scout-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-scout-600 font-arabic">الأكواد المستخدمة</p>
                  <p className="text-2xl font-bold text-scout-900">{stats.usedCodes}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-scout-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-scout-600 font-arabic">إجمالي الأسئلة</p>
                  <p className="text-2xl font-bold text-scout-900">{stats.totalQuestions}</p>
                </div>
                <BookOpen className="w-8 h-8 text-scout-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-scout-600 font-arabic">متوسط الدرجات</p>
                  <p className="text-2xl font-bold text-scout-900">{stats.averageScore}%</p>
                </div>
                <Settings className="w-8 h-8 text-scout-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="codes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="codes" className="font-arabic">أكواد الامتحان</TabsTrigger>
            <TabsTrigger value="questions" className="font-arabic">الأسئلة</TabsTrigger>
            <TabsTrigger value="results" className="font-arabic">النتائج</TabsTrigger>
          </TabsList>

          {/* Exam Codes Tab */}
          <TabsContent value="codes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">إضافة كود امتحان جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="font-arabic">كود الامتحان</Label>
                    <Input
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="أدخل كود الامتحان"
                      className="font-arabic"
                    />
                  </div>
                  <div>
                    <Label className="font-arabic">اسم المتقدم</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="أدخل اسم المتقدم"
                      className="font-arabic"
                    />
                  </div>
                  <div>
                    <Label className="font-arabic">الفئة</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="font-arabic">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category} className="font-arabic">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddExamCode} className="font-arabic">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة كود الامتحان
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">أكواد الامتحان المسجلة</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-arabic">كود الامتحان</TableHead>
                      <TableHead className="font-arabic">اسم المتقدم</TableHead>
                      <TableHead className="font-arabic">الفئة</TableHead>
                      <TableHead className="font-arabic">الحالة</TableHead>
                      <TableHead className="font-arabic">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examCodes.map(code => {
                      const isUsed = results.find(r => r.examCode === code.code)
                      return (
                        <TableRow key={code.code}>
                          <TableCell className="font-mono">{code.code}</TableCell>
                          <TableCell className="font-arabic">{code.name}</TableCell>
                          <TableCell className="font-arabic">{code.category}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-arabic ${
                              isUsed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isUsed ? 'مستخدم' : 'متاح'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {!isUsed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCode(code.code)}
                                className="font-arabic"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">إضافة سؤال جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-arabic">نص السؤال</Label>
                    <Input
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                      placeholder="أدخل نص السؤال"
                      className="font-arabic"
                    />
                  </div>
                  <div>
                    <Label className="font-arabic">الفئة</Label>
                    <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}>
                      <SelectTrigger className="font-arabic">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category} className="font-arabic">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newQuestion.type === "mcq" && (
                  <div className="grid grid-cols-2 gap-4">
                    {newQuestion.options.map((option, index) => (
                      <div key={index}>
                        <Label className="font-arabic">الخيار {index + 1}</Label>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options]
                            newOptions[index] = e.target.value
                            setNewQuestion({...newQuestion, options: newOptions})
                          }}
                          placeholder={`الخيار ${index + 1}`}
                          className="font-arabic"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <Button onClick={handleAddQuestion} className="font-arabic">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة السؤال
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">الأسئلة المسجلة ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map(question => (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-arabic font-semibold">{question.question}</p>
                          <p className="text-sm text-scout-600 font-arabic mt-1">الفئة: {question.category}</p>
                          {question.options && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option: string, index: number) => (
                                <p key={index} className="text-sm font-arabic">• {option}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-scout-100 text-scout-700 rounded text-xs font-arabic">
                          {question.type === "mcq" ? "اختيار متعدد" : "صح/خطأ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-arabic">نتائج الامتحانات</CardTitle>
                <Button onClick={handleDownloadResults} variant="outline" className="font-arabic">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل النتائج
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-arabic">كود الامتحان</TableHead>
                      <TableHead className="font-arabic">اسم المتقدم</TableHead>
                      <TableHead className="font-arabic">الفئة</TableHead>
                      <TableHead className="font-arabic">الدرجة التلقائية</TableHead>
                      <TableHead className="font-arabic">الدرجة النهائية</TableHead>
                      <TableHead className="font-arabic">تاريخ التسليم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(result => (
                      <TableRow key={result.examCode}>
                        <TableCell className="font-mono">{result.examCode}</TableCell>
                        <TableCell className="font-arabic">{result.userName}</TableCell>
                        <TableCell className="font-arabic">{result.userCategory}</TableCell>
                        <TableCell className="font-bold">{result.score}%</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {result.finalScore || result.score}%
                        </TableCell>
                        <TableCell>{new Date(result.submittedAt).toLocaleDateString('ar-EG')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-xs text-scout-500 font-arabic">
          © 2025 الأمانة العامة للكشافة والمرشدات – مطرانية شبرا الخيمة
        </div>
      </div>
    </div>
  )
}