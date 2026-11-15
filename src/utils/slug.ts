/**
 * slug 统一规范化。
 *
 * 后台允许输入大写字母，但 URL 始终使用小写：
 * - 避免 /ABC 和 /abc 变成两个地址
 * - 避免 Windows / macOS 上大小写不敏感导致文件互相覆盖
 */
export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+|\/+$/g, '')
}

export const SLUG_PATTERN =
  /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*(?:\/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)*$/
