export function dispatchEvent (element, type, eventInit = {}) {
  const { bubbles, cancelable, detail } = eventInit
  const event = document.createEvent('Event')
  event.initEvent(type, bubbles || true, cancelable || true)
  event.detail = detail || {}
  element.dispatchEvent(event)
  return event
}

export function defaultErrorEventUI (event) {
  if (!event.defaultPrevented) {
    const { id, error } = event.detail
    if (typeof id !== 'undefined') {
      const element = document.getElementById(`direct-upload-${id}`)
      element.setAttribute('title', error).classList.add('direct-upload--error')
    }
  }
}

export function defaultEndEventUI (event) {
  if (!event.defaultPrevented) {
    const { id } = event.detail
    if (typeof id !== 'undefined') {
      const classes = document.getElementById(`direct-upload-${id}`).classList
      classes.remove('direct-upload--pending')
      classes.add('direct-upload--complete')
    }
  }
}

export function hasClassnameInHeirarchy (element, classname) {
  if (element && element.classList) {
    if (element.classList.contains(classname)) {
      return true
    } else {
      return hasClassnameInHeirarchy(element.parentNode, classname)
    }
  }
}

export function getClassnameFromHeirarchy (element, classname) {
  if (element && element.classList) {
    if (element.classList.contains(classname)) {
      return element
    } else {
      return getClassnameFromHeirarchy(element.parentNode, classname)
    }
  }
}

export function fileUploadUIPainter (iconContainer, id, file, complete) {
  // the only rule here is that all root level elements must have the data: { direct_upload_id: [id] } attribute ala: 'data-direct-upload-id="${id}"'
  var cname = (complete ? 'complete' : 'pending')
  var progress = (complete ? 100 : 0)
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

function fileSizeSI (bytes) {
  var e = Math.log(bytes) / Math.log(1000) | 0
  var size = (bytes / Math.pow(1000, e) + 0.5) | 0
  return size + (e ? 'kMGTPEZY'[--e] + 'B' : ' Bytes')
}
