"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Plus, Trash2, Edit, Search, Eye, CheckSquare, Square } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

const categories = ["براعم", "أشبال", "كشافة", "مرشدات", "جوالة", "ذوو الهمم"]

const sampleQuestions: Question[] = [
  {
    id: "1",
    category: "جوالة",
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
    category: "كشافة",
    type: "truefalse",
    question: "الوعد الكشفي يتضمن الولاء لله والوطن والقانون الكشفي",
    correctAnswer: true,
  },
  {
    id: "3",
    category: "أشبال",
    type: "mcq",
    question: "كم عدد مبادئ الحركة الكشفية الأساسية؟",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    correctAnswer: 1,
  },
  {
    id: "4",
    category: "براعم",
    type: "mcq",
    question: "ما هو شعار البراعم؟",
    option1: "كن مستعداً",
    option2: "افعل ما استطعت",
    option3: "اعمل بجد",
    option4: "اخدم وطنك",
    correctAnswer: 1,
  },
  {
    id: "5",
    category: "مرشدات",
    type: "truefalse",
    question: "المرشدة تساعد الآخرين في جميع الأوقات",
    correctAnswer: true,
  },
  {
    id: "6",
    category: "ذوو الهمم",
    type: "mcq",
    question: "ما هو أهم شيء في الكشفية؟",
    option1: "المساعدة",
    option2: "التعاون",
    option3: "الصداقة",
    option4: "جميع ما سبق",
    correctAnswer: 3,
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

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [replaceExistingData, setReplaceExistingData] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || question.category === selectedCategory
    const matchesType = selectedType === "all" || question.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setShowImportModal(true)
    setIsImporting(true)
    setImportProgress(0)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let csv = e.target?.result as string
        
        // Remove BOM if present for better Unicode support
        if (csv.charCodeAt(0) === 0xFEFF) {
          csv = csv.slice(1)
        }

        const lines = csv.split("\n").filter(line => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ''))

        const newQuestions: Question[] = []
        const errors: string[] = []
        let successCount = 0
        let skippedCount = 0

        for (let i = 1; i < lines.length; i++) {
          setImportProgress((i / lines.length) * 100)
          
          if (lines[i].trim()) {
            // Better CSV parsing to handle quoted fields with Arabic text
            const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
            
            if (values.length < 9) {
              errors.push(`السطر ${i + 1}: بيانات ناقصة (${values.length} من 9 حقول مطلوبة)`)
              skippedCount++
              continue
            }

            // Validate category
            if (!categories.includes(values[0])) {
              errors.push(`السطر ${i + 1}: فئة غير صالحة "${values[0]}"`)
              skippedCount++
              continue
            }

            // Validate question type
            if (!["mcq", "truefalse"].includes(values[1])) {
              errors.push(`السطر ${i + 1}: نوع سؤال غير صالح "${values[1]}"`)
              skippedCount++
              continue
            }

            const question: Question = {
              id: Date.now().toString() + i + Math.random(),
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

            // Validate correct answer
            if (values[1] === "mcq" && (isNaN(Number(values[8])) || Number(values[8]) < 1 || Number(values[8]) > 4)) {
              errors.push(`السطر ${i + 1}: إجابة صحيحة غير صالحة للسؤال متعدد الخيارات`)
              skippedCount++
              continue
            }

            newQuestions.push(question)
            successCount++
          }
        }

        setTimeout(() => {
          if (replaceExistingData) {
            setQuestions(newQuestions)
          } else {
            setQuestions((prev) => [...prev, ...newQuestions])
          }

          setImportProgress(100)
          setIsImporting(false)

          const summary = [
            `✅ تم إضافة ${successCount} سؤال بنجاح`,
            skippedCount > 0 ? `⚠️ تم تخطي ${skippedCount} سطر` : '',
            errors.length > 0 ? `❌ ${errors.length} خطأ في المعالجة` : ''
          ].filter(Boolean).join('\n')

          toast({
            title: replaceExistingData ? "تم استبدال الأسئلة" : "تم استيراد الأسئلة",
            description: summary,
          })

          if (errors.length > 0 && errors.length <= 5) {
            setTimeout(() => {
              toast({
                title: "تفاصيل الأخطاء",
                description: errors.slice(0, 5).join('\n'),
                variant: "destructive",
              })
            }, 1000)
          }
        }, 1000)

      } catch (error) {
        setIsImporting(false)
        toast({
          title: "خطأ في معالجة الملف",
          description: "يرجى التأكد من صيغة الملف وترميز UTF-8",
          variant: "destructive",
        })
      }
    }
    
    // Read with UTF-8 encoding
    reader.readAsText(file, 'UTF-8')
  }

  const handleDownloadTemplate = () => {
    const csvContent = [
      "Category,Type,Question,Question EN,Option 1,Option 2,Option 3,Option 4,Correct Answer,Image",
      "جوالة,mcq,من صفات الجوال؟,,الاتكال على الغير,التعاون,السلبية,التردد,2,",
      "كشافة,truefalse,الوعد الكشفي يتضمن الولاء لله والوطن والقانون الكشفي,,,,,,,true,",
      "أشبال,mcq,كم عدد مبادئ الحركة الكشفية الأساسية؟,,2,3,4,5,2,",
      "براعم,mcq,ما هو شعار البراعم؟,,كن مستعداً,افعل ما استطعت,اعمل بجد,اخدم وطنك,2,",
      "مرشدات,truefalse,المرشدة تساعد الآخرين في جميع الأوقات,,,,,,,true,",
      "ذوو الهمم,mcq,ما هو أهم شيء في الكشفية؟,,المساعدة,التعاون,الصداقة,جميع ما سبق,4,"
    ].join("\n")
    
    // Add BOM for proper UTF-8 encoding
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "قالب_الأسئلة.csv"
    link.click()
    
    toast({
      title: "تم تحميل القالب",
      description: "يمكنك تعديل القالب وإعادة رفعه",
    })
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
    setQuestions((prev) => prev.filter((q) => !selectedQuestions.includes(q.id)))
    const deletedCount = selectedQuestions.length
    setSelectedQuestions([])
    setShowBulkDeleteModal(false)
    toast({
      title: "تم حذف الأسئلة",
      description: `تم حذف ${deletedCount} سؤال من النظام`,
    })
  }

  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, questionId])
    } else {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(filteredQuestions.map((question) => question.id))
    } else {
      setSelectedQuestions([])
    }
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

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium">تم تحديد {selectedQuestions.length} سؤال</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف المحدد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
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
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={(checked) => handleSelectQuestion(question.id, checked === true)}
                    />
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.
              {questionToDelete && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <strong>السؤال:</strong> {questionToDelete.question.substring(0, 100)}...
                </div>
              )}
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
              هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.
              <div className="mt-2 p-2 bg-red-50 rounded text-red-700">
                <strong>تحذير:</strong> سيتم حذف {selectedQuestions.length} سؤال نهائياً
              </div>
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

      {/* Import Progress Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استيراد الأسئلة</DialogTitle>
            <DialogDescription>
              {isImporting ? "جاري معالجة الملف..." : "إعدادات الاستيراد"}
            </DialogDescription>
          </DialogHeader>
          
          {isImporting ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>معالجة البيانات...</span>
              </div>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {importProgress.toFixed(0)}% مكتمل
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="replace-questions"
                  checked={replaceExistingData}
                  onCheckedChange={setReplaceExistingData}
                />
                <Label htmlFor="replace-questions" className="text-sm font-medium">
                  استبدال الأسئلة الموجودة
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {replaceExistingData 
                  ? "سيتم حذف جميع الأسئلة الحالية واستبدالها بالأسئلة الجديدة"
                  : "سيتم إضافة الأسئلة الجديدة مع الاحتفاظ بالأسئلة الحالية"
                }
              </p>
            </div>
          )}

          <DialogFooter>
            {!isImporting && (
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                إلغاء
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
