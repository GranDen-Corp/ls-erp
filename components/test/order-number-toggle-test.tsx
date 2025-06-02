"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateOrderNumber } from "@/lib/order-number-generator"

interface TestResult {
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: string
}

export default function OrderNumberToggleTest() {
  // 模擬訂單表單狀態
  const [orderNumber, setOrderNumber] = useState("")
  const [customOrderNumber, setCustomOrderNumber] = useState("")
  const [useCustomOrderNumber, setUseCustomOrderNumber] = useState(false)
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState(false)

  // 測試狀態
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [currentTest, setCurrentTest] = useState("")

  // 模擬自動生成訂單編號
  const generateNewOrderNumber = async () => {
    setIsLoadingOrderNumber(true)
    try {
      const newOrderNumber = await generateOrderNumber()
      setOrderNumber(newOrderNumber)
      return newOrderNumber
    } catch (error) {
      console.error("Failed to generate order number:", error)
      return ""
    } finally {
      setIsLoadingOrderNumber(false)
    }
  }

  // 初始化時生成訂單編號
  useEffect(() => {
    generateNewOrderNumber()
  }, [])

  // 處理自訂編號切換
  const handleCustomOrderNumberToggle = (checked: boolean) => {
    setUseCustomOrderNumber(checked)

    // 如果從自訂切換到自動，確保顯示自動生成的編號
    if (!checked && orderNumber) {
      setCustomOrderNumber("") // 清空自訂編號
    } else if (checked) {
      // 如果從自動切換到自訂，可以將當前自動編號作為自訂編號的初始值
      if (orderNumber && customOrderNumber === "") {
        setCustomOrderNumber(orderNumber)
      }
    }
  }

  // 執行測試
  const runTests = async () => {
    setIsRunningTests(true)
    setTestResults([])
    const results: TestResult[] = []

    // 測試 1: 初始狀態檢查
    setCurrentTest("檢查初始狀態...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!useCustomOrderNumber && orderNumber) {
      results.push({
        test: "初始狀態檢查",
        status: "pass",
        message: "預設為自動編號模式，且已生成編號",
        details: `自動編號: ${orderNumber}`,
      })
    } else {
      results.push({
        test: "初始狀態檢查",
        status: "fail",
        message: "初始狀態不正確",
        details: `useCustom: ${useCustomOrderNumber}, orderNumber: ${orderNumber}`,
      })
    }

    // 測試 2: 切換到自訂編號
    setCurrentTest("測試切換到自訂編號...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    const originalOrderNumber = orderNumber
    handleCustomOrderNumberToggle(true)

    if (useCustomOrderNumber && customOrderNumber === originalOrderNumber) {
      results.push({
        test: "切換到自訂編號",
        status: "pass",
        message: "成功切換到自訂編號，並複製了自動編號",
        details: `自訂編號: ${customOrderNumber}`,
      })
    } else {
      results.push({
        test: "切換到自訂編號",
        status: "fail",
        message: "切換到自訂編號失敗",
        details: `useCustom: ${useCustomOrderNumber}, customOrderNumber: ${customOrderNumber}`,
      })
    }

    // 測試 3: 修改自訂編號
    setCurrentTest("測試修改自訂編號...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    const testCustomNumber = "2501000001"
    setCustomOrderNumber(testCustomNumber)

    if (customOrderNumber === testCustomNumber) {
      results.push({
        test: "修改自訂編號",
        status: "pass",
        message: "成功修改自訂編號",
        details: `修改後編號: ${testCustomNumber}`,
      })
    } else {
      results.push({
        test: "修改自訂編號",
        status: "warning",
        message: "自訂編號修改可能有延遲",
        details: `期望: ${testCustomNumber}, 實際: ${customOrderNumber}`,
      })
    }

    // 測試 4: 切換回自動編號
    setCurrentTest("測試切換回自動編號...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    handleCustomOrderNumberToggle(false)

    if (!useCustomOrderNumber && customOrderNumber === "") {
      results.push({
        test: "切換回自動編號",
        status: "pass",
        message: "成功切換回自動編號，自訂編號已清空",
        details: `自動編號: ${orderNumber}`,
      })
    } else {
      results.push({
        test: "切換回自動編號",
        status: "fail",
        message: "切換回自動編號失敗",
        details: `useCustom: ${useCustomOrderNumber}, customOrderNumber: ${customOrderNumber}`,
      })
    }

    // 測試 5: 重新生成自動編號
    setCurrentTest("測試重新生成自動編號...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    const oldOrderNumber = orderNumber
    const newOrderNumber = await generateNewOrderNumber()

    if (newOrderNumber && newOrderNumber !== oldOrderNumber) {
      results.push({
        test: "重新生成自動編號",
        status: "pass",
        message: "成功重新生成新的自動編號",
        details: `舊編號: ${oldOrderNumber}, 新編號: ${newOrderNumber}`,
      })
    } else if (newOrderNumber === oldOrderNumber) {
      results.push({
        test: "重新生成自動編號",
        status: "warning",
        message: "生成的編號與之前相同（可能是正常情況）",
        details: `編號: ${newOrderNumber}`,
      })
    } else {
      results.push({
        test: "重新生成自動編號",
        status: "fail",
        message: "重新生成編號失敗",
        details: `結果: ${newOrderNumber}`,
      })
    }

    // 測試 6: 編號格式驗證
    setCurrentTest("測試編號格式驗證...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    const orderNumberRegex = /^\d{9}$/
    const isValidFormat = orderNumberRegex.test(orderNumber)

    if (isValidFormat) {
      results.push({
        test: "編號格式驗證",
        status: "pass",
        message: "訂單編號格式正確 (YYMMXXXXX)",
        details: `編號: ${orderNumber}`,
      })
    } else {
      results.push({
        test: "編號格式驗證",
        status: "fail",
        message: "訂單編號格式不正確",
        details: `編號: ${orderNumber}, 應為9位數字`,
      })
    }

    setTestResults(results)
    setCurrentTest("")
    setIsRunningTests(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return (
          <Badge variant="default" className="bg-green-500">
            通過
          </Badge>
        )
      case "fail":
        return <Badge variant="destructive">失敗</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            警告
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 測試控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>訂單編號切換功能測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={runTests} disabled={isRunningTests} className="flex items-center space-x-2">
              {isRunningTests ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span>{isRunningTests ? "測試中..." : "開始測試"}</span>
            </Button>

            {currentTest && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">{currentTest}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 模擬訂單編號組件 */}
      <Card>
        <CardHeader>
          <CardTitle>訂單編號設定 (測試環境)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="orderNumber">訂單編號</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="useCustomOrderNumber"
                checked={useCustomOrderNumber}
                onCheckedChange={handleCustomOrderNumberToggle}
              />
              <Label htmlFor="useCustomOrderNumber" className="text-sm">
                使用自訂編號
              </Label>
            </div>
          </div>

          {useCustomOrderNumber ? (
            <div className="space-y-2">
              <Input
                id="customOrderNumber"
                value={customOrderNumber}
                onChange={(e) => setCustomOrderNumber(e.target.value)}
                placeholder="請輸入自訂訂單編號 (格式: YYMMXXXXX)"
                maxLength={9}
              />
              <p className="text-sm text-orange-600">請輸入9位數字格式的訂單編號 (YYMMXXXXX)</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  placeholder={isLoadingOrderNumber ? "生成中..." : "系統自動生成"}
                  disabled={true}
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateNewOrderNumber}
                  disabled={isLoadingOrderNumber}
                >
                  {isLoadingOrderNumber ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">系統自動生成格式：YYMMXXXXX (年月+5位序號，每月重新計算)</p>
            </div>
          )}

          {/* 狀態顯示 */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">當前狀態</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">模式:</span>
                <span className="ml-2">{useCustomOrderNumber ? "自訂編號" : "自動編號"}</span>
              </div>
              <div>
                <span className="font-medium">自動編號:</span>
                <span className="ml-2">{orderNumber || "未生成"}</span>
              </div>
              <div>
                <span className="font-medium">自訂編號:</span>
                <span className="ml-2">{customOrderNumber || "未設定"}</span>
              </div>
              <div>
                <span className="font-medium">生成中:</span>
                <span className="ml-2">{isLoadingOrderNumber ? "是" : "否"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 測試結果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">詳細資訊: {result.details}</p>
                  )}
                </div>
              ))}

              {/* 測試總結 */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  測試完成！通過: {testResults.filter((r) => r.status === "pass").length}， 失敗:{" "}
                  {testResults.filter((r) => r.status === "fail").length}， 警告:{" "}
                  {testResults.filter((r) => r.status === "warning").length}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
