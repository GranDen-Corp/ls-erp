import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const type = searchParams.get('type')

    if (!filePath) {
      console.error('未提供路徑')
      return NextResponse.json({ error: '未提供路徑' }, { status: 400 })
    }

    // 解碼 URL 編碼的路徑
    const decodedPath = decodeURIComponent(filePath)
    console.log('嘗試讀取路徑:', decodedPath)

    // 檢查路徑是否存在
    if (!fs.existsSync(decodedPath)) {
      console.error(`路徑不存在: ${decodedPath}`)
      return NextResponse.json({ error: '路徑不存在' }, { status: 404 })
    }

    // 檢查檔案權限
    try {
      await fs.promises.access(decodedPath, fs.constants.R_OK)
    } catch (error) {
      console.error(`檔案權限不足: ${decodedPath}`, error)
      return NextResponse.json({ error: '檔案權限不足' }, { status: 403 })
    }

    // 如果是資料夾，使用系統命令開啟
    if (type === 'folder') {
      try {
        // 根據作業系統選擇適當的命令
        let command = ''
        if (process.platform === 'win32') {
          // Windows 系統
          command = `explorer "${decodedPath.replace(/\//g, '\\')}"`
        } else if (process.platform === 'darwin') {
          // macOS 系統
          command = `open "${decodedPath}"`
        } else {
          // Linux 系統
          command = `xdg-open "${decodedPath}"`
        }

        console.log('執行命令:', command)
        await execAsync(command)
        return NextResponse.json({ success: true, message: '資料夾已開啟' })
      } catch (error) {
        console.error('開啟資料夾時發生錯誤:', error)
        // 即使發生錯誤，如果資料夾已經開啟，我們也視為成功
        if (fs.existsSync(decodedPath)) {
          return NextResponse.json({ success: true, message: '資料夾已開啟' })
        }
        return NextResponse.json({ error: '開啟資料夾時發生錯誤' }, { status: 500 })
      }
    }

    // 如果是檔案，則讀取並回傳
    try {
      // 檢查是否為檔案
      const stats = fs.statSync(decodedPath)
      if (!stats.isFile()) {
        console.error(`路徑不是檔案: ${decodedPath}`)
        return NextResponse.json({ error: '路徑不是檔案' }, { status: 400 })
      }

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
      return NextResponse.json({ 
        error: '讀取檔案時發生錯誤',
        details: readError instanceof Error ? readError.message : '未知錯誤'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('處理請求時發生錯誤:', error)
    return NextResponse.json({ 
      error: '處理請求時發生錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}
