
export function dispatchEvent (element, type, eventInit = {}) {
  const { bubbles, cancelable, detail } = eventInit
  const event = document.createEvent('Event')
  event.initEvent(type, bubbles || true, cancelable || true)
  event.detail = detail || {}
  element.dispatchEvent(event)
  return event
}

export function hasClassnameInHeirarchy (element, classname) {
  if (element && element.classList) {
    if (element.classList.contains(classname)) {
      return true
    } else {
      return hasClassnameInHeirarchy(element.parentNode, classname)
    }
  } else {
    return false
  }
}

export function getClassnameFromHeirarchy (element, classname) {
  if (element && element.classList) {
    if (element.classList.contains(classname)) {
      return element
    } else {
      return getClassnameFromHeirarchy(element.parentNode, classname)
    }
  } else {
    return null
  }
}
