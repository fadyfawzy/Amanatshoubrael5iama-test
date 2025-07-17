"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Shield,
  Database,
  FileText,
  Users,
  HelpCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Types
interface SystemStats {
  totalUsers: number
  totalExams: number
  totalQuestions: number
  totalCompletedAttempts: number
  totalAlertsLogged: number
  lastUpdated: string
}

interface SystemLog {
  id: string
  action: string
  timestamp: string
  adminUser: string
  details: string
  status: "success" | "error" | "warning"
}

// Sample data
const initialStats: SystemStats = {
  totalUsers: 245,
  totalExams: 89,
  totalQuestions: 1234,
  totalCompletedAttempts: 156,
  totalAlertsLogged: 23,
  lastUpdated: new Date().toISOString(),
}

const sampleLogs: SystemLog[] = [
  {
    id: "1",
    action: "تصدير بيانات المستخدمين",
    timestamp: "2025-07-17T14:30:00",
    adminUser: "Fady",
    details: "تم تصدير 245 مستخدم بنجاح",
    status: "success",
  },
  {
    id: "2",
    action: "نسخ احتياطي للنظام",
    timestamp: "2025-07-17T13:15:00",
    adminUser: "Fady",
    details: "تم إنشاء نسخة احتياطية كاملة",
    status: "success",
  },
  {
    id: "3",
    action: "إعادة ضبط النتائج",
    timestamp: "2025-07-16T16:45:00",
    adminUser: "Fady",
    details: "تم مسح جميع نتائج الامتحانات",
    status: "warning",
  },
  {
    id: "4",
    action: "تغيير كلمة مرور المدير",
    timestamp: "2025-07-16T10:20:00",
    adminUser: "Fady",
    details: "تم تحديث كلمة مرور المدير بنجاح",
    status: "success",
  },
]

