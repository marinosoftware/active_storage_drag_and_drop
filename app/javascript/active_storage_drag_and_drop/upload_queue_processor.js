import { dispatchEvent, defaultErrorEventUI, defaultEndEventUI, fileUploadUIPainter } from './helpers'
import { DragAndDropUploadController } from './direct_upload_controller'
export const uploaders = []

class ValidationError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, ValidationError)
  }
}

export class UploadQueueProcessor {
  constructor (form) {
    this.form = form
    this.current_uploaders = []
    uploaders.forEach(uploader => {
      if (form === uploader.form) {
        this.current_uploaders.push(uploader)
      }
    })
  }

  start (callback) {
    const startNextUploader = () => {
      const nextUploader = this.current_uploaders.shift()
      if (nextUploader) {
        nextUploader.start(error => {
          if (error) {
            this.dispatchError(error)
            callback(error)
          } else {
            startNextUploader()
          }
        })
      } else {
        callback()
        let event = this.dispatch('end')
        defaultEndEventUI(event)
      }
    }

    this.dispatch('start')
    startNextUploader()
  }

  dispatch (name, detail = {}) {
    return dispatchEvent(this.form, `dnd-uploads:${name}`, { detail })
  }

  dispatchError (error) {
    const event = this.dispatch('error', { error })
    defaultErrorEventUI(event)
  }
}

export function createUploader (input, file) {
  // your form needs the file_field direct_upload: true, which
  //  provides data-direct-upload-url
  const error = validateUploader(input, file)
  if (error) {
    let detail = {
      id: null,
      file: file,
      iconContainer: input.dataset.iconContainerId,
      error: error
    }
    return dispatchErrorWithoutAttachment(input, detail)
  }
  if (!input.multiple) { removeAttachedFiles(input) }
  uploaders.push(new DragAndDropUploadController(input, file))
}

function removeAttachedFiles (input) {
  input.closest('label.asdndzone').querySelectorAll('[data-direct-upload-id]').forEach(element => {
    element.remove()
  })
  uploaders.splice(0, uploaders.length)
}

function dispatchErrorWithoutAttachment (input, detail) {
  let event = dispatchEvent(input, 'dnd-upload:error', { detail })
  if (!event.defaultPrevented) {
    const { error, iconContainer, file } = event.detail
    fileUploadUIPainter(iconContainer, 'error', file.name, true)
    const element = document.getElementById(`direct-upload-error`)
    element.classList.add('direct-upload--error')
    element.setAttribute('title', error)
  }
  return event
}

function validateUploader (input, file) {
  const sizeLimit = input.getAttribute('size_limit')
  if (input.accept !== '' && !input.accept.split(', ').includes(file.type)) {
    return new ValidationError('Invalid filetype')
  } else if (sizeLimit && file.size > sizeLimit) {
    return new ValidationError(`File too large. Can be no larger than ${humanFileSize(sizeLimit)}`)
  }
}

function humanFileSize (bytes) {
  var thresh = 1000
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }
  var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  return bytes.toFixed(1) + ' ' + units[u]
}
