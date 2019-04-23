// @flow

import { DragAndDropFormController } from './drag_and_drop_form_controller'
import { placeholderUI } from './default_ui'
import { dispatchEvent } from './helpers'

let started = false
export let formSubmitted = false // eslint-disable-line prefer-const
const formControllers = new Map()

export function handleProcessUploadQueueEvent (event: Event) {
  console.warn('WARNING! The processs-upload-queue event is deprecated. Call window.ActiveStorageDragAndDrop.processUploadQueue(form, callback) instead.')
  // $FlowFixMe
  const callback = event.detail.callback
  processUploadQueue(event.target, callback)
}

export function processUploadQueue (form: any, callback: (error: Error | null) => void) {
  const formController = findOrInitializeFormController(form)
  formController.start(error => { callback(error) })
}

export function addAttachedFileIcons () {
  document.querySelectorAll("input[type='hidden'][data-direct-upload-id][data-uploaded-file]").forEach(uploadedFile => {
    const dataset = uploadedFile.dataset
    const detail = {
      id: dataset.directUploadId,
      file: JSON.parse(dataset.uploadedFile),
      iconContainer: document.getElementById(dataset.iconContainerId)
    }
    const event = dispatchEvent(uploadedFile, 'dnd-upload:placeholder', { detail })
    placeholderUI(event)
  })
}

export function preventDragover (event: DragEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('.asdndzone')) event.preventDefault()
}

export function handleSubmit (event: Event) {
  if (this.formSubmitted) return

  this.formSubmitted = true
  const formController = findOrInitializeFormController(event.target)
  if (formController.uploadControllers.length === 0) return

  event.preventDefault()
  formController.start(error => {
    if (!error) formController.form.submit()
  })
}

export function removeFileFromQueue (event: Event) {
  const target = event.target
  if (!(target instanceof HTMLElement && target.classList.contains('direct-upload__remove'))) return

  const wrapper = target.closest('[data-direct-upload-id]')
  if (!(wrapper instanceof HTMLElement)) throw new Error('Cannot remove queued upload because there is no enclosing element with a data-direct-upload-id attribute.')

  event.preventDefault()
  const formController = findOrInitializeFormController(target.closest('form'))
  formController.unqueueUpload(parseInt(wrapper.dataset.directUploadId))
}

export function queueUploadsForFileInput (event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.dataset.dnd !== 'true') return

  const formController = findOrInitializeFormController(input.form)
  Array.from(input.files).forEach(file => formController.queueUpload(input, file))
  input.setAttribute('value', '')
}

export function queueUploadsForDroppedFiles (event: DragEvent) {
  const { target, dataTransfer } = event
  if (!(target instanceof Element && dataTransfer instanceof DataTransfer)) return

  const asdndz = target.closest('.asdndzone')
  if (!(asdndz instanceof HTMLElement)) return

  // get the input associated with this dndz
  const input = document.getElementById(asdndz.dataset.dndInputId)
  if (!(input instanceof HTMLInputElement)) throw new Error('There is no file input element with the dnd-input-id specified on the drop zone.')

  event.preventDefault()
  const formController = findOrInitializeFormController(input.form)
  Array.from(dataTransfer.files).forEach(file => formController.queueUpload(input, file))
}

export function start () {
  if (started) return

  started = true
  document.addEventListener('change', queueUploadsForFileInput)
  document.addEventListener('click', removeFileFromQueue)
  document.addEventListener('drop', queueUploadsForDroppedFiles, true)
  document.addEventListener('submit', handleSubmit)
  document.addEventListener('dnd-uploads:process-upload-queue', handleProcessUploadQueueEvent)
  document.addEventListener('ajax:before', handleSubmit)
  document.addEventListener('dragover', preventDragover)
  addAttachedFileIcons()
}

export function findOrInitializeFormController (form: any) {
  let formController = formControllers.get(form)
  if (formController) return formController

  if (!(form instanceof HTMLFormElement)) throw new Error('Can only initialize form controller with a form element.')

  formController = new DragAndDropFormController(form)
  formControllers.set(form, formController)
  return formController
}
