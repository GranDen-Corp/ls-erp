"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Moon, Sun } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const { setTheme } = useTheme()
  const [notifications, setNotifications] = useState(3)

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <Image src="/images/logo.jpg" alt="Logo" width={40} height={40} className="mr-2" />
            <span className="text-lg font-semibold">今湛貿易 ERP 系統</span>
          </div>
          <span className="text-xs text-muted-foreground ml-1">alpha ver.: v0.1</span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>有3張訂單待確認</DropdownMenuItem>
              <DropdownMenuItem>有2張訂單驗貨完成</DropdownMenuItem>
              <DropdownMenuItem>有1張訂單已出貨</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">切換主題</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>淺色</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>深色</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>系統</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="使用者" />
                  <AvatarFallback>LS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>個人資料</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
              <DropdownMenuItem>登出</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
