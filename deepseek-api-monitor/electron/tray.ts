/** 系统托盘 — macOS 菜单栏图标 */

import { app, Menu, Tray, nativeImage, type BrowserWindow } from 'electron'
import * as path from 'path'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): Tray {
  // 创建 16x16 托盘图标 (使用简单的绿色圆点作为占位)
  const iconSize = 16
  const canvas = Buffer.alloc(iconSize * iconSize * 4)

  // 绘制一个简单的青绿色圆点
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const idx = (y * iconSize + x) * 4
      const dx = x - iconSize / 2 + 0.5
      const dy = y - iconSize / 2 + 0.5
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < iconSize / 2 - 1) {
        canvas[idx] = 45      // R
        canvas[idx + 1] = 212  // G
        canvas[idx + 2] = 191  // B
        canvas[idx + 3] = 255  // A
      } else {
        canvas[idx + 3] = 0   // Transparent
      }
    }
  }

  const icon = nativeImage.createFromBuffer(canvas, { width: iconSize, height: iconSize })
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setToolTip('DeepSeek API Monitor')
  tray.setContextMenu(contextMenu)

  // 单击托盘图标显示窗口
  tray.on('click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  return tray
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
