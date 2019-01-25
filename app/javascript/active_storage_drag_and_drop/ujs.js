import { UploadQueueProcessor, uploaders, createUploader } from './upload_queue_processor'
import * as helpers from './helpers'

let started = false
let formSubmitted = false

function didSubmitForm (event) {
  handleFormSubmissionEvent(event)
}

function didSubmitRemoteElement (event) {
  if (event.target.tagName === 'FORM') {
    handleFormSubmissionEvent(event)
  }
}

function processUploadQueue (event) {
  const form = event.target
  const { callback } = event.detail
  const nextUpload = new UploadQueueProcessor(form)
  if (nextUpload.current_uploaders.length > 0) {
    nextUpload.start(error => {
      if (error) {
        callback(error)
      } else {
        callback()
      }
    })
  } else {
    callback()
  }
}

function handleFormSubmissionEvent (event) {
  if (formSubmitted) { return }
  formSubmitted = true
  const form = event.target
  const nextUpload = new UploadQueueProcessor(form)
  // if the upload processor has no dnd file inputs, then we let the event happen naturally
  // if it DOES have dnd file inputs, then we have to process our queue first and then submit the form
  if (nextUpload.current_uploaders.length > 0) {
    // inputs.forEach(disable)
    event.preventDefault()
    nextUpload.start(error => {
      if (error) {
        // inputs.forEach(enable)
      } else {
        form.submit()
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
      }
    })
  }
}

function addAttachedFileIcons () {
  document.querySelectorAll("input[type='hidden'][data-direct-upload-id][data-uploaded-file-name]").forEach(uploadedFile => {
    const dataset = uploadedFile.dataset
    let iconContainer = document.getElementById(dataset.iconContainerId)
    let detail = {
      id: dataset.directUploadId,
      fileName: dataset.uploadedFileName,
      iconContainer: iconContainer
    }
    let event = helpers.dispatchEvent(uploadedFile, 'dnd-upload:placeholder', { detail })
    if (!event.defaultPrevented) {
      const { detail } = event
      const { id, fileName, iconContainer } = detail
      helpers.fileUploadUIPainter(iconContainer, id, fileName, true)
    }
  })
}

export function start () {
  if (started) { return }
  started = true
  document.addEventListener('submit', didSubmitForm)
  document.addEventListener('ajax:before', didSubmitRemoteElement)
  document.addEventListener('dnd-uploads:process-upload-queue', processUploadQueue)

  // input[type=file][data-dnd=true]
  document.addEventListener('change', event => {
    if (event.target.type === 'file' && event.target.dataset.dnd === 'true') {
      const input = event.target
      Array.from(input.files).forEach(file => createUploader(input, file))
      input.value = null
    }
  })
  document.addEventListener('dragover', event => {
    if (helpers.hasClassnameInHeirarchy(event.target, 'asdndzone')) {
      event.preventDefault()
    }
  })
  document.addEventListener('drop', event => {
    let asdndz = helpers.getClassnameFromHeirarchy(event.target, 'asdndzone')
    if (asdndz) {
      event.preventDefault()
      // get the input associated with this dndz
      const input = document.getElementById(asdndz.dataset.dndInputId)
      Array.from(event.dataTransfer.files).forEach(file => createUploader(input, file))
    }
  })
  document.addEventListener('click', event => {
    if (event.target.dataset.dndDelete === 'true' && event.target.hasAttribute('data-direct-upload-id')) {
      event.preventDefault()
      document.querySelectorAll('[data-direct-upload-id="' + event.target.dataset.directUploadId + '"]').forEach(element => {
        element.remove()
      })
      for (var i = 0; i < uploaders.length; i++) {
        if (uploaders[i].upload.id === event.target.dataset.directUploadId) {
          uploaders.splice(i, 1)
          break
        }
      }
    }
  })
  addAttachedFileIcons()
}
