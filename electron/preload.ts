import { contextBridge, ipcRenderer } from 'electron'

// 定義 Electron API 的型別
interface ElectronAPI {
  openFile: (path: string) => Promise<{ success: boolean; error?: string }>
  readFile: (path: string) => Promise<{ 
    success: boolean; 
    data?: string; 
    contentType?: string; 
    error?: string 
  }>
  checkFileExists: (path: string) => Promise<{ exists: boolean }>
}

// 暴露 API 到渲染進程
contextBridge.exposeInMainWorld('electron', {
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  checkFileExists: (filePath: string) => ipcRenderer.invoke('check-file-exists', filePath)
}) 