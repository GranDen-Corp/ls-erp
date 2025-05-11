"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, LineChart, Plus, Save, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// 模擬匯率數據
const initialExchangeRates = [
  {
    id: "1",
    fromCurrency: "USD",
    toCurrency: "TWD",
    rate: 31.25,
    isBase: true,
    isActive: true,
    history: [
      { date: "2023-01-01", rate: 30.5 },
      { date: "2023-02-01", rate: 30.75 },
      { date: "2023-03-01", rate: 31.0 },
      { date: "2023-04-01", rate: 31.25 },
      { date: "2023-05-01", rate: 31.1 },
      { date: "2023-06-01", rate: 31.25 },
    ],
  },
  {
    id: "2",
    fromCurrency: "EUR",
    toCurrency: "TWD",
    rate: 33.75,
    isBase: false,
    isActive: true,
    history: [
      { date: "2023-01-01", rate: 32.5 },
      { date: "2023-02-01", rate: 33.0 },
      { date: "2023-03-01", rate: 33.25 },
      { date: "2023-04-01", rate: 33.5 },
      { date: "2023-05-01", rate: 33.6 },
      { date: "2023-06-01", rate: 33.75 },
    ],
  },
  {
    id: "3",
    fromCurrency: "CNY",
    toCurrency: "TWD",
    rate: 4.35,
    isBase: false,
    isActive: true,
    history: [
      { date: "2023-01-01", rate: 4.2 },
      { date: "2023-02-01", rate: 4.25 },
      { date: "2023-03-01", rate: 4.3 },
      { date: "2023-04-01", rate: 4.32 },
      { date: "2023-05-01", rate: 4.33 },
      { date: "2023-06-01", rate: 4.35 },
    ],
  },
]

// 貨幣列表
const currencies = [
  { code: "USD", name: "美元" },
  { code: "EUR", name: "歐元" },
  { code: "JPY", name: "日元" },
  { code: "CNY", name: "人民幣" },
  { code: "TWD", name: "新台幣" },
  { code: "HKD", name: "港幣" },
]

interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  isBase: boolean
  isActive: boolean
  history: { date: string; rate: number }[]
}

export function ExchangeRateSettings() {
  const [rates, setRates] = useState<ExchangeRate[]>(initialExchangeRates)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null)
  const [isNewRate, setIsNewRate] = useState(false)

  const handleAddRate = () => {
    setCurrentRate({
      id: `${Date.now()}`,
      fromCurrency: "",
      toCurrency: "TWD",
      rate: 1,
      isBase: false,
      isActive: true,
      history: [],
    })
    setIsNewRate(true)
    setIsDialogOpen(true)
  }

  const handleEditRate = (rate: ExchangeRate) => {
    setCurrentRate(rate)
    setIsNewRate(false)
    setIsDialogOpen(true)
  }

  const handleViewHistory = (rate: ExchangeRate) => {
    setCurrentRate(rate)
    setIsHistoryDialogOpen(true)
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    setRates(rates.map((rate) => (rate.id === id ? { ...rate, isActive } : rate)))
  }

  const handleDeleteRate = (id: string) => {
    setRates(rates.filter((rate) => rate.id !== id))
  }

  const handleSaveRate = () => {
    if (!currentRate) return

    if (isNewRate) {
      setRates([...rates, currentRate])
    } else {
      setRates(rates.map((rate) => (rate.id === currentRate.id ? currentRate : rate)))
    }

    setIsDialogOpen(false)
  }

  const handleSetBase = (id: string) => {
    setRates(
      rates.map((rate) => ({
        ...rate,
        isBase: rate.id === id,
      })),
    )
  }

  const getCurrencyName = (code: string) => {
    const currency = currencies.find((c) => c.code === code)
    return currency ? `${currency.code} (${currency.name})` : code
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">匯率設定</h3>
          <p className="text-sm text-muted-foreground">設定並追蹤不同貨幣之間的匯率</p>
        </div>
        <Button onClick={handleAddRate}>
          <Plus className="mr-2 h-4 w-4" />
          新增匯率
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>從貨幣</TableHead>
              <TableHead>至貨幣</TableHead>
              <TableHead>匯率</TableHead>
              <TableHead>基準</TableHead>
              <TableHead>啟用</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>{getCurrencyName(rate.fromCurrency)}</TableCell>
                <TableCell>{getCurrencyName(rate.toCurrency)}</TableCell>
                <TableCell>{rate.rate.toFixed(4)}</TableCell>
                <TableCell>{rate.isBase ? <Badge variant="outline">基準匯率</Badge> : null}</TableCell>
                <TableCell>
                  <Switch checked={rate.isActive} onCheckedChange={(checked) => handleToggleActive(rate.id, checked)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewHistory(rate)}>
                      <LineChart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditRate(rate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRate(rate.id)}
                      disabled={rate.isBase}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 新增/編輯匯率對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewRate ? "新增匯率" : "編輯匯率"}</DialogTitle>
            <DialogDescription>{isNewRate ? "新增一個匯率到系統中" : "編輯現有的匯率"}</DialogDescription>
          </DialogHeader>

          {currentRate && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fromCurrency">從貨幣</Label>
                <Select
                  value={currentRate.fromCurrency}
                  onValueChange={(value) =>
                    setCurrentRate({
                      ...currentRate,
                      fromCurrency: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇貨幣" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} ({currency.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="toCurrency">至貨幣</Label>
                <Select
                  value={currentRate.toCurrency}
                  onValueChange={(value) =>
                    setCurrentRate({
                      ...currentRate,
                      toCurrency: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇貨幣" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} ({currency.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rate">匯率</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.0001"
                  value={currentRate.rate}
                  onChange={(e) =>
                    setCurrentRate({
                      ...currentRate,
                      rate: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isBase"
                  checked={currentRate.isBase}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // 如果設為基準，其他匯率都不是基準
                      handleSetBase(currentRate.id)
                    }
                    setCurrentRate({
                      ...currentRate,
                      isBase: checked,
                    })
                  }}
                />
                <Label htmlFor="isBase">設為基準匯率</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={currentRate.isActive}
                  onCheckedChange={(checked) =>
                    setCurrentRate({
                      ...currentRate,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="isActive">啟用此匯率</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRate}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 匯率歷史對話框 */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>匯率歷史</DialogTitle>
            <DialogDescription>
              {currentRate && `${currentRate.fromCurrency} 至 ${currentRate.toCurrency} 的匯率歷史記錄`}
            </DialogDescription>
          </DialogHeader>

          {currentRate && (
            <Card>
              <CardHeader>
                <CardTitle>匯率趨勢</CardTitle>
                <CardDescription>過去6個月的匯率變化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={currentRate.history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="date" />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead className="text-right">匯率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRate.history.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">{item.rate.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
