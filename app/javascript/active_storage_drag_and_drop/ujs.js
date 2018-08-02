import { UploadQueueProcessor } from "./upload_queue_processor"
import { UploaderInput } from "./uploader_input"
import { uploaders, createUploader } from "./direct_upload_controller"

let started = false
let formSubmitted = false

function didSubmitForm(event) {
  handleFormSubmissionEvent(event)
}

function didSubmitRemoteElement(event) {
  if (event.target.tagName == "FORM") {
    handleFormSubmissionEvent(event)
  }
}

function handleFormSubmissionEvent(event) {
  if(formSubmitted) { return }
  formSubmitted = true
  const form = event.target
  const next_upload = new UploadQueueProcessor(form)
  // if the upload processor has no dnd file inputs, then we let the event happen naturally
  // if it DOES have dnd file inputs, then we have to process our queue first and then submit the form
  if( next_upload.current_uploaders.length > 0) {
    event.preventDefault()
    // inputs.forEach(disable)
    next_upload.start(error => {
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

export function start() {
  if (started) { return }
  started = true
  document.addEventListener("submit", didSubmitForm)
  document.addEventListener("ajax:before", didSubmitRemoteElement)

  // input[type=file][data-dnd=true]
  document.addEventListener("change", event => {
    const input = event.target;
    if(input.type == 'file' && input.dataset.dataDnd == 'true') {
      console.log('input:change')
      Array.from(input.files).forEach(file => createUploader(input, file))
      input.value = null
    }
  })
  document.addEventListener("dragover", event => {
    const target = event.target;
    if(target.classList.contains('asdndzone')) {
      event.preventDefault();
    }
  })
  document.addEventListener("drop", event => {
    const target = event.target;
    if(target.classList.contains('asdndzone')) {
      event.preventDefault()
      // get the input associated with this dndz
      const input = document.getElementById(target.dataset.dndInputId)
      Array.from(event.dataTransfer.files).forEach(file => createUploader(input, file))
    }
  })
  document.addEventListener("click", event => {
    const target = event.target;
    if(target.classList.contains('asdndzone')) {
      if( target.dataset.dndDelete == 'true' && target.hasAttribute('data-direct-upload-id') ) {
        event.preventDefault();
        console.log("Delete Uploaded File: " + target.dataset.directUploadId)
        document.querySelectorAll('[data-direct-upload-id="'+target.dataset.directUploadId+'"]').forEach(element => {
          element.remove()
        })
        for(var i=0;i<uploaders.length;i++) {
          if(uploaders[i].upload.id == target.dataset.directUploadId) {
            uploaders.splice( i, 1 )
            break
          }
        }
      }
    }
  })
  // TODO: onload preparation of the pre-existing uploads
  // iconContainer isn't accounted for yet
  // document.querySelectorAll("input[type='hidden'][data-direct-upload-id][data-uploaded-file-name]").forEach( uploadedFile => {
  //   const dataset = uploadedFile.dataset
  //   let detail = {
  //     id: dataset.directUploadId,
  //     fileName: dataset.uploadedFileName,
  //     iconContainer: iconContainer
  //   }
  //   dispatchEvent(uploadedFile, `${eventFamily}:placeholder`, { detail })
  // })
}
