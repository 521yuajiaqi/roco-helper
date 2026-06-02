// 数据远程更新逻辑
// TODO: 填入远程数据源的实际 URL
// 格式示例: https://github.com/<你的用户名>/roco-data/releases/latest/download/

// 远程版本检查地址（待替换为实际地址）
const VERSION_URL = 'https://example.com/roco-data/version.json'
// 远程数据下载地址（待替换为实际地址）
const DATA_URL = 'https://example.com/roco-data/data.json'

/**
 * 获取本地数据版本号
 * @returns {Promise<string>}
 */
async function getLocalVersion() {
  const stored = localStorage.getItem('data_version')
  return stored || '0.0.0'
}

/**
 * 获取远程数据版本号
 * @returns {Promise<string>}
 */
async function fetchRemoteVersion() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-cache' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data.version || '0.0.0'
  } catch (err) {
    console.error('获取远程版本失败:', err)
    throw err
  }
}

/**
 * 下载并替换本地数据
 */
async function downloadAndReplaceData() {
  try {
    const response = await fetch(DATA_URL)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()

    // 将数据写入 SQLite（通过 database.js 封装）
    const { importData } = await import('../db/database')
    await importData(data)

    console.log('数据更新成功')
  } catch (err) {
    console.error('下载数据失败:', err)
    throw err
  }
}

/**
 * 保存本地版本号
 * @param {string} version
 */
async function setLocalVersion(version) {
  localStorage.setItem('data_version', version)
  // 也更新时间戳
  localStorage.setItem('data_updated_at', new Date().toISOString())
}

/**
 * 检查是否有数据更新，有则自动下载
 * @returns {Promise<boolean>} 是否有更新
 */
export async function checkForUpdates() {
  const localVersion = await getLocalVersion()
  const remoteVersion = await fetchRemoteVersion()

  if (compareVersion(remoteVersion, localVersion) > 0) {
    await downloadAndReplaceData()
    await setLocalVersion(remoteVersion)
    return true
  }
  return false
}

/**
 * 比较两个语义化版本号
 * @param {string} v1
 * @param {string} v2
 * @returns {number} v1 > v2 返回 1, 相等返回 0, v1 < v2 返回 -1
 */
function compareVersion(v1, v2) {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0
    const b = parts2[i] || 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

/**
 * 获取最后更新时间
 * @returns {string}
 */
export function getLastUpdateTime() {
  return localStorage.getItem('data_updated_at') || ''
}
