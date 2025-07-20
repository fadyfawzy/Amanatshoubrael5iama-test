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

const categories = ["براعم وذو الهمم", "أشبال وزهرات", "كشافة ومرشدات", "متقدم ورائدات", "جوالة ودليلات"]

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

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())

        const newUsers: User[] = []
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(",").map((v) => v.trim())
            if (values.length < 6) {
              console.warn("Skipping line due to insufficient values:", lines[i])
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
            newUsers.push(user)
          }
        }

        setUsers((prev) => [...prev, ...newUsers])
        toast({
          title: "تم رفع الملف بنجاح",
          description: `تم إضافة ${newUsers.length} مستخدم جديد`,
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
    const csvContent =
      "Code,Name,Church,Category,Password,Email\n1005,ماري,العذراء,جوالة ودليلات,12345678,example2@email.com"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "user_template.csv"
    link.click()
  }

  const handleDownloadUsers = () => {
    const headers = "Code,Name,Church,Category,Password,Email,Status"
    const csvContent = [
      headers,
      ...users.map(
        (user) =>
          `${user.code},${user.name},${user.church},${user.category},${user.password},${user.email},${user.status || "active"}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "users_export.csv"
    link.click()
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
              هل أنت متأكد من حذف {selectedUsers.length} مستخدم؟ لا يمكن التراجع عن هذا الإجراء.
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
    </div>
  )
}
