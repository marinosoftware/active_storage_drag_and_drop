// @flow

export function dispatchEvent (element: Element, type: string,
  eventInit: { bubbles?: boolean, cancelable?: boolean, detail: {} } = {}) {
  const { bubbles = true, cancelable = true, detail = {} } = eventInit
  const event = new CustomEvent(type, { bubbles, cancelable, detail })
  element.dispatchEvent(event)
  return event
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
