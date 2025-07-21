"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BarChart3,
  Users,
  HelpCircle,
  Settings,
  FileText,
  AlertTriangle,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"

const menuItems = [
  {
    title: "الصفحة الرئيسية",
    url: "/admin",
    icon: Home,
    tooltip: "لوحة التحكم الرئيسية",
  },
  {
    title: "المستخدمون",
    url: "/admin/users",
    icon: Users,
    tooltip: "إدارة المستخدمين والكشافة",
  },
  {
    title: "الأسئلة",
    url: "/admin/questions",
    icon: HelpCircle,
    tooltip: "إدارة بنك الأسئلة",
  },
  {
    title: "إعدادات الامتحانات",
    url: "/admin/test-settings",
    icon: Settings,
    tooltip: "تكوين الامتحانات والفئات",
  },
  {
    title: "النتائج",
    url: "/admin/results",
    icon: FileText,
    tooltip: "عرض وإدارة نتائج الامتحانات",
  },
  {
    title: "تقييم ما بعد الامتحان",
    url: "/admin/post-evaluation",
    icon: User,
    tooltip: "تقييم المحفوظات والسلوك",
    badge: 2, // Number of pending evaluations
  },
  {
    title: "الإشعارات / مكافحة الغش",
    url: "/admin/alerts",
    icon: AlertTriangle,
    tooltip: "مراقبة محاولات الغش والتنبيهات",
    badge: 5,
  },
  {
    title: "النظام",
    url: "/admin/system",
    icon: BarChart3,
    tooltip: "إعدادات النظام والإحصائيات",
  },
]

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userCode")
    router.push("/")
  }

  return (
    <TooltipProvider>
          <div
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{ direction: 'rtl' }}
    >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10">
                  <img src="/logo.png" alt="شعار الأمانة العامة" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">لوحة التحكم</p>
                  <p className="text-xs text-gray-500">الأمانة العامة</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100"
            >
              {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.url
              const MenuItem = (
                <Button
                  key={item.title}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-12 ${
                    isActive
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${isCollapsed ? "px-3" : "px-4"}`}
                  onClick={() => router.push(item.url)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-right">{item.title}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <div className="relative">{MenuItem}</div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="mr-2">
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return MenuItem
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full p-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="mr-2">
                <p>تسجيل الخروج</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start h-12 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 ml-3" />
              <span>تسجيل الخروج</span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
