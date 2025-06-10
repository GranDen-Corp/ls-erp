interface ElectronAPI {
  openFile: (path: string) => void
}

declare global {
  interface Window {
    electron?: ElectronAPI
  }
}

export {} 