// The parts of a parsed URL that decide whether a page gets a permission. A
// WHATWG URL object fits this shape.
export interface PermissionOrigin {
  protocol: string
  hostname: string
}

// What YouTube Music needs: fullscreen for the video player and writing to
// the clipboard for "Copy link". Electron grants everything by default, so
// the rest (microphone, notifications, location...) is denied.
const ALLOWED_PERMISSIONS = new Set(['fullscreen', 'clipboard-sanitized-write'])

export function isPermissionAllowed(permission: string, origin: PermissionOrigin): boolean {
  if (origin.protocol !== 'https:' || origin.hostname !== 'music.youtube.com') return false
  return ALLOWED_PERMISSIONS.has(permission)
}
