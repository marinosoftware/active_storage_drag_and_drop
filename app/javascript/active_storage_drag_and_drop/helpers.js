// @flow

export function dispatchEvent (element: Element, type: string,
  eventInit: { bubbles?: boolean, cancelable?: boolean, detail: {} } = {}) {
  const { bubbles, cancelable, detail } = eventInit
  const event = document.createEvent('CustomEvent')
  event.initCustomEvent(type, bubbles || true, cancelable || true, detail || {})
  element.dispatchEvent(event)
  return event
}

export function defaultErrorEventUI (event: CustomEvent) {
  const { id, error } = event.detail
  if (!id || event.defaultPrevented) return

  const element = document.getElementById(`direct-upload-${id}`)
  if (!element) return

  element.setAttribute('title', error)
  element.classList.add('direct-upload--error')
}

export function defaultEndEventUI (event: CustomEvent) {
  const { id } = event.detail
  if (!id || event.defaultPrevented) return

  const element = document.getElementById(`direct-upload-${id}`)
  if (!element) return

  const classes = element.classList
  classes.remove('direct-upload--pending')
  classes.add('direct-upload--complete')
}

export function hasClassnameInHeirarchy (element: Element, classname: string) {
  if (element.classList.contains(classname)) return true
  else {
    const parent = element.parentElement
    if (parent) { return hasClassnameInHeirarchy(parent, classname) }
  }
}

export function getClassnameFromHeirarchy (element: Element, classname: string) {
  if (element.classList.contains(classname)) return element
  else {
    const parent = element.parentElement
    if (parent) { return getClassnameFromHeirarchy(parent, classname) }
  }
}

export function fileUploadUIPainter (iconContainer: Element, id: string | number, file: File, complete: boolean) {
  // the only rule here is that all root level elements must have the data: { direct_upload_id: [id] } attribute ala: 'data-direct-upload-id="${id}"'
  const cname = (complete ? 'complete' : 'pending')
  const progress = (complete ? 100 : 0)
  iconContainer.insertAdjacentHTML('beforeend', `
  <div data-direct-upload-id="${id}">
    <div id="direct-upload-${id}" class="direct-upload direct-upload--${cname}" data-direct-upload-id="${id}">
      <div id="direct-upload-progress-${id}" class="direct-upload__progress" style="width: ${progress}%"></div>
      <span class="direct-upload__filename">${file.name}</span>
      <span class="direct-upload__filesize">${fileSizeSI(file.size)}</span>
    </div>
    <a href='remove' class='direct-upload__remove' data-dnd-delete='true' data-direct-upload-id="${id}">X</a>
  </div>
  `)
}

export function fileSizeSI (bytes: number) {
  let e = Math.log(bytes) / Math.log(1000) | 0
  const size = (bytes / Math.pow(1000, e) + 0.5) | 0
  return size + (e ? 'kMGTPEZY'[--e] + 'B' : ' Bytes')
}
