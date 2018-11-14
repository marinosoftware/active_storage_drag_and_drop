import { dispatchEvent } from './helpers'
import { DirectUpload } from 'activestorage'
const eventFamily = 'dnd-upload'

export class DragAndDropUploadController {
  constructor(input, file) {
    this.input = input
    this.form = input.closest('form')
    this.url = this.input.dataset.directUploadUrl
    this.iconContainer = document.getElementById(this.input.dataset.iconContainerId)
    this.file = file
    this.upload = new DirectUpload(this.file, this.url, this)
    this.dispatch("initialize")
  }

  start(callback) {
    this.upload.create((error, blob) => {
      if (error) {
        // Handle the error
        this.dispatchError(error)
        callback(error)
      } else {
//      // Add an appropriately-named hidden input to the form with a
//      //  value of blob.signed_id so that the blob ids will be
//      //  transmitted in the normal upload flow
        const hiddenField = document.createElement('input')
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("value", blob.signed_id);
        hiddenField.name = this.input.name
        hiddenField.setAttribute('data-direct-upload-id', this.upload.id)
        this.form.appendChild(hiddenField)
        this.dispatch("end")
        callback(error)
      }
    })
  }

  dispatch(name, detail = {}) {
    detail.file = this.file
    detail.id = this.upload.id
    detail.iconContainer = this.iconContainer
    return dispatchEvent(this.input, `${eventFamily}:${name}`, { detail })
  }

  dispatchError(error) {
    const event = this.dispatch("error", { error })
    if (!event.defaultPrevented) {
      alert(error)
    }
  }

  directUploadWillCreateBlobWithXHR(xhr) {
    this.dispatch("before-blob-request", { xhr })
  }
  // directUploadWillStoreFileWithXHR
  directUploadWillStoreFileWithXHR(xhr) {
    this.dispatch("before-storage-request", { xhr })
    xhr.upload.addEventListener("progress", event => this.uploadRequestDidProgress(event))
  }

  uploadRequestDidProgress(event) {
    const progress = event.loaded / event.total * 100
    if (progress) {
      this.dispatch("progress", { progress })
    }
  }

}
