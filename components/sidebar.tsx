"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
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
  ChevronLeft,
  ChevronRight,
  Database,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps = {}) {
  const pathname = usePathname()
  const { collapsed, toggleSidebar } = useSidebar()

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
          active: pathname === "/orders/new-test",
          icon: Plus,
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
          href: "/products/all?filter=assembly",
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
      label: "供應商管理",
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
      label: "系統設定",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings" || pathname?.startsWith("/settings/"),
    },
    {
      label: "SBTest資料表",
      icon: Database,
      href: "/local-data",
      active: pathname === "/local-data" || pathname?.startsWith("/local-data/"),
    },
  ]

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex flex-col h-full border-r transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className,
        )}
      >
        <div className="flex items-center p-6 border-b">
          {!collapsed && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <Image src="/images/logo.jpg" alt="Logo" width={64} height={64} className="rounded-sm" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">今湛貿易 ERP 系統</span>
                <span className="text-xs text-muted-foreground">alpha ver.: v0.1</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto my-2">
              <Image src="/images/new-logo.png" alt="Logo" width={64} height={64} className="rounded-sm" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {routes.map((route) => (
              <div key={route.href}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex justify-center items-center h-10 w-10 rounded-md mx-auto my-1",
                          route.active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{route.label}</TooltipContent>
                  </Tooltip>
                ) : (
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
                )}

                {route.subItems && route.active && !collapsed && (
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
          </nav>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>
    </TooltipProvider>
  )
}
