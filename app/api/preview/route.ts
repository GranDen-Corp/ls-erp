import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: '未提供檔案路徑' }, { status: 400 })
    }

    // 解碼 URL 編碼的路徑
    const decodedPath = decodeURIComponent(filePath)
    console.log('嘗試讀取檔案:', decodedPath)

    // 檢查檔案是否存在
    if (!fs.existsSync(decodedPath)) {
      console.error(`檔案不存在: ${decodedPath}`)
      return NextResponse.json({ error: '檔案不存在' }, { status: 404 })
    }

    try {
      // 讀取檔案
      const fileBuffer = fs.readFileSync(decodedPath)
      
      // 根據副檔名設定 MIME 類型
      const ext = path.extname(decodedPath).toLowerCase()
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
      }
      
      const contentType = mimeTypes[ext] || 'application/octet-stream'

      // 回傳檔案內容
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    } catch (readError) {
      console.error(`讀取檔案時發生錯誤: ${decodedPath}`, readError)
      return NextResponse.json({ error: '讀取檔案時發生錯誤' }, { status: 500 })
    }
  } catch (error) {
    console.error('處理請求時發生錯誤:', error)
    return NextResponse.json({ error: '處理請求時發生錯誤' }, { status: 500 })
  }
} 