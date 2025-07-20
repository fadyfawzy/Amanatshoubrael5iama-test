"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Download,
  FileSpreadsheet,
  Filter,
  Lock,
  MoreVertical,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  FileText,
  RefreshCw,
  Trash2,
  CalendarIcon,
  X,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

// Types
interface ExamResult {
  id: string
  userCode: string
  userName: string
  church: string
  category: string
  examScoreRaw: number
  examScorePercent: number
  memorizationScore: number | null
  status: "pending" | "completed" | "locked" | "cheated"
  completionTime: string
  evaluatedBy: string | null
  durationTaken: string
  attempts: number
  lockReason: string | null
  alertsCount: number
  totalQuestions: number
  passingThreshold: number
  answers?: { questionId: string; userAnswer: any; correct: boolean }[]
  alerts?: { time: string; type: string; details: string }[]
}

// Initialize with empty array - ready for real exam results
const initialResults: ExamResult[] = []

const categories = ["براعم وذو الهمم", "أشبال وزهرات", "كشافة ومرشدات", "متقدم ورائدات", "جوالة ودليلات"]
const churches = ["العذراء", "مار جرجس", "الأنبا أنطونيوس", "الملاك ميخائيل", "مارمرقس"]
const statusOptions = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "locked", label: "مغلق" },
  { value: "cheated", label: "غش" },
]

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>(initialResults)
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>(initialResults)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [churchFilter, setChurchFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [minScoreFilter, setMinScoreFilter] = useState<number | "">("")
  const [hasAlertsFilter, setHasAlertsFilter] = useState(false)

  const { toast } = useToast()
  const csvLinkRef = useRef<HTMLAnchorElement>(null)

  // Apply filters
  useEffect(() => {
    let filtered = [...results]

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (result) =>
          result.userCode.toLowerCase().includes(term) ||
          result.userName.toLowerCase().includes(term) ||
          result.church.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((result) => result.category === categoryFilter)
    }

    // Church filter
    if (churchFilter !== "all") {
      filtered = filtered.filter((result) => result.church === churchFilter)
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((result) => statusFilter.includes(result.status))
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter((result) => new Date(result.completionTime) >= new Date(dateRange.from!))
    }
    if (dateRange.to) {
      filtered = filtered.filter((result) => new Date(result.completionTime) <= new Date(dateRange.to!))
    }

    // Min score filter
    if (minScoreFilter !== "") {
      filtered = filtered.filter((result) => result.examScorePercent >= minScoreFilter)
    }

    // Has alerts filter
    if (hasAlertsFilter) {
      filtered = filtered.filter((result) => result.alertsCount > 0)
    }

    setFilteredResults(filtered)
  }, [results, searchTerm, categoryFilter, churchFilter, statusFilter, dateRange, minScoreFilter, hasAlertsFilter])

  const handleViewDetails = (result: ExamResult) => {
    setSelectedResult(result)
    setShowDetailModal(true)
  }

  const handleDeleteResult = (result: ExamResult) => {
    setSelectedResult(result)
    setShowDeleteModal(true)
  }

  const handleResetAttempt = (result: ExamResult) => {
    setSelectedResult(result)
    setShowResetModal(true)
  }

  const confirmDeleteResult = () => {
    if (!selectedResult) return

    setResults((prev) => prev.filter((r) => r.id !== selectedResult.id))
    setShowDeleteModal(false)
    toast({
      title: "تم حذف النتيجة",
      description: `تم حذف نتيجة ${selectedResult.userName} بنجاح`,
    })
  }

  const confirmResetAttempt = () => {
    if (!selectedResult) return

    setResults((prev) =>
      prev.map((r) => {
        if (r.id === selectedResult.id) {
          return {
            ...r,
            status: "pending",
            memorizationScore: null,
            evaluatedBy: null,
            lockReason: null,
          }
        }
        return r
      }),
    )
    setShowResetModal(false)
    toast({
      title: "تم إعادة ضبط المحاولة",
      description: `تم إعادة ضبط محاولة ${selectedResult.userName} بنجاح`,
    })
  }

  const exportToCSV = () => {
    setIsExporting(true)

    try {
      // Create CSV header
      const headers = [
        "كود المستخدم",
        "الاسم",
        "الكنيسة",
        "الفئة",
        "الدرجة",
        "النسبة المئوية",
        "تقييم المحفوظات",
        "الحالة",
        "تاريخ ووقت الإنهاء",
        "اسم المُقيِّم",
        "الزمن المستغرق",
        "عدد المحاولات",
        "سبب القفل",
        "تنبيهات الغش",
      ]

      // Convert results to CSV rows
      const rows = filteredResults.map((result) => [
        result.userCode,
        result.userName,
        result.church,
        result.category,
        result.examScoreRaw,
        `${result.examScorePercent}%`,
        result.memorizationScore !== null ? result.memorizationScore : "",
        result.status === "pending"
          ? "قيد الانتظار"
          : result.status === "locked"
            ? "مغلق"
            : result.status === "cheated"
              ? "غش"
              : "مكتمل",
        new Date(result.completionTime).toLocaleString("ar-EG"),
        result.evaluatedBy || "",
        result.durationTaken,
        result.attempts,
        result.lockReason || "",
        result.alertsCount,
      ])

      // Combine header and rows
      const csvContent = [
        "\uFEFF" + headers.join(","), // Add BOM for UTF-8 encoding
        ...rows.map((row) => row.join(",")),
      ].join("\n")

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      // Create a link and click it
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `نتائج_الامتحانات_${new Date().toLocaleDateString("ar-EG")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "تم تصدير النتائج",
        description: `تم تصدير ${filteredResults.length} نتيجة بنجاح`,
      })
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير النتائج",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportSingleResult = (result: ExamResult) => {
    try {
      // Create CSV header
      const headers = [
        "كود المستخدم",
        "الاسم",
        "الكنيسة",
        "الفئة",
        "الدرجة",
        "النسبة المئوية",
        "تقييم المحفوظات",
        "الحالة",
        "تاريخ ووقت الإنهاء",
        "اسم المُقيِّم",
        "الزمن المستغرق",
        "عدد المحاولات",
        "سبب القفل",
        "تنبيهات الغش",
      ]

      // Convert result to CSV row
      const row = [
        result.userCode,
        result.userName,
        result.church,
        result.category,
        result.examScoreRaw,
        `${result.examScorePercent}%`,
        result.memorizationScore !== null ? result.memorizationScore : "",
        result.status === "pending"
          ? "قيد الانتظار"
          : result.status === "locked"
            ? "مغلق"
            : result.status === "cheated"
              ? "غش"
              : "مكتمل",
        new Date(result.completionTime).toLocaleString("ar-EG"),
        result.evaluatedBy || "",
        result.durationTaken,
        result.attempts,
        result.lockReason || "",
        result.alertsCount,
      ]

      // Combine header and row
      const csvContent = [
        "\uFEFF" + headers.join(","), // Add BOM for UTF-8 encoding
        row.join(","),
      ].join("\n")

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      // Create a link and click it
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `نتيجة_${result.userName}_${result.userCode}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "تم تصدير النتيجة",
        description: `تم تصدير نتيجة ${result.userName} بنجاح`,
      })
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير النتيجة",
        variant: "destructive",
      })
    }
  }

  const printCertificate = (result: ExamResult) => {
    // In a real app, this would open a print dialog with a certificate template
    toast({
      title: "طباعة الشهادة",
      description: `جاري تحضير شهادة ${result.userName}...`,
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setChurchFilter("all")
    setStatusFilter([])
    setDateRange({ from: undefined, to: undefined })
    setMinScoreFilter("")
    setHasAlertsFilter(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
            قيد الانتظار
          </Badge>
        )
      case "locked":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Lock className="h-3 w-3 mr-1" />
            مغلق
          </Badge>
        )
      case "cheated":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            غش
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            مكتمل
          </Badge>
        )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">النتائج</h1>
          <p className="text-muted-foreground">عرض وإدارة نتائج الامتحانات</p>
        </div>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="الشعار" className="h-12 w-12" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث بالكود، الاسم، أو الكنيسة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            الفلاتر
            {(categoryFilter !== "all" ||
              churchFilter !== "all" ||
              statusFilter.length > 0 ||
              dateRange.from ||
              dateRange.to ||
              minScoreFilter !== "" ||
              hasAlertsFilter) && (
              <Badge className="h-5 w-5 p-0 flex items-center justify-center">
                {
                  [
                    categoryFilter !== "all",
                    churchFilter !== "all",
                    statusFilter.length > 0,
                    dateRange.from || dateRange.to,
                    minScoreFilter !== "",
                    hasAlertsFilter,
                  ].filter(Boolean).length
                }
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting}
            className="flex items-center gap-2 bg-transparent"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                تصدير النتائج
              </>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>تصفية النتائج</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 ml-1" />
                  مسح الفلاتر
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>الفئة</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الفئات" />
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
                  <Label>الكنيسة</Label>
                  <Select value={churchFilter} onValueChange={setChurchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الكنائس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الكنائس</SelectItem>
                      {churches.map((church) => (
                        <SelectItem key={church} value={church}>
                          {church}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الحالة</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {statusOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={statusFilter.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (statusFilter.includes(option.value)) {
                            setStatusFilter(statusFilter.filter((s) => s !== option.value))
                          } else {
                            setStatusFilter([...statusFilter, option.value])
                          }
                        }}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>الفترة الزمنية</Label>
                  <div className="flex gap-2 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-right ${
                            dateRange.from ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP", { locale: ar }) : <span>من تاريخ...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-right ${
                            dateRange.to ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP", { locale: ar }) : <span>إلى تاريخ...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label>الحد الأدنى للدرجة (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="أدخل النسبة المئوية..."
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse pt-6">
                  <Checkbox
                    id="alerts"
                    checked={hasAlertsFilter}
                    onCheckedChange={(checked) => setHasAlertsFilter(checked === true)}
                  />
                  <Label htmlFor="alerts">إظهار النتائج التي تحتوي على تنبيهات غش فقط</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>النتائج ({filteredResults.length})</CardTitle>
            <CardDescription>
              {filteredResults.length} من أصل {results.length} نتيجة
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود المستخدم</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الكنيسة</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الدرجة</TableHead>
                  <TableHead>تقييم المحفوظات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنهاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.userCode}</TableCell>
                      <TableCell>{result.userName}</TableCell>
                      <TableCell>{result.church}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {result.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-10 text-center">{result.examScorePercent}%</div>
                          <div className="flex-1 max-w-24">
                            <Progress
                              value={result.examScorePercent}
                              className={`h-2 ${
                                result.examScorePercent >= result.passingThreshold ? "bg-green-100" : "bg-red-100"
                              }`}
                              indicatorClassName={
                                result.examScorePercent >= result.passingThreshold ? "bg-green-500" : "bg-red-500"
                              }
                            />
                          </div>
                          {result.examScorePercent >= result.passingThreshold ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.memorizationScore !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 text-center">{result.memorizationScore}</div>
                            <Progress
                              value={result.memorizationScore}
                              className="h-2 w-24 bg-blue-100"
                              indicatorClassName="bg-blue-500"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(result.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{new Date(result.completionTime).toLocaleDateString("ar-EG")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(result)}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportSingleResult(result)}>
                              <FileText className="ml-2 h-4 w-4" />
                              تصدير النتيجة
                            </DropdownMenuItem>
                            {result.status === "locked" && result.examScorePercent >= result.passingThreshold && (
                              <DropdownMenuItem onClick={() => printCertificate(result)}>
                                <Printer className="ml-2 h-4 w-4" />
                                طباعة الشهادة
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleResetAttempt(result)}
                              disabled={result.status === "pending"}
                            >
                              <RefreshCw className="ml-2 h-4 w-4" />
                              إعادة ضبط المحاولة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteResult(result)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف النتيجة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      لا توجد نتائج مطابقة للفلاتر المحددة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Result Details Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل النتيجة</DialogTitle>
            <DialogDescription>
              {selectedResult?.userName} - {selectedResult?.userCode}
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6">
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">ملخص النتيجة</TabsTrigger>
                  <TabsTrigger value="answers">الإجابات</TabsTrigger>
                  <TabsTrigger value="alerts">سجل التنبيهات</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">معلومات المستخدم</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">كود المستخدم:</dt>
                            <dd>{selectedResult.userCode}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الاسم:</dt>
                            <dd>{selectedResult.userName}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الكنيسة:</dt>
                            <dd>{selectedResult.church}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الفئة:</dt>
                            <dd>{selectedResult.category}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">ملخص الدرجات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الدرجة الخام:</dt>
                            <dd>
                              {selectedResult.examScoreRaw} من {selectedResult.totalQuestions}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">النسبة المئوية:</dt>
                            <dd
                              className={
                                selectedResult.examScorePercent >= selectedResult.passingThreshold
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {selectedResult.examScorePercent}%
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الحد الأدنى للنجاح:</dt>
                            <dd>{selectedResult.passingThreshold}%</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">النتيجة:</dt>
                            <dd>
                              {selectedResult.examScorePercent >= selectedResult.passingThreshold ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ناجح</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                  راسب
                                </Badge>
                              )}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">تقييم المحفوظات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedResult.memorizationScore !== null ? (
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">درجة التقييم:</dt>
                              <dd>{selectedResult.memorizationScore}/100</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">تم التقييم بواسطة:</dt>
                              <dd>{selectedResult.evaluatedBy}</dd>
                            </div>
                            <div className="pt-2">
                              <Progress
                                value={selectedResult.memorizationScore}
                                className="h-2 bg-blue-100"
                                indicatorClassName="bg-blue-500"
                              />
                            </div>
                          </dl>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">لم يتم إجراء تقييم المحفوظات بعد</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">معلومات إضافية</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">تاريخ الإنهاء:</dt>
                            <dd>{new Date(selectedResult.completionTime).toLocaleString("ar-EG")}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الزمن المستغرق:</dt>
                            <dd>{selectedResult.durationTaken}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">الحالة:</dt>
                            <dd>{getStatusBadge(selectedResult.status)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">عدد التنبيهات:</dt>
                            <dd>
                              {selectedResult.alertsCount > 0 ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  {selectedResult.alertsCount}
                                </Badge>
                              ) : (
                                "0"
                              )}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="answers" className="pt-4">
                  {selectedResult.answers && selectedResult.answers.length > 0 ? (
                    <div className="space-y-4">
                      {selectedResult.answers.map((answer, index) => (
                        <div
                          key={answer.questionId}
                          className={`p-4 border rounded-lg ${
                            answer.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">السؤال {index + 1}</span>
                            {answer.correct ? (
                              <Badge className="bg-green-100 text-green-800">إجابة صحيحة</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                إجابة خاطئة
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">
                            {/* This would be the actual question text in a real app */}
                            سؤال تجريبي رقم {index + 1}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            <span>إجابة المستخدم: </span>
                            <span className={answer.correct ? "text-green-700" : "text-red-700"}>
                              {typeof answer.userAnswer === "boolean"
                                ? answer.userAnswer
                                  ? "صحيح"
                                  : "خطأ"
                                : `الخيار ${answer.userAnswer + 1}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">لا تتوفر تفاصيل الإجابات لهذا الامتحان</div>
                  )}
                </TabsContent>

                <TabsContent value="alerts" className="pt-4">
                  {selectedResult.alerts && selectedResult.alerts.length > 0 ? (
                    <div className="space-y-4">
                      {selectedResult.alerts.map((alert, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                              {alert.type === "tab_switch" ? "تبديل التبويب" : "تنبيه"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.time).toLocaleTimeString("ar-EG")}
                            </span>
                          </div>
                          <p className="text-sm text-red-700">{alert.details}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">لا توجد تنبيهات مسجلة لهذا الامتحان</div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <div className="flex gap-2 w-full justify-between">
                  <div>
                    {selectedResult.status === "locked" &&
                      selectedResult.examScorePercent >= selectedResult.passingThreshold && (
                        <Button variant="outline" onClick={() => printCertificate(selectedResult)}>
                          <Printer className="ml-2 h-4 w-4" />
                          طباعة الشهادة
                        </Button>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportSingleResult(selectedResult)}>
                      <FileSpreadsheet className="ml-2 h-4 w-4" />
                      تصدير النتيجة
                    </Button>
                    <DialogClose asChild>
                      <Button>إغلاق</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف نتيجة {selectedResult?.userName}؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteResult}>
              حذف النتيجة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Attempt Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة ضبط المحاولة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في إعادة ضبط محاولة {selectedResult?.userName}؟ سيتم إلغاء قفل الامتحان والسماح
              للمستخدم بإعادة المحاولة.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              إلغاء
            </Button>
            <Button onClick={confirmResetAttempt}>إعادة ضبط المحاولة</Button>
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
