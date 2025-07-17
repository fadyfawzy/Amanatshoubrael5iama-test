"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Plus, Trash2, Edit, Search, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Question {
  id: string
  category: string
  type: "mcq" | "truefalse"
  question: string
  questionEn?: string
  option1?: string
  option2?: string
  option3?: string
  option4?: string
  correctAnswer: number | boolean
  image?: string
}

const categories = ["براعم وذو الهمم", "أشبال وزهرات", "كشافة ومرشدات", "متقدم ورائدات", "جوالة ودليلات"]

const sampleQuestions: Question[] = [
  {
    id: "1",
    category: "جوالة ودليلات",
    type: "mcq",
    question: "من صفات الجوال؟",
    option1: "الاتكال على الغير",
    option2: "التعاون",
    option3: "السلبية",
    option4: "التردد",
    correctAnswer: 1,
  },
  {
    id: "2",
    category: "كشافة ومرشدات",
    type: "truefalse",
    question: "الوعد الكشفي يتضمن الولاء لله والوطن والقانون الكشفي",
    correctAnswer: true,
  },
  {
    id: "3",
    category: "أشبال وزهرات",
    type: "mcq",
    question: "كم عدد مبادئ الحركة الكشفية الأساسية؟",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    correctAnswer: 1,
  },
]

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions)
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
            const question: Question = {
              id: Date.now().toString() + i,
              category: values[0] || "",
              type: (values[1] as "mcq" | "truefalse") || "mcq",
              question: values[2] || "",
              questionEn: values[3] || undefined,
              option1: values[4] || undefined,
              option2: values[5] || undefined,
              option3: values[6] || undefined,
              option4: values[7] || undefined,
              correctAnswer: values[1] === "truefalse" ? values[8] === "true" : Number.parseInt(values[8]) - 1,
              image: values[9] || undefined,
            }
            newQuestions.push(question)
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
    const csvContent = `Category,Type,Question,Question EN,Option 1,Option 2,Option 3,Option 4,Correct Answer,Image
جوالة ودليلات,mcq,من صفات الجوال؟,,الاتكال على الغير,التعاون,السلبية,التردد,2,`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "questions_template.csv"
    link.click()
  }

  const handleAddQuestion = () => {
    if (!newQuestion.category || !newQuestion.question) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    const question: Question = {
      id: Date.now().toString(),
      category: newQuestion.category!,
      type: newQuestion.type!,
      question: newQuestion.question!,
      option1: newQuestion.option1,
      option2: newQuestion.option2,
      option3: newQuestion.option3,
      option4: newQuestion.option4,
      correctAnswer: newQuestion.correctAnswer!,
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
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
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
                <TableHead>السؤال</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
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
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
                  {[
                    previewQuestion.option1,
                    previewQuestion.option2,
                    previewQuestion.option3,
                    previewQuestion.option4,
                  ].map((option, index) => (
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
    </div>
  )
}
