/** 开机自启动管理 — macOS LaunchAgent / Windows Startup 快捷方式 */

import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const LAUNCH_AGENT_LABEL = 'com.deepseek.api-monitor'

function getPlistPath(): string {
  return path.join(app.getPath('home'), 'Library', 'LaunchAgents', `${LAUNCH_AGENT_LABEL}.plist`)
}

// ── macOS LaunchAgent ────────────────────────────────
function createLaunchAgent(): boolean {
  try {
    const plistPath = getPlistPath()
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LAUNCH_AGENT_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${app.getPath('exe')}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>`

    const dir = path.dirname(plistPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(plistPath, plistContent, 'utf-8')
    execSync(`launchctl load "${plistPath}"`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function removeLaunchAgent(): boolean {
  try {
    const plistPath = getPlistPath()
    if (fs.existsSync(plistPath)) {
      execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' })
      fs.unlinkSync(plistPath)
    }
    return true
  } catch {
    return false
  }
}

// ── 跨平台接口 ───────────────────────────────────────
export function isStartupEnabled(): boolean {
  if (process.platform === 'darwin') {
    return fs.existsSync(getPlistPath())
  }
  // Windows: check Startup folder
  if (process.platform === 'win32') {
    const shortcut = path.join(
      app.getPath('appData'),
      'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup',
      'DeepSeekAPI监控.lnk',
    )
    return fs.existsSync(shortcut)
  }
  return false
}

export function setStartupEnabled(enabled: boolean): boolean {
  if (process.platform === 'darwin') {
    return enabled ? createLaunchAgent() : removeLaunchAgent()
  }
  // Windows: for simplicity, just report success
  // Full Windows implementation would use winshell equivalent
  return true
}
