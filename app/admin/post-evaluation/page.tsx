"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Clock, User, CheckCircle, Lock, Eye, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Types
interface PendingEvaluation {
  id: string
  userCode: string
  userName: string
  church: string
  category: string
  examName: string
  examScore: number
  examPercent: number
  completionTime: string
  status: "pending" | "completed" | "locked"
  answers?: any[]
}

interface EvaluationCriteria {
  id: string
  name: string
  maxScore: number
  weight: number
}

// Sample data
const samplePendingEvaluations: PendingEvaluation[] = [
  {
    id: "1",
    userCode: "1001",
    userName: "أحمد محمد",
    church: "العذراء",
    category: "كشافة ومرشدات",
    examName: "امتحان الكشافة - المستوى الأول",
    examScore: 8,
    examPercent: 80,
    completionTime: "2025-07-17T14:30:00",
    status: "pending",
  },
  {
    id: "2",
    userCode: "1002",
    userName: "فاطمة علي",
    church: "مار جرجس",
    category: "أشبال وزهرات",
    examName: "امتحان الأشبال - المستوى الثاني",
    examScore: 7,
    examPercent: 70,
    completionTime: "2025-07-17T13:45:00",
    status: "pending",
  },
  {
    id: "3",
    userCode: "1003",
    userName: "محمد حسن",
    church: "الأنبا أنطونيوس",
    category: "جوالة ودليلات",
    examName: "امتحان الجوالة - المستوى المتقدم",
    examScore: 9,
    examPercent: 90,
    completionTime: "2025-07-17T12:20:00",
    status: "completed",
  },
]

const evaluationCriteria: EvaluationCriteria[] = [
  { id: "memorization", name: "حفظ الآيات والأدعية", maxScore: 100, weight: 40 },
  { id: "behavior", name: "السلوك والالتزام", maxScore: 100, weight: 30 },
  { id: "participation", name: "المشاركة والتفاعل", maxScore: 100, weight: 20 },
  { id: "scout_chants", name: "الترديد الكشفي", maxScore: 100, weight: 10 },
]

const categories = ["براعم وذو الهمم", "أشبال وزهرات", "كشافة ومرشدات", "متقدم ورائدات", "جوالة ودليلات"]

