"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Users,
  Factory,
  Zap,
  PieChart,
  LineChart,
  BarChart,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps = {}) {
  const pathname = usePathname()

  const routes = [
    {
      label: "儀表板",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "訂單管理",
      icon: ClipboardList,
      href: "/orders",
      active: pathname === "/orders" || pathname?.startsWith("/orders/"),
      subItems: [
        {
          label: "所有訂單",
          href: "/orders",
          active: pathname === "/orders",
        },
        {
          label: "新增訂單",
          href: "/orders/new",
          active: pathname === "/orders/new",
        },
        {
          label: "快速建立訂單",
          href: "/orders/quick-create",
          active: pathname === "/orders/quick-create",
          icon: Zap,
        },
      ],
    },
    {
      label: "採購單",
      icon: ShoppingCart,
      href: "/purchases",
      active: pathname === "/purchases" || pathname?.startsWith("/purchases/"),
    },
    {
      label: "出貨管理",
      icon: Truck,
      href: "/shipments",
      active: pathname === "/shipments" || pathname?.startsWith("/shipments/"),
    },
    {
      label: "產品管理",
      icon: Package,
      href: "/products",
      active: pathname === "/products" || pathname?.startsWith("/products/"),
      subItems: [
        {
          label: "所有產品",
          href: "/products",
          active: pathname === "/products",
        },
        {
          label: "組合產品",
          href: "/products/assembly",
          active: pathname === "/products/assembly",
        },
        {
          label: "新增產品",
          href: "/products/new",
          active: pathname === "/products/new",
        },
      ],
    },
    {
      label: "客戶管理",
      icon: Users,
      href: "/customers",
      active: pathname === "/customers" || pathname?.startsWith("/customers/"),
    },
    {
      label: "工廠管理",
      icon: Factory,
      href: "/factories",
      active: pathname === "/factories" || pathname?.startsWith("/factories/"),
    },
    {
      label: "客訴處理",
      icon: AlertTriangle,
      href: "/complaints",
      active: pathname === "/complaints" || pathname?.startsWith("/complaints/"),
    },
    {
      label: "報表中心",
      icon: BarChart3,
      href: "/reports",
      active: pathname === "/reports" || pathname?.startsWith("/reports/"),
      subItems: [
        {
          label: "客戶報表",
          href: "/reports?tab=customers",
          active: pathname === "/reports" && pathname.includes("customers"),
          icon: Users,
        },
        {
          label: "銷售報表",
          href: "/reports?tab=sales",
          active: pathname === "/reports" && pathname.includes("sales"),
          icon: LineChart,
        },
        {
          label: "產品報表",
          href: "/reports?tab=products",
          active: pathname === "/reports" && pathname.includes("products"),
          icon: PieChart,
        },
        {
          label: "績效報表",
          href: "/reports?tab=performance",
          active: pathname === "/reports" && pathname.includes("performance"),
          icon: BarChart,
        },
      ],
    },
    {
      label: "文件管理",
      icon: FileText,
      href: "/documents",
      active: pathname === "/documents" || pathname?.startsWith("/documents/"),
    },
    {
      label: "系統設置",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings" || pathname?.startsWith("/settings/"),
    },
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">今湛貿易 ERP 系統</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.href}>
                <Link
                  href={route.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    route.active ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
                {route.subItems && route.active && (
                  <div className="ml-6 mt-1 space-y-1">
                    {route.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          subItem.active ? "bg-accent/50 text-accent-foreground" : "transparent",
                        )}
                      >
                        {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
