// @flow

import { dispatchEvent, fileSizeSI } from './helpers'
import { endUI, errorUI, initializeUI, progressUI } from './default_ui'
import { DirectUpload } from 'activestorage'
const eventFamily = 'dnd-upload'

export class DragAndDropUploadController {
  input: HTMLInputElement;
  form: HTMLFormElement;
  url: string;
  iconContainer: HTMLElement;
  file: File;
  upload: DirectUpload;

  constructor (input: HTMLInputElement, file: File) {
    validate(input, file)
    const form = input.closest('form')
    const iconContainer = document.getElementById(input.dataset.iconContainerId)
    if (!(form instanceof HTMLFormElement && iconContainer)) return

    this.input = input
    this.form = form
    this.url = this.input.dataset.directUploadUrl
    this.iconContainer = iconContainer
    this.file = file
    this.upload = new DirectUpload(this.file, this.url, this)
    const event = this.dispatch('initialize')
    initializeUI(event)
  }

  start (callback: Function) {
    this.dispatch('start')
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
        hiddenField.setAttribute('name', this.input.getAttribute('name') || '')
        hiddenField.setAttribute('data-direct-upload-id', this.upload.id)
        this.form.appendChild(hiddenField)
        const event = this.dispatch('end')
        endUI(event)
        callback(error)
      }
    })
  }

  dispatch (name: string,
    detail: { file?: File, id?: number, iconContainer?: Element, error?: Error } = {}) {
    detail.file = this.file
    detail.id = this.upload.id
    detail.iconContainer = this.iconContainer
    return dispatchEvent(this.input, `${eventFamily}:${name}`, { detail })
  }

  dispatchError (error: Error) {
    const event = this.dispatch('error', { error })
    errorUI(event)
  }

  directUploadWillCreateBlobWithXHR (xhr: XMLHttpRequest) {
    this.dispatch('before-blob-request', { xhr })
  }

  directUploadWillStoreFileWithXHR (xhr: XMLHttpRequest) {
    this.dispatch('before-storage-request', { xhr })
    xhr.upload.addEventListener('progress', (event: Event) => this.uploadRequestDidProgress(event))
  }

  uploadRequestDidProgress (uploadEvent: Event) {
    // $FlowFixMe
    const progress = uploadEvent.loaded / uploadEvent.total * 100
    if (!progress) return

    const event = this.dispatch('progress', { progress })
    progressUI(event)
  }
}

class ValidationError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, ValidationError)
  }
}

function validate (input, file) {
  const sizeLimit = parseInt(input.getAttribute('size_limit'))
  const accept = input.getAttribute('accept')
  if (accept && !accept.split(', ').includes(file.type))
    throw new ValidationError('Invalid filetype')
  else if (sizeLimit && file.size > sizeLimit)
    throw new ValidationError(`File too large. Can be no larger than ${fileSizeSI(sizeLimit)}`)
}
