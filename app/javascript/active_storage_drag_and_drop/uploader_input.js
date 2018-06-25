import { dispatchEvent } from './helpers'
import { uploaders, createUploader } from "./direct_upload_controller"
const eventFamily = 'dnd-upload'

export class UploaderInput {
  constructor(input) {
    this.input = input
    this.start(input)
  }

  start(input) {
    console.log('Binding input:change to createUploader')
    const form = input.closest('form')
    const dropZoneId = input.dataset.dndZoneId
    const dropZone = document.getElementById(dropZoneId)
    const iconContainerId = input.dataset.iconContainerId
    const iconContainer = document.getElementById(input.dataset.iconContainerId)

    // bind Change events on original file input
    input.addEventListener('change', (event) => {
      console.log('input:change')
      Array.from(input.files).forEach(file => createUploader(input, file))
      input.value = null
    })

    // bind DND events to onDrop
    dropZone.addEventListener('dragover', function(e){e.preventDefault()})
    dropZone.addEventListener('drop', function(e){
      e.preventDefault()
      const files = e.dataTransfer.files
      Array.from(files).forEach(file => createUploader(input, file))
    })

    // add delete-file support for all data-dnd-delete elements in our dropZone
    // add 'click here to upload' support for all inputs/dnd-zone groupings
    const clickable_input = input
    dropZone.addEventListener('click', event => {
      var target = event.target;
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
    })

    // Handle pre-existing uploaded files with the same input name
    form.querySelectorAll("input[name='" + input.name + "'][type='hidden'][data-direct-upload-id][data-uploaded-file-name]").forEach( uploadedFile => {
      const dataset = uploadedFile.dataset
      let detail = {
        id: dataset.directUploadId,
        fileName: dataset.uploadedFileName,
        iconContainer: iconContainer
      }
      dispatchEvent(uploadedFile, `${eventFamily}:placeholder`, { detail })
    })

  }
}
