"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface FactoriesFilterProps {
  onFilterChange: (filters: {
    createdDateRange: { from: Date | undefined; to: Date | undefined } | undefined
    updatedDateRange: { from: Date | undefined; to: Date | undefined } | undefined
    countryCode: string
    supplierType: string
  }) => void
}

interface Country {
  code: string
  name: string
  name_en: string
  region_code: string
}

interface Region {
  code: string
  name: string
  name_en: string
}

export function FactoriesFilter({ onFilterChange }: FactoriesFilterProps) {
  const [createdDateRange, setCreatedDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const [updatedDateRange, setUpdatedDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const [countryCode, setCountryCode] = useState<string>("all")
  const [supplierType, setSupplierType] = useState<string>("all")
  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])

  // 供應商類型選項
  const supplierTypes = [
    { value: "assembly", label: "組裝廠" },
    { value: "production", label: "生產廠" },
    { value: "parts", label: "零件廠" },
    { value: "material", label: "材料供應商" },
    { value: "service", label: "服務供應商" },
  ]

  // 獲取國家和地區資料
  useEffect(() => {
    async function fetchCountriesAndRegions() {
      try {
        // 獲取國家資料
        const { data: countriesData, error: countriesError } = await supabase
          .from("countries")
          .select("code, name, name_en, region_code")
          .order("name_en")

        if (countriesError) throw countriesError

        // 獲取地區資料
        const { data: regionsData, error: regionsError } = await supabase
          .from("regions")
          .select("code, name, name_en")
          .order("name_en")

        if (regionsError) throw regionsError

        setCountries(countriesData || [])
        setRegions(regionsData || [])
      } catch (error) {
        console.error("獲取國家和地區資料失敗:", error)
      }
    }

    fetchCountriesAndRegions()
  }, [])

  // 當篩選條件變更時，通知父組件
  useEffect(() => {
    onFilterChange({
      createdDateRange,
      updatedDateRange,
      countryCode,
      supplierType,
    })
  }, [createdDateRange, updatedDateRange, countryCode, supplierType, onFilterChange])

  // 重置篩選條件
  const resetFilters = () => {
    setCreatedDateRange({ from: undefined, to: undefined })
    setUpdatedDateRange({ from: undefined, to: undefined })
    setCountryCode("all")
    setSupplierType("all")
  }

  // 根據地區分組國家
  const countryGroups = regions
    .map((region) => {
      const regionCountries = countries.filter((country) => country.region_code === region.code)
      return {
        region,
        countries: regionCountries,
      }
    })
    .filter((group) => group.countries.length > 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 建立時間篩選 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">建立時間</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !createdDateRange.from && !createdDateRange.to && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {createdDateRange.from ? (
                  createdDateRange.to ? (
                    <>
                      {format(createdDateRange.from, "yyyy-MM-dd")} - {format(createdDateRange.to, "yyyy-MM-dd")}
                    </>
                  ) : (
                    format(createdDateRange.from, "yyyy-MM-dd")
                  )
                ) : (
                  "選擇日期範圍"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={createdDateRange.from}
                selected={createdDateRange}
                onSelect={setCreatedDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 更新時間篩選 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">更新時間</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !updatedDateRange.from && !updatedDateRange.to && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {updatedDateRange.from ? (
                  updatedDateRange.to ? (
                    <>
                      {format(updatedDateRange.from, "yyyy-MM-dd")} - {format(updatedDateRange.to, "yyyy-MM-dd")}
                    </>
                  ) : (
                    format(updatedDateRange.from, "yyyy-MM-dd")
                  )
                ) : (
                  "選擇日期範圍"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={updatedDateRange.from}
                selected={updatedDateRange}
                onSelect={setUpdatedDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 國家/地區篩選 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">國家/地區</label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger>
              <SelectValue placeholder="選擇國家/地區" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有國家/地區</SelectItem>
              {countryGroups.map((group) => (
                <div key={group.region.code}>
                  <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                    {group.region.name} ({group.region.name_en})
                  </div>
                  {group.countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.name_en})
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 供應商類型篩選 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">供應商類型</label>
          <Select value={supplierType} onValueChange={setSupplierType}>
            <SelectTrigger>
              <SelectValue placeholder="選擇供應商類型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有類型</SelectItem>
              {supplierTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 重置按鈕 */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetFilters}>
          重置篩選條件
        </Button>
      </div>
    </div>
  )
}