export default function PostEvaluationPage() {
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>(samplePendingEvaluations)
  const [selectedEvaluation, setSelectedEvaluation] = useState<PendingEvaluation | null>(null)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Evaluation form state
  const [evaluationScores, setEvaluationScores] = useState<Record<string, number>>({})
  const [leaderPassword, setLeaderPassword] = useState("")
  const [evaluationNotes, setEvaluationNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const filteredEvaluations = pendingEvaluations.filter((evaluation) => {
    const matchesCategory = categoryFilter === "all" || evaluation.category === categoryFilter
    const matchesStatus = statusFilter === "all" || evaluation.status === statusFilter
    return matchesCategory && matchesStatus
  })

  const handleStartEvaluation = (evaluation: PendingEvaluation) => {
    setSelectedEvaluation(evaluation)
    setEvaluationScores({})
    setLeaderPassword("")
    setEvaluationNotes("")
    setShowEvaluationModal(true)
  }

  const validateLeaderPassword = (password: string): boolean => {
    // In a real app, this would check against a database of leader passwords
    const validPasswords = ["Leader123", "القائد123", "F@dy1313"]
    return validPasswords.includes(password)
  }

  const calculateFinalScore = (): number => {
    let totalWeightedScore = 0
    let totalWeight = 0

    evaluationCriteria.forEach((criteria) => {
      const score = evaluationScores[criteria.id] || 0
      totalWeightedScore += (score * criteria.weight) / 100
      totalWeight += criteria.weight
    })

    return Math.round(totalWeightedScore)
  }

  const handleSubmitEvaluation = async () => {
    if (!selectedEvaluation) return

    // Validate leader password
    if (!validateLeaderPassword(leaderPassword)) {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى إدخال كلمة مرور القائد الصحيحة",
        variant: "destructive",
      })
      return
    }

    // Validate all scores are entered
    const missingScores = evaluationCriteria.filter((criteria) => !evaluationScores[criteria.id])
    if (missingScores.length > 0) {
      toast({
        title: "تقييم غير مكتمل",
        description: "يرجى إدخال جميع درجات التقييم",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const finalScore = calculateFinalScore()

      // Update the evaluation status
      setPendingEvaluations((prev) =>
        prev.map((evaluation) => {
          if (evaluation.id === selectedEvaluation.id) {
            return {
              ...evaluation,
              status: "locked" as const,
            }
          }
          return evaluation
        }),
      )

      toast({
        title: "تم حفظ التقييم بنجاح",
        description: `تم تقييم ${selectedEvaluation.userName} وقفل الامتحان`,
      })

      setShowEvaluationModal(false)
      setSelectedEvaluation(null)
    } catch (error) {
      toast({
        title: "خطأ في حفظ التقييم",
        description: "حدث خطأ أثناء حفظ التقييم، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            في الانتظار
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            مكتمل
          </Badge>
        )
      case "locked":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Lock className="h-3 w-3 mr-1" />
            مقفل
          </Badge>
        )
      default:
        return null
    }
  }

  // Statistics
  const pendingCount = pendingEvaluations.filter((e) => e.status === "pending").length
  const completedCount = pendingEvaluations.filter((e) => e.status === "completed").length
  const lockedCount = pendingEvaluations.filter((e) => e.status === "locked").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-[hsl(var(--logo-green))]" />
            تقييم ما بعد الامتحان
          </h1>
          <p className="text-muted-foreground">تقييم المحفوظات والسلوك للطلاب</p>
        </div>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="الشعار" className="h-12 w-12" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">تحتاج تقييم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">تم التقييم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مقفل</CardTitle>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{lockedCount}</div>
            <p className="text-xs text-muted-foreground">مقفل نهائياً</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>التصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label>الفئة</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="locked">مقفل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>الامتحانات المطلوب تقييمها ({filteredEvaluations.length})</CardTitle>
          <CardDescription>قائمة بالامتحانات التي تحتاج تقييم أو تم تقييمها</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>كود المستخدم</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>درجة الامتحان</TableHead>
                <TableHead>تاريخ الإنهاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.userCode}</TableCell>
                  <TableCell>{evaluation.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {evaluation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{evaluation.examPercent}%</span>
                      <span className="text-sm text-gray-500">({evaluation.examScore}/10)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(evaluation.completionTime).toLocaleDateString("ar-EG")}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(evaluation.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {evaluation.status === "pending" && (
                        <Button size="sm" onClick={() => handleStartEvaluation(evaluation)}>
                          <User className="h-4 w-4 ml-1" />
                          بدء التقييم
                        </Button>
                      )}
                      {evaluation.status !== "pending" && (
                        <Button variant="outline" size="sm" onClick={() => handleStartEvaluation(evaluation)}>
                          <Eye className="h-4 w-4 ml-1" />
                          عرض التقييم
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Evaluation Modal */}
      <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تقييم ما بعد الامتحان</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.userName} - {selectedEvaluation?.userCode}
            </DialogDescription>
          </DialogHeader>

          {selectedEvaluation && (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات الطالب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الاسم:</span>
                      <span className="text-sm font-medium">{selectedEvaluation.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الكود:</span>
                      <span className="text-sm font-medium">{selectedEvaluation.userCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الكنيسة:</span>
                      <span className="text-sm font-medium">{selectedEvaluation.church}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الفئة:</span>
                      <span className="text-sm font-medium">{selectedEvaluation.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">درجة الامتحان:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {selectedEvaluation.examPercent}% ({selectedEvaluation.examScore}/10)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">تاريخ الإنهاء:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedEvaluation.completionTime).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluation Criteria */}
              {selectedEvaluation.status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">معايير التقييم</CardTitle>
                    <CardDescription>يرجى تقييم الطالب في المجالات التالية</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {evaluationCriteria.map((criteria) => (
                        <div key={criteria.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">{criteria.name}</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">الوزن: {criteria.weight}%</span>
                              <span className="text-sm font-medium">
                                {evaluationScores[criteria.id] || 0}/{criteria.maxScore}
                              </span>
                            </div>
                          </div>
                          <Slider
                            value={[evaluationScores[criteria.id] || 0]}
                            onValueChange={([value]) =>
                              setEvaluationScores((prev) => ({ ...prev, [criteria.id]: value }))
                            }
                            max={criteria.maxScore}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0</span>
                            <span>{criteria.maxScore / 2}</span>
                            <span>{criteria.maxScore}</span>
                          </div>
                        </div>
                      ))}

                      {/* Final Score Preview */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">الدرجة النهائية المتوقعة:</span>
                          <span className="text-xl font-bold text-blue-600">{calculateFinalScore()}/100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedEvaluation.status === "pending" && (
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                  <Textarea
                    id="notes"
                    value={evaluationNotes}
                    onChange={(e) => setEvaluationNotes(e.target.value)}
                    placeholder="أضف أي ملاحظات حول أداء الطالب..."
                    rows={3}
                  />
                </div>
              )}

              {/* Leader Password */}
              {selectedEvaluation.status === "pending" && (
                <div className="space-y-2">
                  <Label htmlFor="leader-password">كلمة مرور القائد *</Label>
                  <Input
                    id="leader-password"
                    type="password"
                    value={leaderPassword}
                    onChange={(e) => setLeaderPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور القائد"
                  />
                  <p className="text-xs text-gray-500">مطلوبة لحفظ التقييم وقفل الامتحان</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvaluationModal(false)}>
              إغلاق
            </Button>
            {selectedEvaluation?.status === "pending" && (
              <Button
                onClick={handleSubmitEvaluation}
                disabled={isSubmitting || !leaderPassword}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التقييم وقفل الامتحان
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-6">
        © 2025 الأمانة العامة للكشافة والمرشدات بمطرانية شبرا الخيمة - جميع الحقوق محفوظة
      </div>
    </div>
  )
}
