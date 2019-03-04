// @flow

import { DragAndDropUploadsController, uploaders, createUploader } from './drag_and_drop_uploads_controller'
import { placeholderUI } from './default_ui'
import * as helpers from './helpers'

let started = false
let formSubmitted = false

function didSubmitForm (event) {
  handleFormSubmissionEvent(event)
}

function didSubmitRemoteElement (event: Event) {
  if (event.target instanceof Element && event.target.tagName === 'FORM') handleFormSubmissionEvent(event)
}

function processUploadQueue (event: Event) {
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return

  // $FlowFixMe
  const { callback } = event.detail
  const uploadsController = new DragAndDropUploadsController(form)

  if (uploadsController.currentUploaders.length > 0) {
    uploadsController.start(error => {
      if (error) {
        callback(error)
      } else {
        callback()
      }
    })
  } else { callback() }
}

function handleFormSubmissionEvent (event) {
  if (formSubmitted) { return }

  formSubmitted = true
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return

  const uploadsController = new DragAndDropUploadsController(form)
  // if the upload processor has no dnd file inputs, then we let the event happen naturally
  // if it DOES have dnd file inputs, then we have to process our queue first and then submit the form
  if (uploadsController.currentUploaders.length === 0) return

  // inputs.forEach(disable)
  event.preventDefault()
  uploadsController.start(error => {
    if (!error) form.submit()
    // The original ActiveStorage DirectUpload system did this action using
    // input.click(), but doing that either makes the form submission event
    // happen multiple times, or the browser seems to block the input.click()
    // event completely, because it's not a trusted 'as a result of a mouse
    // click' event.
    // HOWEVER
    // form.submit() doesn't trigger to any UJS submission events. This
    // results in remote forms being submitted locally whenever there's a
    // dnd file to upload.  Instead we use Rails.fire(element, 'submit')
    // Rails.fire(form, 'submit')
  })
}

function addAttachedFileIcons () {
  document.querySelectorAll("input[type='hidden'][data-direct-upload-id][data-uploaded-file]").forEach(uploadedFile => {
    const dataset = uploadedFile.dataset
    const detail = {
      id: dataset.directUploadId,
      file: JSON.parse(dataset.uploadedFile),
      iconContainer: document.getElementById(dataset.iconContainerId)
    }
    const event = helpers.dispatchEvent(uploadedFile, 'dnd-upload:placeholder', { detail })
    placeholderUI(event)
  })
}

function createUploadersForFileInput (event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.dataset.dnd !== 'true') return

  Array.from(input.files).forEach(file => createUploader(input, file))
  input.value = ''
}

function preventDragover (event: DragEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('.asdndzone')) event.preventDefault()
}

function createUploadersForDroppedFiles (event: DragEvent) {
  const { target, dataTransfer } = event
  if (!(target instanceof Element && dataTransfer instanceof DataTransfer)) return

  const asdndz = target.closest('.asdndzone')
  if (!(asdndz instanceof HTMLElement)) return

  // get the input associated with this dndz
  const input = document.getElementById(asdndz.dataset.dndInputId)
  if (!(input instanceof HTMLInputElement)) return

  event.preventDefault()
  Array.from(dataTransfer.files).forEach(file => createUploader(input, file))
}

function removeFileFromQueue (event: Event) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  if (target.dataset.dndDelete !== 'true' || !target.hasAttribute('data-direct-upload-id')) return
  event.preventDefault()
  document.querySelectorAll('[data-direct-upload-id="' + target.dataset.directUploadId + '"]').forEach(element => {
    element.remove()
  })
  for (var i = 0; i < uploaders.length; i++) {
    if (uploaders[i].upload.id === target.dataset.directUploadId) {
      uploaders.splice(i, 1)
      break
    }
  }
}

export function start () {
  if (started) { return }
  started = true
  document.addEventListener('submit', didSubmitForm)
  document.addEventListener('ajax:before', didSubmitRemoteElement)
  document.addEventListener('dnd-uploads:process-upload-queue', processUploadQueue)

  // input[type=file][data-dnd=true]
  document.addEventListener('change', createUploadersForFileInput)
  document.addEventListener('dragover', preventDragover)
  document.addEventListener('drop', createUploadersForDroppedFiles)
  document.addEventListener('click', removeFileFromQueue)
  addAttachedFileIcons()
}
