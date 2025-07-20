"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Download,
  Filter,
  Search,
  Eye,
  Check,
  X,
  Lock,
  AlertTriangle,
  CalendarIcon,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
interface Alert {
  id: string
  userCode: string
  userName: string
  church: string
  category: string
  examName: string
  alertType: string
  timestamp: string
  alertCount: number
  status: "active" | "reviewed" | "cleared"
  severity: "low" | "medium" | "high"
  details: string
  ipAddress?: string
  userAgent?: string
}

// Initialize with empty array - ready for real alerts
const initialAlerts: Alert[] = []

const categories = ["براعم وذو الهمم", "أشبال وزهرات", "كشافة ومرشدات", "متقدم ورائدات", "جوالة ودليلات"]
const churches = ["العذراء", "مار جرجس", "الأنبا أنطونيوس", "الملاك ميخائيل", "مارمرقس"]
const alertTypes = [
  "تبديل التبويبات",
  "تصغير النافذة",
  "خروج من صفحة الامتحان",
  "فتح من جهاز آخر",
  "تغيير الشبكة أثناء الامتحان",
  "محاولة نسخ ولصق",
  "استخدام أدوات المطور",
]
const statusOptions = [
  { value: "active", label: "نشط", color: "bg-red-100 text-red-800" },
  { value: "reviewed", label: "تمت المراجعة", color: "bg-yellow-100 text-yellow-800" },
  { value: "cleared", label: "تم الحل", color: "bg-green-100 text-green-800" },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(initialAlerts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBulkActionModal, setShowBulkActionModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<"review" | "clear" | "lock" | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [churchFilter, setChurchFilter] = useState<string>("all")
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const { toast } = useToast()

  // Apply filters
  useEffect(() => {
    let filtered = [...alerts]

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (alert) =>
          alert.userCode.toLowerCase().includes(term) ||
          alert.userName.toLowerCase().includes(term) ||
          alert.church.toLowerCase().includes(term) ||
          alert.examName.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((alert) => alert.category === categoryFilter)
    }

    // Church filter
    if (churchFilter !== "all") {
      filtered = filtered.filter((alert) => alert.church === churchFilter)
    }

    // Alert type filter
    if (alertTypeFilter !== "all") {
      filtered = filtered.filter((alert) => alert.alertType === alertTypeFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((alert) => alert.status === statusFilter)
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter)
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter((alert) => new Date(alert.timestamp) >= new Date(dateRange.from!))
    }
    if (dateRange.to) {
      filtered = filtered.filter((alert) => new Date(alert.timestamp) <= new Date(dateRange.to!))
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, categoryFilter, churchFilter, alertTypeFilter, statusFilter, severityFilter, dateRange])

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts([...selectedAlerts, alertId])
    } else {
      setSelectedAlerts(selectedAlerts.filter((id) => id !== alertId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(filteredAlerts.map((alert) => alert.id))
    } else {
      setSelectedAlerts([])
    }
  }

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert)
    setShowDetailModal(true)
  }

  const handleBulkAction = (action: "review" | "clear" | "lock") => {
    if (selectedAlerts.length === 0) {
      toast({
        title: "لم يتم تحديد أي تنبيهات",
        description: "يرجى تحديد التنبيهات المراد تطبيق الإجراء عليها",
        variant: "destructive",
      })
      return
    }

    setBulkAction(action)
    setShowBulkActionModal(true)
  }

  const confirmBulkAction = () => {
    if (!bulkAction) return

    let newStatus: "active" | "reviewed" | "cleared" = "active"
    let actionText = ""

    switch (bulkAction) {
      case "review":
        newStatus = "reviewed"
        actionText = "تمت مراجعة"
        break
      case "clear":
        newStatus = "cleared"
        actionText = "تم حل"
        break
      case "lock":
        // In a real app, this would lock the user's exam
        newStatus = "cleared"
        actionText = "تم قفل امتحان"
        break
    }

    setAlerts((prev) =>
      prev.map((alert) => {
        if (selectedAlerts.includes(alert.id)) {
          return { ...alert, status: newStatus }
        }
        return alert
      }),
    )

    setSelectedAlerts([])
    setShowBulkActionModal(false)
    setBulkAction(null)

    toast({
      title: "تم تطبيق الإجراء بنجاح",
      description: `${actionText} ${selectedAlerts.length} تنبيه`,
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
        "اسم الامتحان",
        "نوع التنبيه",
        "وقت التنبيه",
        "عدد التنبيهات",
        "الحالة",
        "مستوى الخطورة",
        "التفاصيل",
        "عنوان IP",
      ]

      // Convert alerts to CSV rows
      const rows = filteredAlerts.map((alert) => [
        alert.userCode,
        alert.userName,
        alert.church,
        alert.category,
        alert.examName,
        alert.alertType,
        new Date(alert.timestamp).toLocaleString("ar-EG"),
        alert.alertCount,
        alert.status === "active" ? "نشط" : alert.status === "reviewed" ? "تمت المراجعة" : "تم الحل",
        alert.severity === "low" ? "منخفض" : alert.severity === "medium" ? "متوسط" : "عالي",
        alert.details,
        alert.ipAddress || "",
      ])

      // Combine header and rows
      const csvContent = [
        "\uFEFF" + headers.join(","), // Add BOM for UTF-8 encoding
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      // Create a link and click it
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `تنبيهات_مكافحة_الغش_${new Date().toLocaleDateString("ar-EG")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "تم تصدير التنبيهات",
        description: `تم تصدير ${filteredAlerts.length} تنبيه بنجاح`,
      })
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التنبيهات",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setChurchFilter("all")
    setAlertTypeFilter("all")
    setStatusFilter("all")
    setSeverityFilter("all")
    setDateRange({ from: undefined, to: undefined })
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            منخفض
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            متوسط
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            عالي
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((s) => s.value === status)
    if (!statusOption) return null

    return <Badge className={statusOption.color}>{statusOption.label}</Badge>
  }

  const handleDeleteAlert = (alert: Alert) => {
    setAlertToDelete(alert)
    setShowDeleteModal(true)
  }

  const confirmDeleteAlert = () => {
    if (!alertToDelete) return

    setAlerts((prev) => prev.filter((a) => a.id !== alertToDelete.id))
    setShowDeleteModal(false)
    setAlertToDelete(null)
    toast({
      title: "تم حذف التنبيه",
      description: "تم حذف التنبيه من النظام",
    })
  }

  const handleBulkDelete = () => {
    if (selectedAlerts.length === 0) {
      toast({
        title: "لم يتم تحديد تنبيهات",
        description: "يرجى تحديد التنبيهات المراد حذفها",
        variant: "destructive",
      })
      return
    }

    setAlerts((prev) => prev.filter((alert) => !selectedAlerts.includes(alert.id)))
    const deletedCount = selectedAlerts.length
    setSelectedAlerts([])
    toast({
      title: "تم حذف التنبيهات",
      description: `تم حذف ${deletedCount} تنبيه من النظام`,
    })
  }

  // Statistics
  const totalAlerts = alerts.length
  const activeAlerts = alerts.filter((a) => a.status === "active").length
  const highSeverityAlerts = alerts.filter((a) => a.severity === "high").length
  const todayAlerts = alerts.filter((a) => {
    const today = new Date()
    const alertDate = new Date(a.timestamp)
    return alertDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-[hsl(var(--logo-blue))]" />
            الإشعارات / مكافحة الغش
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة محاولات الغش والتنبيهات</p>
        </div>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="الشعار" className="h-12 w-12" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التنبيهات</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">جميع التنبيهات المسجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التنبيهات النشطة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">تحتاج إلى مراجعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عالية الخطورة</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{highSeverityAlerts}</div>
            <p className="text-xs text-muted-foreground">تنبيهات خطيرة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اليوم</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayAlerts}</div>
            <p className="text-xs text-muted-foreground">تنبيهات اليوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث بالكود، الاسم، الكنيسة، أو اسم الامتحان..."
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
              alertTypeFilter !== "all" ||
              statusFilter !== "all" ||
              severityFilter !== "all" ||
              dateRange.from ||
              dateRange.to) && (
              <Badge className="h-5 w-5 p-0 flex items-center justify-center">
                {
                  [
                    categoryFilter !== "all",
                    churchFilter !== "all",
                    alertTypeFilter !== "all",
                    statusFilter !== "all",
                    severityFilter !== "all",
                    dateRange.from || dateRange.to,
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
                تصدير التنبيهات
              </>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>تصفية التنبيهات</CardTitle>
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
                  <Label>نوع التنبيه</Label>
                  <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الأنواع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {alertTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الحالات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>مستوى الخطورة</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع المستويات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedAlerts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">تم تحديد {selectedAlerts.length} تنبيه</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("review")}>
                  <Check className="h-4 w-4 ml-1" />
                  تمت المراجعة
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("clear")}>
                  <CheckCircle className="h-4 w-4 ml-1" />
                  تم الحل
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("lock")}>
                  <Lock className="h-4 w-4 ml-1" />
                  قفل الامتحان
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف التنبيهات
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>التنبيهات ({filteredAlerts.length})</CardTitle>
            <CardDescription>
              {filteredAlerts.length} من أصل {alerts.length} تنبيه
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>كود المستخدم</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>نوع التنبيه</TableHead>
                  <TableHead>الوقت</TableHead>
                  <TableHead>العدد</TableHead>
                  <TableHead>الخطورة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAlerts.includes(alert.id)}
                          onCheckedChange={(checked) => handleSelectAlert(alert.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{alert.userCode}</TableCell>
                      <TableCell>{alert.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {alert.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{alert.alertType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(alert.timestamp).toLocaleDateString("ar-EG")}</div>
                          <div className="text-gray-500">{new Date(alert.timestamp).toLocaleTimeString("ar-EG")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {alert.alertCount}
                        </Badge>
                      </TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(alert)}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setAlerts((prev) =>
                                  prev.map((a) => (a.id === alert.id ? { ...a, status: "reviewed" } : a)),
                                )
                                toast({ title: "تمت مراجعة التنبيه", description: "تم تحديث حالة التنبيه" })
                              }}
                              disabled={alert.status === "reviewed"}
                            >
                              <Check className="ml-2 h-4 w-4" />
                              تمت المراجعة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setAlerts((prev) =>
                                  prev.map((a) => (a.id === alert.id ? { ...a, status: "cleared" } : a)),
                                )
                                toast({ title: "تم حل التنبيه", description: "تم تحديث حالة التنبيه" })
                              }}
                              disabled={alert.status === "cleared"}
                            >
                              <CheckCircle className="ml-2 h-4 w-4" />
                              تم الحل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                              <Lock className="ml-2 h-4 w-4" />
                              قفل الامتحان
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteAlert(alert)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف التنبيه
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      لا توجد تنبيهات مطابقة للفلاتر المحددة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل التنبيه</DialogTitle>
            <DialogDescription>
              {selectedAlert?.userName} - {selectedAlert?.userCode}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-500">معلومات المستخدم</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">كود المستخدم:</span>
                      <span className="text-sm font-medium">{selectedAlert.userCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الاسم:</span>
                      <span className="text-sm font-medium">{selectedAlert.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الكنيسة:</span>
                      <span className="text-sm font-medium">{selectedAlert.church}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الفئة:</span>
                      <span className="text-sm font-medium">{selectedAlert.category}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">تفاصيل التنبيه</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">نوع التنبيه:</span>
                      <span className="text-sm font-medium">{selectedAlert.alertType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الوقت:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedAlert.timestamp).toLocaleString("ar-EG")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">عدد التنبيهات:</span>
                      <span className="text-sm font-medium">{selectedAlert.alertCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">مستوى الخطورة:</span>
                      <span className="text-sm font-medium">{getSeverityBadge(selectedAlert.severity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الحالة:</span>
                      <span className="text-sm font-medium">{getStatusBadge(selectedAlert.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">اسم الامتحان</Label>
                <p className="mt-1 text-sm">{selectedAlert.examName}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">التفاصيل</Label>
                <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{selectedAlert.details}</p>
              </div>

              {selectedAlert.ipAddress && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">معلومات تقنية</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">عنوان IP:</span>
                      <span className="text-sm font-mono">{selectedAlert.ipAddress}</span>
                    </div>
                    {selectedAlert.userAgent && (
                      <div>
                        <span className="text-sm text-gray-600">متصفح المستخدم:</span>
                        <p className="text-xs text-gray-500 mt-1 break-all">{selectedAlert.userAgent}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              إغلاق
            </Button>
            {selectedAlert && selectedAlert.status === "active" && (
              <Button
                onClick={() => {
                  setAlerts((prev) => prev.map((a) => (a.id === selectedAlert.id ? { ...a, status: "reviewed" } : a)))
                  setShowDetailModal(false)
                  toast({ title: "تمت مراجعة التنبيه", description: "تم تحديث حالة التنبيه" })
                }}
              >
                تمت المراجعة
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Modal */}
      <Dialog open={showBulkActionModal} onOpenChange={setShowBulkActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الإجراء</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في تطبيق هذا الإجراء على {selectedAlerts.length} تنبيه؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionModal(false)}>
              إلغاء
            </Button>
            <Button onClick={confirmBulkAction}>تأكيد الإجراء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد من رغبتك في حذف هذا التنبيه؟</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button onClick={confirmDeleteAlert}>تأكيد الحذف</Button>
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