export default function SystemPage() {
  const [stats, setStats] = useState<SystemStats>(initialStats)
  const [logs, setLogs] = useState<SystemLog[]>(sampleLogs)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [antiCheatEnabled, setAntiCheatEnabled] = useState(true)

  // Modals and dialogs
  const [showResetAllDialog, setShowResetAllDialog] = useState(false)
  const [showResetResultsDialog, setShowResetResultsDialog] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)

  // Form states
  const [adminPassword, setAdminPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    admin: false,
  })

  // Progress states
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()

  const refreshStats = async () => {
    setIsRefreshing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would fetch from API
      setStats({
        ...stats,
        lastUpdated: new Date().toISOString(),
      })

      toast({
        title: "تم تحديث الإحصائيات",
        description: "تم تحديث إحصائيات النظام بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الإحصائيات",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const validateAdminPassword = (password: string): boolean => {
    return password === "F@dy1313"
  }

  const addSystemLog = (action: string, details: string, status: "success" | "error" | "warning" = "success") => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      action,
      timestamp: new Date().toISOString(),
      adminUser: "Fady",
      details,
      status,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  const handleResetAllData = async () => {
    if (!validateAdminPassword(adminPassword)) {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى إدخال كلمة مرور المدير الصحيحة",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate reset process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Reset stats
      setStats({
        totalUsers: 0,
        totalExams: 0,
        totalQuestions: 0,
        totalCompletedAttempts: 0,
        totalAlertsLogged: 0,
        lastUpdated: new Date().toISOString(),
      })

      addSystemLog("إعادة ضبط جميع البيانات", "تم مسح جميع البيانات من النظام", "warning")

      toast({
        title: "تم إعادة ضبط البيانات",
        description: "تم مسح جميع البيانات من النظام بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في إعادة الضبط",
        description: "حدث خطأ أثناء إعادة ضبط البيانات",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setShowResetAllDialog(false)
      setAdminPassword("")
    }
  }

  const handleResetResults = async () => {
    if (!validateAdminPassword(adminPassword)) {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى إدخال كلمة مرور المدير الصحيحة",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate reset process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset only results-related stats
      setStats((prev) => ({
        ...prev,
        totalCompletedAttempts: 0,
        totalAlertsLogged: 0,
        lastUpdated: new Date().toISOString(),
      }))

      addSystemLog("إعادة ضبط النتائج", "تم مسح جميع نتائج الامتحانات", "warning")

      toast({
        title: "تم إعادة ضبط النتائج",
        description: "تم مسح جميع نتائج الامتحانات مع الاحتفاظ بالمستخدمين والأسئلة",
      })
    } catch (error) {
      toast({
        title: "خطأ في إعادة الضبط",
        description: "حدث خطأ أثناء إعادة ضبط النتائج",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setShowResetResultsDialog(false)
      setAdminPassword("")
    }
  }

  const handleBackup = async () => {
    setIsProcessing(true)
    setBackupProgress(0)
    setShowBackupModal(true)

    try {
      // Simulate backup process with progress
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Create backup data
      const backupData = {
        users: [], // Would contain actual user data
        questions: [], // Would contain actual question data
        results: [], // Would contain actual results data
        alerts: [], // Would contain actual alerts data
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      }

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `نسخة_احتياطية_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addSystemLog("نسخ احتياطي للنظام", "تم إنشاء نسخة احتياطية كاملة للنظام")

      toast({
        title: "تم إنشاء النسخة الاحتياطية",
        description: "تم تحميل النسخة الاحتياطية بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في النسخ الاحتياطي",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setShowBackupModal(false)
        setBackupProgress(0)
      }, 1000)
    }
  }

  const handleRestore = async (file: File) => {
    setIsProcessing(true)
    setRestoreProgress(0)
    setShowRestoreModal(true)

    try {
      // Simulate restore process with progress
      for (let i = 0; i <= 100; i += 10) {
        setRestoreProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Read and parse backup file
      const fileContent = await file.text()
      const backupData = JSON.parse(fileContent)

      // Validate backup data structure
      if (!backupData.timestamp || !backupData.version) {
        throw new Error("ملف النسخة الاحتياطية غير صالح")
      }

      // Restore data (in a real app, this would update the database)
      setStats({
        totalUsers: backupData.users?.length || 0,
        totalQuestions: backupData.questions?.length || 0,
        totalCompletedAttempts: backupData.results?.length || 0,
        totalAlertsLogged: backupData.alerts?.length || 0,
        totalExams: Math.floor((backupData.results?.length || 0) / 2), // Estimate
        lastUpdated: new Date().toISOString(),
      })

      addSystemLog("استعادة النسخة الاحتياطية", `تم استعادة البيانات من ${file.name}`)

      toast({
        title: "تم استعادة البيانات",
        description: "تم استعادة النسخة الاحتياطية بنجاح",
      })
    } catch (error) {
      addSystemLog("فشل استعادة النسخة الاحتياطية", `خطأ في استعادة ${file.name}`, "error")
      toast({
        title: "خطأ في الاستعادة",
        description: "حدث خطأ أثناء استعادة النسخة الاحتياطية",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setShowRestoreModal(false)
        setRestoreProgress(0)
      }, 1000)
    }
  }

  const handlePasswordChange = async () => {
    if (!validateAdminPassword(currentPassword)) {
      toast({
        title: "كلمة المرور الحالية خاطئة",
        description: "يرجى إدخال كلمة المرور الحالية الصحيحة",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "يرجى التأكد من تطابق كلمة المرور الجديدة",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate password change
      await new Promise((resolve) => setTimeout(resolve, 1000))

      addSystemLog("تغيير كلمة مرور المدير", "تم تحديث كلمة مرور المدير بنجاح")

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة مرور المدير بنجاح",
      })

      setShowPasswordChangeModal(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive",
      })
    }
  }

  const exportData = async (type: "users" | "questions" | "results" | "alerts") => {
    try {
      let data: any[] = []
      let headers: string[] = []
      let filename = ""

      switch (type) {
        case "users":
          headers = ["كود المستخدم", "الاسم", "الكنيسة", "الفئة", "البريد الإلكتروني", "الحالة"]
          data = [
            ["1001", "أحمد محمد", "العذراء", "كشافة ومرشدات", "ahmed@example.com", "نشط"],
            ["1002", "فاطمة علي", "مار جرجس", "أشبال وزهرات", "fatima@example.com", "نشط"],
          ]
          filename = `المستخدمون_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.csv`
          break
        case "questions":
          headers = [
            "الفئة",
            "النوع",
            "السؤال",
            "الخيار الأول",
            "الخيار الثاني",
            "الخيار الثالث",
            "الخيار الرابع",
            "الإجابة الصحيحة",
          ]
          data = [
            [
              "كشافة ومرشدات",
              "اختيار متعدد",
              "ما هو الهدف الأساسي من الحركة الكشفية؟",
              "تنمية الشخصية",
              "الرياضة",
              "الشارات",
              "الوقت",
              "1",
            ],
          ]
          filename = `الأسئلة_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.csv`
          break
        case "results":
          headers = ["كود المستخدم", "الاسم", "الفئة", "الدرجة", "النسبة المئوية", "تاريخ الإنهاء", "الحالة"]
          data = [["1001", "أحمد محمد", "كشافة ومرشدات", "8/10", "80%", "2025-07-15", "مكتمل"]]
          filename = `النتائج_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.csv`
          break
        case "alerts":
          headers = ["كود المستخدم", "الاسم", "نوع التنبيه", "الوقت", "العدد", "الحالة"]
          data = [["1001", "أحمد محمد", "تبديل التبويبات", "2025-07-17 14:30", "2", "نشط"]]
          filename = `التنبيهات_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.csv`
          break
      }

      // Create CSV content
      const csvContent = [
        "\uFEFF" + headers.join(","), // Add BOM for UTF-8
        ...data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addSystemLog(
        `تصدير ${type === "users" ? "المستخدمين" : type === "questions" ? "الأسئلة" : type === "results" ? "النتائج" : "التنبيهات"}`,
        `تم تصدير البيانات بنجاح`,
      )

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${type === "users" ? "المستخدمين" : type === "questions" ? "الأسئلة" : type === "results" ? "النتائج" : "التنبيهات"} بنجاح`,
      })
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      })
    }
  }

  const downloadTemplate = (type: "users" | "questions") => {
    let headers: string[] = []
    let sampleData: string[] = []
    let filename = ""

    if (type === "users") {
      headers = ["Code", "Name", "Church", "Category", "Password", "Email"]
      sampleData = ["1006", "مثال للاسم", "العذراء", "كشافة ومرشدات", "12345678", "example@email.com"]
      filename = "قالب_المستخدمين.csv"
    } else {
      headers = ["Category", "Type", "Question", "Option1", "Option2", "Option3", "Option4", "CorrectAnswer"]
      sampleData = ["كشافة ومرشدات", "mcq", "سؤال تجريبي؟", "خيار 1", "خيار 2", "خيار 3", "خيار 4", "1"]
      filename = "قالب_الأسئلة.csv"
    }

    const csvContent = ["\uFEFF" + headers.join(","), sampleData.map((cell) => `"${cell}"`).join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "تم تحميل القالب",
      description: `تم تحميل قالب ${type === "users" ? "المستخدمين" : "الأسئلة"} بنجاح`,
    })
  }

  const getStatusIcon = (status: "success" | "error" | "warning") => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-[hsl(var(--logo-purple))]" />
            إعدادات النظام
          </h1>
          <p className="text-muted-foreground">إدارة النظام والبيانات والإعدادات الأمنية</p>
        </div>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="الشعار" className="h-12 w-12" />
        </div>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                نظرة عامة على النظام
              </CardTitle>
              <CardDescription>إحصائيات النظام الحالية</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.totalExams}</div>
              <p className="text-sm text-gray-600">إجمالي الامتحانات</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <HelpCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
              <p className="text-sm text-gray-600">إجمالي الأسئلة</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{stats.totalCompletedAttempts}</div>
              <p className="text-sm text-gray-600">المحاولات المكتملة</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.totalAlertsLogged}</div>
              <p className="text-sm text-gray-600">التنبيهات المسجلة</p>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            آخر تحديث: {new Date(stats.lastUpdated).toLocaleString("ar-EG")}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">إدارة البيانات</TabsTrigger>
          <TabsTrigger value="import-export">الاستيراد والتصدير</TabsTrigger>
          <TabsTrigger value="security">الإعدادات الأمنية</TabsTrigger>
          <TabsTrigger value="logs">السجلات</TabsTrigger>
        </TabsList>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Reset All Data */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Trash2 className="h-5 w-5" />
                  إعادة ضبط جميع البيانات
                </CardTitle>
                <CardDescription>حذف جميع المستخدمين والأسئلة والنتائج من النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">تحذير مهم</span>
                    </div>
                    <p className="text-sm text-red-700">هذا الإجراء سيحذف جميع البيانات نهائياً ولا يمكن التراجع عنه</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowResetAllDialog(true)}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    إعادة ضبط جميع البيانات
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reset Results Only */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <FileText className="h-5 w-5" />
                  إعادة ضبط النتائج فقط
                </CardTitle>
                <CardDescription>حذف نتائج الامتحانات مع الاحتفاظ بالمستخدمين والأسئلة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">تنبيه</span>
                    </div>
                    <p className="text-sm text-orange-700">سيتم حذف جميع نتائج الامتحانات والتنبيهات فقط</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowResetResultsDialog(true)}
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                    disabled={isProcessing}
                  >
                    <FileText className="h-4 w-4 ml-2" />
                    إعادة ضبط النتائج فقط
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backup & Restore */}
            <Card className="md:col-span-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Database className="h-5 w-5" />
                  النسخ الاحتياطي والاستعادة
                </CardTitle>
                <CardDescription>إنشاء نسخة احتياطية من البيانات أو استعادة نسخة سابقة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">إنشاء نسخة احتياطية</h4>
                    <p className="text-sm text-gray-600">تصدير جميع بيانات النظام في ملف واحد</p>
                    <Button
                      onClick={handleBackup}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 ml-2" />
                      إنشاء نسخة احتياطية
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">استعادة نسخة احتياطية</h4>
                    <p className="text-sm text-gray-600">رفع ملف نسخة احتياطية لاستعادة البيانات</p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleRestore(file)
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessing}
                      />
                      <Button
                        variant="outline"
                        disabled={isProcessing}
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                      >
                        <Upload className="h-4 w-4 ml-2" />
                        اختيار ملف للاستعادة
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import-export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Export Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  تصدير البيانات
                </CardTitle>
                <CardDescription>تصدير البيانات بصيغة CSV مع ترميز UTF-8</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" onClick={() => exportData("users")} className="w-full justify-start">
                    <Users className="h-4 w-4 ml-2" />
                    تصدير المستخدمين
                  </Button>
                  <Button variant="outline" onClick={() => exportData("questions")} className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 ml-2" />
                    تصدير الأسئلة
                  </Button>
                  <Button variant="outline" onClick={() => exportData("results")} className="w-full justify-start">
                    <FileText className="h-4 w-4 ml-2" />
                    تصدير النتائج
                  </Button>
                  <Button variant="outline" onClick={() => exportData("alerts")} className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 ml-2" />
                    تصدير التنبيهات
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  قوالب الاستيراد
                </CardTitle>
                <CardDescription>تحميل قوالب Excel للاستيراد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" onClick={() => downloadTemplate("users")} className="w-full justify-start">
                    <Users className="h-4 w-4 ml-2" />
                    قالب المستخدمين
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadTemplate("questions")}
                    className="w-full justify-start"
                  >
                    <HelpCircle className="h-4 w-4 ml-2" />
                    قالب الأسئلة
                  </Button>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>ملاحظة:</strong> تأكد من استخدام ترميز UTF-8 عند حفظ الملفات التي تحتوي على نصوص عربية
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  تغيير كلمة مرور المدير
                </CardTitle>
                <CardDescription>تحديث كلمة مرور حساب المدير</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowPasswordChangeModal(true)} className="w-full">
                  <Lock className="h-4 w-4 ml-2" />
                  تغيير كلمة المرور
                </Button>
              </CardContent>
            </Card>

            {/* Anti-Cheat Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  إعدادات مكافحة الغش
                </CardTitle>
                <CardDescription>تفعيل أو إلغاء نظام مكافحة الغش</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anti-cheat">نظام مكافحة الغش</Label>
                      <p className="text-sm text-gray-600">مراقبة تبديل التبويبات والأنشطة المشبوهة</p>
                    </div>
                    <Switch
                      id="anti-cheat"
                      checked={antiCheatEnabled}
                      onCheckedChange={(checked) => {
                        setAntiCheatEnabled(checked)
                        addSystemLog(
                          `${checked ? "تفعيل" : "إلغاء"} نظام مكافحة الغش`,
                          `تم ${checked ? "تفعيل" : "إلغاء"} نظام مكافحة الغش`,
                        )
                        toast({
                          title: `تم ${checked ? "تفعيل" : "إلغاء"} نظام مكافحة الغش`,
                          description: `نظام مكافحة الغش ${checked ? "مفعل" : "معطل"} الآن`,
                        })
                      }}
                    />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      عند التفعيل، سيتم مراقبة جميع الامتحانات وتسجيل أي محاولات غش
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                سجل أنشطة النظام
              </CardTitle>
              <CardDescription>سجل بجميع العمليات الإدارية المنفذة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{log.adminUser}</p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString("ar-EG")}</p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <div className="text-center py-8 text-gray-500">لا توجد سجلات بعد</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset All Data Dialog */}
      <AlertDialog open={showResetAllDialog} onOpenChange={setShowResetAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              تأكيد إعادة ضبط جميع البيانات
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-red-600 font-medium">
                هل أنت متأكد من أنك تريد إعادة ضبط جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="space-y-2">
                <Label htmlFor="admin-password-reset-all">كلمة مرور المدير للتأكيد</Label>
                <div className="relative">
                  <Input
                    id="admin-password-reset-all"
                    type={showPasswords.admin ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور المدير"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, admin: !prev.admin }))}
                  >
                    {showPasswords.admin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminPassword("")}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAllData}
              disabled={!adminPassword || isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                  جاري المسح...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  تأكيد المسح
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Results Dialog */}
      <AlertDialog open={showResetResultsDialog} onOpenChange={setShowResetResultsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              تأكيد إعادة ضبط النتائج
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-orange-600 font-medium">
                هل تريد مسح جميع نتائج الامتحانات مع الاحتفاظ بالمستخدمين والأسئلة؟
              </p>
              <div className="space-y-2">
                <Label htmlFor="admin-password-reset-results">كلمة مرور المدير للتأكيد</Label>
                <div className="relative">
                  <Input
                    id="admin-password-reset-results"
                    type={showPasswords.admin ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور المدير"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, admin: !prev.admin }))}
                  >
                    {showPasswords.admin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminPassword("")}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetResults}
              disabled={!adminPassword || isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                  جاري المسح...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 ml-2" />
                  تأكيد المسح
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Change Modal */}
      <Dialog open={showPasswordChangeModal} onOpenChange={setShowPasswordChangeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير كلمة مرور المدير</DialogTitle>
            <DialogDescription>أدخل كلمة المرور الحالية والجديدة لتحديث كلمة مرور المدير</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordChangeModal(false)}>
              إلغاء
            </Button>
            <Button onClick={handlePasswordChange} disabled={!currentPassword || !newPassword || !confirmPassword}>
              تحديث كلمة المرور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Progress Modal */}
      <Dialog open={showBackupModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>جاري إنشاء النسخة الاحتياطية</DialogTitle>
            <DialogDescription>يرجى الانتظار حتى اكتمال عملية النسخ الاحتياطي</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={backupProgress} className="w-full" />
            <p className="text-center text-sm text-gray-600">{backupProgress}%</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Progress Modal */}
      <Dialog open={showRestoreModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>جاري استعادة النسخة الاحتياطية</DialogTitle>
            <DialogDescription>يرجى الانتظار حتى اكتمال عملية الاستعادة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={restoreProgress} className="w-full" />
            <p className="text-center text-sm text-gray-600">{restoreProgress}%</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-6">
        © 2025 الأمانة العامة للكشافة والمرشدات بمطرانية شبرا الخيمة - جميع الحقوق محفوظة
      </div>
    </div>
  )
}
