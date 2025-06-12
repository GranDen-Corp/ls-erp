"use client"

import { type ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download, Upload, RefreshCw } from "lucide-react"
import { AdvancedFilter, type FilterOption } from "@/components/ui/advanced-filter"
import Link from "next/link"

type ManagementLayoutProps = {
  title: string
  description?: string
  createNewHref?: string
  createNewLabel?: string
  filterOptions?: FilterOption[]
  onFilterChange?: (filters: Record<string, any>) => void
  onRefresh?: () => void
  onExport?: () => void
  onImport?: () => void
  children: ReactNode
  searchPlaceholder?: string
  actionButtons?: ReactNode
  extraFilterControls?: ReactNode
  className?: string
}

export function ManagementLayout({
  title,
  description,
  createNewHref,
  createNewLabel = "新增",
  filterOptions = [],
  onFilterChange = () => {},
  onRefresh,
  onExport,
  onImport,
  children,
  searchPlaceholder,
  actionButtons,
  extraFilterControls,
  className,
}: ManagementLayoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsLoading(true)
    await onRefresh()
    setIsLoading(false)
  }

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actionButtons}

          {createNewHref && (
            <Button asChild>
              <Link href={createNewHref}>
                <Plus className="mr-2 h-4 w-4" />
                {createNewLabel}
              </Link>
            </Button>
          )}

          {onRefresh && (
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              刷新
            </Button>
          )}

          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              導出
            </Button>
          )}

          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              導入
            </Button>
          )}
        </div>
      </div>

      {filterOptions.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">搜尋與篩選</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1">
                <AdvancedFilter
                  options={filterOptions}
                  onFilterChange={onFilterChange}
                  placeholder={searchPlaceholder}
                />
              </div>
              {extraFilterControls && <div className="flex items-center">{extraFilterControls}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {children}
    </div>
  )
}
