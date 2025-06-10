import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as url from 'url'
import { shell } from 'electron'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../.next/server/app/index.html'),
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(startUrl)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 處理檔案開啟請求
ipcMain.handle('open-file', async (event, filePath: string) => {
  try {
    await shell.openPath(filePath)
    return { success: true }
  } catch (error) {
    console.error('開啟檔案時發生錯誤:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知錯誤' }
  }
})

// 處理檔案讀取請求
ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const buffer = await fs.promises.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
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
    
    return {
      success: true,
      data: buffer.toString('base64'),
      contentType
    }
  } catch (error) {
    console.error('讀取檔案時發生錯誤:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知錯誤' 
    }
  }
})

// 處理檔案存在性檢查
ipcMain.handle('check-file-exists', async (event, filePath: string) => {
  try {
    await fs.promises.access(filePath)
    return { exists: true }
  } catch {
    return { exists: false }
  }
}) 