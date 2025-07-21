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
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Plus, Trash2, Edit, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  code: string
  name: string
  church: string
  category: string
  password: string
  email: string
  status?: "active" | "inactive"
}

const categories = ["براعم", "أشبال", "كشافة", "مرشدات", "جوالة", "ذوو الهمم"]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState<User>({
    code: "",
    name: "",
    church: "",
    category: "",
    password: "",
    email: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [replaceExistingData, setReplaceExistingData] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.code.includes(searchTerm) ||
      user.church.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || user.category === selectedCategory
    return matchesSearch && matchesCategory
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

        const newUsers: User[] = []
        const errors: string[] = []
        let successCount = 0
        let skippedCount = 0
        
        for (let i = 1; i < lines.length; i++) {
          setImportProgress((i / lines.length) * 100)
          
          if (lines[i].trim()) {
            // Better CSV parsing to handle quoted fields with Arabic text
            const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
            
            if (values.length < 6) {
              errors.push(`السطر ${i + 1}: بيانات ناقصة (${values.length} من 6 حقول مطلوبة)`)
              skippedCount++
              continue
            }

            // Validate user code format
            if (!values[0] || values[0].length < 3) {
              errors.push(`السطر ${i + 1}: كود المستخدم غير صالح`)
              skippedCount++
              continue
            }

            // Check if user already exists
            const existingUser = users.find(u => u.code === values[0])
            if (existingUser && !replaceExistingData) {
              errors.push(`السطر ${i + 1}: المستخدم ${values[0]} موجود بالفعل`)
              skippedCount++
              continue
            }

            const user: User = {
              code: values[0] || "",
              name: values[1] || "",
              church: values[2] || "",
              category: values[3] || "",
              password: values[4] || "",
              email: values[5] || "",
              status: "active",
            }

            // Validate category
            if (!categories.includes(user.category)) {
              errors.push(`السطر ${i + 1}: فئة غير صالحة "${user.category}"`)
              skippedCount++
              continue
            }

            newUsers.push(user)
            successCount++
          }
        }

        setTimeout(() => {
          if (replaceExistingData) {
            setUsers(newUsers)
          } else {
            setUsers((prev) => {
              const existingCodes = prev.map(u => u.code)
              const uniqueNewUsers = newUsers.filter(u => !existingCodes.includes(u.code))
              return [...prev, ...uniqueNewUsers]
            })
          }

          setImportProgress(100)
          setIsImporting(false)

          const summary = [
            `✅ تم إضافة ${successCount} مستخدم بنجاح`,
            skippedCount > 0 ? `⚠️ تم تخطي ${skippedCount} سطر` : '',
            errors.length > 0 ? `❌ ${errors.length} خطأ في المعالجة` : ''
          ].filter(Boolean).join('\n')

          toast({
            title: replaceExistingData ? "تم استبدال البيانات" : "تم استيراد البيانات",
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
      "Code,Name,Church,Category,Password,Email",
      "1001,أحمد محمد,العذراء,كشافة,12345678,ahmed@example.com",
      "1002,فاطمة علي,مار جرجس,أشبال,87654321,fatma@example.com",
      "1003,محمد حسن,الأنبا أنطونيوس,جوالة,11223344,mohamed@example.com",
      "1004,مريم يوسف,العذراء,مرشدات,44556677,mariam@example.com",
      "1005,مينا صبحي,مار جرجس,براعم,77889900,mina@example.com",
      "1006,نادية محمد,الأنبا أنطونيوس,ذوو الهمم,99887766,nadia@example.com"
    ].join("\n")
    
    // Add BOM for proper UTF-8 encoding
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "قالب_المستخدمين.csv"
    link.click()
    
    toast({
      title: "تم تحميل القالب",
      description: "يمكنك تعديل القالب وإعادة رفعه",
    })
  }

  const handleDownloadUsers = () => {
    const headers = "Code,Name,Church,Category,Password,Email,Status"
    const csvContent = [
      headers,
      ...users.map(
        (user) =>
          `"${user.code}","${user.name}","${user.church}","${user.category}","${user.password}","${user.email}","${user.status || "active"}"`
      ),
    ].join("\n")

    // Add BOM for proper UTF-8 encoding
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `تصدير_المستخدمين_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.csv`
    link.click()
    
    toast({
      title: "تم تصدير البيانات",
      description: `تم تصدير ${users.length} مستخدم بنجاح`,
    })
  }

  const handleAddUser = () => {
    if (!newUser.code || !newUser.name || !newUser.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setUsers((prev) => [...prev, { ...newUser, status: "active" }])
    setNewUser({
      code: "",
      name: "",
      church: "",
      category: "",
      password: "",
      email: "",
    })
    setIsAddDialogOpen(false)
    toast({
      title: "تم إضافة المستخدم بنجاح",
      description: `تم إضافة ${newUser.name} للنظام`,
    })
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = () => {
    if (!userToDelete) return

    setUsers((prev) => prev.filter((user) => user.code !== userToDelete.code))
    setShowDeleteModal(false)
    setUserToDelete(null)
    toast({
      title: "تم حذف المستخدم",
      description: `تم حذف ${userToDelete.name} من النظام`,
    })
  }

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "لم يتم تحديد مستخدمين",
        description: "يرجى تحديد المستخدمين المراد حذفهم",
        variant: "destructive",
      })
      return
    }
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = () => {
    setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.code)))
    const deletedCount = selectedUsers.length
    setSelectedUsers([])
    setShowBulkDeleteModal(false)
    toast({
      title: "تم حذف المستخدمين",
      description: `تم حذف ${deletedCount} مستخدم من النظام`,
    })
    setSelectedUsers([])
    setShowBulkDeleteModal(false)
    toast({
      title: "تم حذف المستخدمين",
      description: `تم حذف ${deletedCount} مستخدم من النظام`,
    })
  }

  const handleSelectUser = (userCode: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userCode])
    } else {
      setSelectedUsers(selectedUsers.filter((code) => code !== userCode))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.code))
    } else {
      setSelectedUsers([])
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين والكشافة</p>
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
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>أدخل بيانات المستخدم الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">الكود *</Label>
                  <Input
                    id="code"
                    value={newUser.code}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="1001"
                  />
                </div>
                <div>
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="أحمد محمد"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="church">الكنيسة</Label>
                  <Input
                    id="church"
                    value={newUser.church}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, church: e.target.value }))}
                    placeholder="العذراء"
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <Select
                    value={newUser.category}
                    onValueChange={(value) => setNewUser((prev) => ({ ...prev, category: value }))}
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <Button onClick={handleAddUser} className="w-full">
                إضافة المستخدم
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
          variant="outline"
          onClick={handleDownloadUsers}
          className="bg-[hsl(var(--logo-green))] text-white hover:bg-[hsl(var(--logo-green))]/90"
        >
          <Download className="h-4 w-4 ml-2" />
          تصدير المستخدمين
        </Button>
        {selectedUsers.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            حذف المحدد ({selectedUsers.length})
          </Button>
        )}
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
                  placeholder="البحث بالاسم، الكود، أو الكنيسة..."
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
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox className="h-5 w-5" checked={true} />
                <span className="font-medium">تم تحديد {selectedUsers.length} مستخدم</span>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمون ({filteredUsers.length})</CardTitle>
          <CardDescription>قائمة بجميع المستخدمين المسجلين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>الكود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الكنيسة</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.code}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.code)}
                      onCheckedChange={(checked) => handleSelectUser(user.code, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.code}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.church}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[hsl(var(--logo-blue))]/10 text-[hsl(var(--logo-blue))]">
                      {user.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700"
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
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.
              {userToDelete && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <strong>المستخدم:</strong> {userToDelete.name} ({userToDelete.code})
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف المتعدد</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.
              <div className="mt-2 p-2 bg-red-50 rounded text-red-700">
                <strong>تحذير:</strong> سيتم حذف {selectedUsers.length} مستخدم نهائياً
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteModal(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Progress Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استيراد المستخدمين</DialogTitle>
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
                  id="replace-data"
                  checked={replaceExistingData}
                  onCheckedChange={setReplaceExistingData}
                />
                <Label htmlFor="replace-data" className="text-sm font-medium">
                  استبدال البيانات الموجودة
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {replaceExistingData 
                  ? "سيتم حذف جميع المستخدمين الحاليين واستبدالهم بالبيانات الجديدة"
                  : "سيتم إضافة المستخدمين الجدد مع الاحتفاظ بالمستخدمين الحاليين"
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
