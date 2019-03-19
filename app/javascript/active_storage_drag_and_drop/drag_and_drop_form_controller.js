// @flow

import { dispatchEvent } from './helpers'
import { endUI, errorUI } from './default_ui'
import { DragAndDropUploadController } from './drag_and_drop_upload_controller'

export class DragAndDropFormController {
  form: HTMLFormElement;
  uploadControllers: Array<DragAndDropUploadController>;

  constructor (form: HTMLFormElement) {
    this.form = form
    this.uploadControllers = []
  }

  start (callback: Function) {
    const startUploadControllers = () => {
      const nextUploadController = this.uploadControllers.shift()
      if (nextUploadController) {
        nextUploadController.start(error => {
          if (error) {
            this.dispatchError(error)
            callback(error)
          } else { startUploadControllers() }
        })
      } else {
        callback()
        const event = this.dispatch('end')
        endUI(event)
      }
    }
    this.dispatch('start')
    startUploadControllers()
  }

  dispatch (name: string, detail: {} = {}) {
    return dispatchEvent(this.form, `dnd-uploads:${name}`, { detail })
  }

  dispatchError (error: Error) {
    const event = this.dispatch('error', { error })
    errorUI(event)
  }

  queueUpload (input: HTMLInputElement, file: File) {
    if (!input.getAttribute('multiple')) this.unqueueUploadsPerInput(input)
    try {
      this.uploadControllers.push(new DragAndDropUploadController(input, file))
    } catch (error) {
      const detail = {
        id: null,
        file: file,
        error: error,
        iconContainer: document.getElementById(input.dataset.iconContainerId)
      }
      dispatchErrorWithoutAttachment(input, detail)
    }
  }

  unqueueUploadsPerInput (input: HTMLInputElement) {
    const zone = input.closest('label.asdndzone')
    if (!zone) return

    zone.querySelectorAll('[data-direct-upload-id]').forEach(element => { element.remove() })
    this.uploadControllers.splice(0, this.uploadControllers.length)
  }

  unqueueUpload (id: string | number) {
    const index = this.uploadControllers.findIndex(uploader => { return uploader.upload.id === id })
    this.uploadControllers.splice(index, 1)
    // TODO: add an event to allow custom UI here
    document.querySelectorAll(`[data-direct-upload-id="${id}"]`).forEach(element => {
      element.remove()
    })
  }
}

function dispatchErrorWithoutAttachment (input, detail) {
  const event = dispatchEvent(input, 'dnd-upload:error', { detail })
  errorUI(event)
}
