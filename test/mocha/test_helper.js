import { paintUploadIcon } from '../../app/javascript/active_storage_drag_and_drop/default_ui.js'

before(() => {
  window.ActiveStorageDragAndDrop = { paintUploadIcon }
})

afterEach(() => {
  document.body.innerHTML = ''
})
