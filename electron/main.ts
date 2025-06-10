import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as url from 'url'
import { shell } from 'electron'

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
    return { success: false, error: error.message }
  }
}) 