"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Plus, Trash2, Edit, Search, Eye, CheckSquare, Square } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Question {
  id: number
  question: string
  type: "mcq" | "truefalse"
  options?: string[]
  correctAnswer: number | boolean
  difficulty?: "easy" | "medium" | "hard"
  category?: string
}

interface FormData {
  question: string
  type: "mcq" | "truefalse"
  options: string[]
  correctAnswer: string
  difficulty: "easy" | "medium" | "hard"
  category: string
}

// Initialize with empty array - ready for real data
const initialQuestions: Question[] = []

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

  // Load questions from localStorage on component mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem("questions")
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions)
        setQuestions(parsedQuestions)
      } catch (error) {
        console.error("Error loading questions from localStorage:", error)
      }
    }
  }, [])

  // Save questions to localStorage whenever questions state changes
  useEffect(() => {
    localStorage.setItem("questions", JSON.stringify(questions))
  }, [questions])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    category: "",
    type: "mcq",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || question.category === selectedCategory
    const matchesType = selectedType === "all" || question.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")

        const newQuestions: Question[] = []
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(",").map((v) => v.trim())
            if (values.length >= 4) {
              const questionType = (values[1] as "mcq" | "truefalse") || "mcq"
              let options = undefined
              let correctAnswer: number | boolean = 0
              
              if (questionType === "mcq" && values[2]) {
                options = values[2].split("|").map(opt => opt.trim())
                correctAnswer = parseInt(values[3]) - 1 // Convert to 0-based index
              } else if (questionType === "truefalse") {
                correctAnswer = values[3].toLowerCase() === "true"
              }
              
              const question: Question = {
                id: Date.now() + i,
                question: values[0] || "",
                type: questionType,
                options: options,
                correctAnswer: correctAnswer,
                difficulty: values[4] as "easy" | "medium" | "hard" | undefined,
                category: values[5] || undefined,
              }
              newQuestions.push(question)
            }
          }
        }

        setQuestions((prev) => [...prev, ...newQuestions])
        toast({
          title: "تم رفع الملف بنجاح",
          description: `تم إضافة ${newQuestions.length} سؤال جديد`,
        })
      } catch (error) {
        toast({
          title: "خطأ في رفع الملف",
          description: "يرجى التأكد من صيغة الملف",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const csvContent = `Question,Type,Options (pipe-separated),Correct Answer,Difficulty,Category
من صفات الكشاف الجيد؟,mcq,الصدق|الأمانة|التعاون|جميع ما سبق,4,easy,أساسيات الكشفية
هل الكشافة حركة تربوية؟,truefalse,,true,easy,أساسيات الكشفية`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "questions_template.csv"
    link.click()
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقل المطلوب",
        variant: "destructive",
      })
      return
    }

    let options = undefined
    let correctAnswer: number | boolean = 0

    if (newQuestion.type === "mcq") {
      // Collect all non-empty options
      const allOptions = [
        newQuestion.option1,
        newQuestion.option2,
        newQuestion.option3,
        newQuestion.option4
      ].filter(option => option && option.trim() !== "")
      
      if (allOptions.length < 2) {
        toast({
          title: "خطأ",
          description: "يجب إدخال خيارين على الأقل للأسئلة متعددة الخيارات",
          variant: "destructive",
        })
        return
      }
      
      options = allOptions
      correctAnswer = parseInt(newQuestion.correctAnswer as string) - 1 // Convert to 0-based index
    } else if (newQuestion.type === "truefalse") {
      correctAnswer = newQuestion.correctAnswer === "true" || newQuestion.correctAnswer === true
    }

    const question: Question = {
      id: Date.now(),
      question: newQuestion.question!,
      type: newQuestion.type!,
      options: options,
      correctAnswer: correctAnswer,
      difficulty: newQuestion.difficulty,
      category: newQuestion.category,
    }

    setQuestions((prev) => [...prev, question])
    setNewQuestion({
      category: "",
      type: "mcq",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: 0,
    })
    setIsAddDialogOpen(false)
    toast({
      title: "تم إضافة السؤال بنجاح",
      description: "تم إضافة السؤال للنظام",
    })
  }

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question)
    setShowDeleteModal(true)
  }

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return

    setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id))
    setShowDeleteModal(false)
    setQuestionToDelete(null)
    toast({
      title: "تم حذف السؤال",
      description: "تم حذف السؤال من النظام",
    })
  }

  const handleBulkDelete = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "لم يتم تحديد أسئلة",
        description: "يرجى تحديد الأسئلة المراد حذفها",
        variant: "destructive",
      })
      return
    }
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = () => {
    setQuestions((prev) => prev.filter((q) => !selectedQuestions.includes(q.id.toString())))
    const deletedCount = selectedQuestions.length
    setSelectedQuestions([])
    setShowBulkDeleteModal(false)
    toast({
      title: "تم حذف الأسئلة",
      description: `تم حذف ${deletedCount} سؤال من النظام`,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأسئلة</h1>
          <p className="text-muted-foreground">إدارة بنك الأسئلة والامتحانات</p>
        </div>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="الشعار" className="h-12 w-12" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(var(--logo-purple))] hover:bg-[hsl(var(--logo-purple))]/90">
              <Plus className="h-4 w-4 ml-2" />
              إضافة سؤال
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة سؤال جديد</DialogTitle>
              <DialogDescription>أدخل بيانات السؤال الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value) => setNewQuestion((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Categories will be loaded from backend or defined here */}
                      <SelectItem value="جوالة ودليلات">جوالة ودليلات</SelectItem>
                      <SelectItem value="أشبال وزهرات">أشبال وزهرات</SelectItem>
                      <SelectItem value="كشافة ومرشدات">كشافة ومرشدات</SelectItem>
                      <SelectItem value="متقدم ورائدات">متقدم ورائدات</SelectItem>
                      <SelectItem value="جوالة ودليلات">جوالة ودليلات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">نوع السؤال *</Label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(value: "mcq" | "truefalse") => setNewQuestion((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">اختيار متعدد</SelectItem>
                      <SelectItem value="truefalse">صح أم خطأ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="question">السؤال *</Label>
                <Textarea
                  id="question"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                  placeholder="اكتب السؤال هنا..."
                  rows={3}
                />
              </div>

              {newQuestion.type === "mcq" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option1">الخيار الأول</Label>
                      <Input
                        id="option1"
                        value={newQuestion.option1}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, option1: e.target.value }))}
                        placeholder="الخيار الأول"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option2">الخيار الثاني</Label>
                      <Input
                        id="option2"
                        value={newQuestion.option2}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, option2: e.target.value }))}
                        placeholder="الخيار الثاني"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option3">الخيار الثالث</Label>
                      <Input
                        id="option3"
                        value={newQuestion.option3}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, option3: e.target.value }))}
                        placeholder="الخيار الثالث"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option4">الخيار الرابع</Label>
                      <Input
                        id="option4"
                        value={newQuestion.option4}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, option4: e.target.value }))}
                        placeholder="الخيار الرابع"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="correct">الإجابة الصحيحة</Label>
                    <Select
                      value={newQuestion.correctAnswer?.toString()}
                      onValueChange={(value) =>
                        setNewQuestion((prev) => ({ ...prev, correctAnswer: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الإجابة الصحيحة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">الخيار الأول</SelectItem>
                        <SelectItem value="1">الخيار الثاني</SelectItem>
                        <SelectItem value="2">الخيار الثالث</SelectItem>
                        <SelectItem value="3">الخيار الرابع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {newQuestion.type === "truefalse" && (
                <div>
                  <Label htmlFor="correct-tf">الإجابة الصحيحة</Label>
                  <Select
                    value={newQuestion.correctAnswer?.toString()}
                    onValueChange={(value) => setNewQuestion((prev) => ({ ...prev, correctAnswer: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الإجابة الصحيحة" />
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

        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 ml-2" />
          رفع ملف CSV
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />

        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 ml-2" />
          تحميل القالب
        </Button>

        <Button
          variant="destructive"
          onClick={handleBulkDelete}
          disabled={questions.length === 0}
          className="bg-red-500 hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4 ml-2" />
          حذف المحدد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="البحث في الأسئلة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter">الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {/* Categories will be loaded from backend or defined here */}
                  <SelectItem value="جوالة ودليلات">جوالة ودليلات</SelectItem>
                  <SelectItem value="أشبال وزهرات">أشبال وزهرات</SelectItem>
                  <SelectItem value="كشافة ومرشدات">كشافة ومرشدات</SelectItem>
                  <SelectItem value="متقدم ورائدات">متقدم ورائدات</SelectItem>
                  <SelectItem value="جوالة ودليلات">جوالة ودليلات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">النوع</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="mcq">اختيار متعدد</SelectItem>
                  <SelectItem value="truefalse">صح أم خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>الأسئلة ({filteredQuestions.length})</CardTitle>
          <CardDescription>قائمة بجميع الأسئلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedQuestions.length === filteredQuestions.length) {
                        setSelectedQuestions([])
                      } else {
                        setSelectedQuestions(filteredQuestions.map((q) => q.id.toString()))
                      }
                    }}
                  >
                    {selectedQuestions.length === filteredQuestions.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>السؤال</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="w-[20px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedQuestions.includes(question.id.toString())) {
                          setSelectedQuestions(selectedQuestions.filter((id) => id !== question.id.toString()))
                        } else {
                          setSelectedQuestions([...selectedQuestions, question.id.toString()])
                        }
                      }}
                    >
                      {selectedQuestions.includes(question.id.toString()) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{question.question}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[hsl(var(--logo-blue))]/10 text-[hsl(var(--logo-blue))]">
                      {question.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.type === "mcq" ? "default" : "secondary"}>
                      {question.type === "mcq" ? "اختيار متعدد" : "صح أم خطأ"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewQuestion(question)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteQuestion(question)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معاينة السؤال</DialogTitle>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">{previewQuestion.question}</p>
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">{previewQuestion.category}</Badge>
                  <Badge variant={previewQuestion.type === "mcq" ? "default" : "secondary"}>
                    {previewQuestion.type === "mcq" ? "اختيار متعدد" : "صح أم خطأ"}
                  </Badge>
                </div>
              </div>

              {previewQuestion.type === "mcq" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">الخيارات:</p>
                  {previewQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border ${index === previewQuestion.correctAnswer ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
                    >
                      <span className="text-sm">
                        {index + 1}. {option}
                      </span>
                      {index === previewQuestion.correctAnswer && (
                        <span className="text-green-600 text-xs mr-2">(الإجابة الصحيحة)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {previewQuestion.type === "truefalse" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">الإجابة الصحيحة:</p>
                  <div className="p-2 rounded border bg-green-50 border-green-200">
                    <span className="text-sm">{previewQuestion.correctAnswer ? "صحيح" : "خطأ"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف هذا السؤال؟ لا يمكنك التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Button variant="destructive" onClick={confirmDeleteQuestion} className="col-span-2">
                تأكيد الحذف
              </Button>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="col-span-2">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف الجماعي</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف هذه الأسئلة؟ لا يمكنك التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Button variant="destructive" onClick={confirmBulkDelete} className="col-span-2">
                تأكيد الحذف
              </Button>
              <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)} className="col-span-2">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
