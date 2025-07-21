"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, HelpCircle, FileText, AlertTriangle, Clock } from "lucide-react"

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
      title: "في انتظار التقييم",
      value: "12",
      description: "تحتاج تقييم القائد",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "تنبيهات اليوم",
      value: "5",
      description: "تنبيه مكافحة غش",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  const recentActivity = [
    { user: "أحمد محمد", action: "أكمل امتحان كشافة", time: "منذ 5 دقائق" },
    { user: "فاطمة علي", action: "أكمل امتحان مرشدات", time: "منذ 15 دقيقة" },
    { user: "محمد حسن", action: "تنبيه: تبديل التبويبات", time: "منذ 20 دقيقة", isAlert: true },
    { user: "نور أحمد", action: "أكمل امتحان جوالة", time: "منذ ساعة" },
    { user: "مينا صبحي", action: "أكمل امتحان براعم", time: "منذ ساعتين" },
  ]

  const categories = [
    { name: "براعم", count: 35, color: "bg-blue-500" },
    { name: "أشبال", count: 42, color: "bg-green-500" },
    { name: "كشافة", count: 38, color: "bg-purple-500" },
    { name: "مرشدات", count: 29, color: "bg-orange-500" },
    { name: "جوالة", count: 21, color: "bg-red-500" },
    { name: "ذوو الهمم", count: 15, color: "bg-gray-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
        <p className="text-gray-600 mt-2">مرحباً بك في نظام إدارة امتحانات الدرجات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                <IconComponent className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">النشاط الأخير</CardTitle>
            <CardDescription>آخر الامتحانات والأنشطة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div 
                      className={`h-3 w-3 rounded-full ${activity.isAlert ? "bg-red-500" : "bg-green-500"}`} 
                    />
                    <div>
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className={`text-sm ${activity.isAlert ? "text-red-600" : "text-gray-600"}`}>
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">توزيع الفئات</CardTitle>
            <CardDescription>عدد الامتحانات حسب كل فئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`h-4 w-4 rounded-full ${category.color}`} />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
          <CardDescription>الوصول السريع للمهام الأكثر استخداماً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium">إضافة مستخدمين</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 transition-colors cursor-pointer">
              <HelpCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium">إضافة أسئلة</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="font-medium">عرض النتائج</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 transition-colors cursor-pointer">
              <AlertTriangle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="font-medium">مراجعة التنبيهات</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-6 border-t">
        © 2025 General Secretariat for Scouts & Guides – Shoubra El-Kheima Diocese. All rights reserved.
      </div>
    </div>
  )
}