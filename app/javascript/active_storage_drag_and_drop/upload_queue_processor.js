import { dispatchEvent } from "./helpers"
import { DragAndDropUploadController } from "./direct_upload_controller"
export const uploaders = []

const eventFamily = 'dnd-uploads'

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
    return dispatchEvent(this.form, `${eventFamily}:${name}`, { detail })
  }
}

export function createUploader(input, file) {
  // your form needs the file_field direct_upload: true, which
  //  provides data-direct-upload-url
  uploaders.push( new DragAndDropUploadController(input, file) )
}
