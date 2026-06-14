/** 原生 macOS 菜单栏 */

import { app, Menu, type BrowserWindow } from 'electron'

export function createMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin'

  const sendAction = (action: string): void => {
    mainWindow.webContents.send('menu:action', action)
  }

  const template: Electron.MenuItemConstructorOptions[] = [
    // ── App 菜单 (macOS) ──────────────────────────
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { label: '关于 DeepSeek API Monitor', role: 'about' as const },
              { type: 'separator' as const },
              {
                label: '偏好设置...',
                accelerator: 'Cmd+,',
                click: () => sendAction('settings'),
              },
              { type: 'separator' as const },
              { label: '服务', role: 'services' as const },
              { type: 'separator' as const },
              { label: '隐藏', accelerator: 'Cmd+H', role: 'hide' as const },
              { label: '隐藏其他', accelerator: 'Cmd+Shift+H', role: 'hideOthers' as const },
              { label: '显示全部', role: 'unhide' as const },
              { type: 'separator' as const },
              { label: '退出', accelerator: 'Cmd+Q', role: 'quit' as const },
            ],
          },
        ]
      : []),

    // ── 编辑菜单 ───────────────────────────────────
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },

    // ── 监控菜单 ───────────────────────────────────
    {
      label: '监控',
      submenu: [
        {
          label: '开始/停止监控',
          accelerator: 'CmdOrCtrl+R',
          click: () => sendAction('toggle-monitoring'),
        },
        {
          label: '停止监控',
          accelerator: 'CmdOrCtrl+.',
          click: () => sendAction('stop-monitoring'),
        },
        { type: 'separator' },
        {
          label: '立即刷新',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => sendAction('refresh'),
        },
        { type: 'separator' },
        {
          label: '切换 Mock 模式',
          accelerator: 'CmdOrCtrl+D',
          click: () => sendAction('toggle-mock'),
        },
      ],
    },

    // ── 窗口菜单 ───────────────────────────────────
    {
      label: '窗口',
      submenu: [
        { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '缩放', role: 'zoom' },
        { type: 'separator' },
        { label: '全部置于顶层', role: 'front' },
      ],
    },

    // ── 帮助菜单 ───────────────────────────────────
    {
      label: '帮助',
      submenu: [
        {
          label: '使用指南',
          click: () => sendAction('open-guide'),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
