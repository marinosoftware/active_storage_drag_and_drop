import { dispatchEvent } from "./helpers"
import { DragAndDropUploadController } from "./direct_upload_controller"
export const uploaders = []

class ValidationError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, ValidationError)
  }
}

export class UploadQueueProcessor {
  constructor(form) {
    this.form = form
    this.current_uploaders = []
    uploaders.forEach(uploader => {
      if( form == uploader.form ) {
        this.current_uploaders.push(uploader)
      }
    })
  }

  start(callback) {
    const startNextUploader = () => {
      const nextUploader = this.current_uploaders.shift()
      if (nextUploader) {
        nextUploader.start(error => {
          if (error) {
            callback(error)
            this.dispatch("end")
          } else {
            startNextUploader()
          }
        })
      } else {
        callback()
        this.dispatch("end")
      }
    }

    this.dispatch("start")
    startNextUploader()
  }

  dispatch(name, detail = {}) {
    return dispatchEvent(this.form, `dnd-uploads:${name}`, { detail })
  }
}

export function createUploader(input, file) {
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
    const event = dispatchEvent(input, `$dnd-upload:error`, { detail })
    if (!event.defaultPrevented) {
      alert(error)
    }
    return event
  }
  uploaders.push(new DragAndDropUploadController(input, file))
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
