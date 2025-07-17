"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, HelpCircle, FileText, AlertTriangle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: "245",
      description: "مستخدم مسجل",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "الأسئلة المتاحة",
      value: "1,234",
      description: "سؤال في النظام",
      icon: HelpCircle,
      color: "text-green-600",
    },
    {
      title: "الامتحانات المكتملة",
      value: "89",
      description: "امتحان هذا الشهر",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "تنبيهات اليوم",
      value: "12",
      description: "تنبيه مكافحة غش",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  const recentActivity = [
    { user: "أحمد محمد", action: "أكمل امتحان براعم وذو الهمم", time: "منذ 5 دقائق" },
    { user: "فاطمة علي", action: "أكمل امتحان أشبال وزهرات", time: "منذ 15 دقيقة" },
    { user: "محمد حسن", action: "تنبيه: تبديل التبويبات", time: "منذ 20 دقيقة", isAlert: true },
    { user: "نور أحمد", action: "أكمل امتحان متقدم ورائدات", time: "منذ ساعة" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">نظرة عامة</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم منصة الامتحانات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>آخر الامتحانات المكتملة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 space-x-reverse">
                  <div className={`h-2 w-2 rounded-full ${activity.isAlert ? "bg-red-600" : "bg-blue-600"}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className={`text-xs ${activity.isAlert ? "text-red-600" : "text-muted-foreground"}`}>
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الفئات</CardTitle>
            <CardDescription>توزيع الامتحانات حسب الفئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "براعم وذو الهمم", count: 45, color: "bg-blue-500" },
                { name: "أشبال وزهرات", count: 38, color: "bg-green-500" },
                { name: "كشافة ومرشدات", count: 52, color: "bg-purple-500" },
                { name: "متقدم ورائدات", count: 29, color: "bg-orange-500" },
                { name: "جوالة ودليلات", count: 21, color: "bg-red-500" },
              ].map((category) => (
                <div key={category.name} className="flex items-center space-x-4 space-x-reverse">
                  <div className={`h-3 w-3 rounded-full ${category.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{category.name}</p>
                  </div>
                  <div className="text-sm font-bold">{category.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
