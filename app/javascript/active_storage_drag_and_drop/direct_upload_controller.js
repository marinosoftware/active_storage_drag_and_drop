import { dispatchEvent, defaultErrorEventUI, defaultEndEventUI, fileUploadUIPainter } from './helpers'
import { DirectUpload } from 'activestorage'
const eventFamily = 'dnd-upload'

export class DragAndDropUploadController {
  constructor (input, file) {
    this.input = input
    this.form = input.closest('form')
    this.url = this.input.dataset.directUploadUrl
    this.iconContainer = document.getElementById(this.input.dataset.iconContainerId)
    this.file = file
    this.upload = new DirectUpload(this.file, this.url, this)
    let event = this.dispatch('initialize')
    if (!event.defaultPrevented) {
      const { detail } = event
      const { id, file, iconContainer } = detail
      fileUploadUIPainter(iconContainer, id, file, false)
    }
  }

  start (callback) {
    this.upload.create((error, blob) => {
      if (error) {
        // Handle the error
        this.dispatchError(error)
        callback(error)
      } else {
        // Add an appropriately-named hidden input to the form with a
        // value of blob.signed_id so that the blob ids will be
        // transmitted in the normal upload flow
        const hiddenField = document.createElement('input')
        hiddenField.setAttribute('type', 'hidden')
        hiddenField.setAttribute('value', blob.signed_id)
        hiddenField.name = this.input.name
        hiddenField.setAttribute('data-direct-upload-id', this.upload.id)
        this.form.appendChild(hiddenField)
        let event = this.dispatch('end')
        defaultEndEventUI(event)
        callback(error)
      }
    })
  }

  dispatch (name, detail = {}) {
    detail.file = this.file
    detail.id = this.upload.id
    detail.iconContainer = this.iconContainer
    return dispatchEvent(this.input, `${eventFamily}:${name}`, { detail })
  }

  dispatchError (error) {
    const event = this.dispatch('error', { error })
    defaultErrorEventUI(event)
  }

  directUploadWillCreateBlobWithXHR (xhr) {
    this.dispatch('before-blob-request', { xhr })
  }
  // directUploadWillStoreFileWithXHR
  directUploadWillStoreFileWithXHR (xhr) {
    this.dispatch('before-storage-request', { xhr })
    xhr.upload.addEventListener('progress', event => this.uploadRequestDidProgress(event))
  }

  uploadRequestDidProgress (event) {
    const progress = event.loaded / event.total * 100
    if (progress) {
      let event = this.dispatch('progress', { progress })
      if (!event.defaultPrevented) {
        const { id, progress } = event.detail
        const progressElement = document.getElementById(`direct-upload-progress-${id}`)
        progressElement.style.width = `${progress}%`
      }
    }
  }
}
