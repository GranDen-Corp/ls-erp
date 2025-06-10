import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath)
}) 