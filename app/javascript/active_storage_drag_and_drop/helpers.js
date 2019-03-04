// @flow

export function dispatchEvent (element: Element, type: string,
  eventInit: { bubbles?: boolean, cancelable?: boolean, detail: {} } = {}) {
  const { bubbles = true, cancelable = true, detail = {} } = eventInit
  const event = new CustomEvent(type, { bubbles, cancelable, detail })
  element.dispatchEvent(event)
  return event
}

export function fileSizeSI (bytes: number) {
  let e = Math.log(bytes) / Math.log(1000) | 0
  const size = (bytes / Math.pow(1000, e) + 0.5) | 0
  return size + (e ? 'kMGTPEZY'[--e] + 'B' : ' Bytes')
}
