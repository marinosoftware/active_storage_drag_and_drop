// @flow

import { fileSizeSI } from './helpers'

export function errorUI (event: CustomEvent) {
  let { id } = event.detail
  const { error, iconContainer, file } = event.detail
  if (event.defaultPrevented) return

  if (!id) {
    id = 'error'
    window.ActiveStorageDragAndDrop.paintUploadIcon(iconContainer, id, file, false)
  }
  const element = document.getElementById(`direct-upload-${id}`)
  if (!element) return

  element.setAttribute('title', error)
  element.classList.add('direct-upload--error')
}

export function endUI (event: CustomEvent) {
  const { id } = event.detail
  if (!id || event.defaultPrevented) return

  const element = document.getElementById(`direct-upload-${id}`)
  if (!element) return

  const classes = element.classList
  classes.remove('direct-upload--pending')
  classes.add('direct-upload--complete')
}

export function initializeUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id, file, iconContainer } = event.detail
  window.ActiveStorageDragAndDrop.paintUploadIcon(iconContainer, id, file, false)
}

export function progressUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id, progress } = event.detail
  const progressElement = document.getElementById(`direct-upload-progress-${id}`)
  if (progressElement) progressElement.style.width = `${progress}%`
}

export function placeholderUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id, file, iconContainer } = event.detail
  window.ActiveStorageDragAndDrop.paintUploadIcon(iconContainer, id, file, true)
}

export function paintUploadIcon (iconContainer: HTMLElement, id: string | number, file: File, complete: boolean) {
  // the only rule here is that all root level elements must have the data: { direct_upload_id: [id] } attribute ala: 'data-direct-upload-id="${id}"'
  const uploadStatus = (complete ? 'complete' : 'pending')
  const progress = (complete ? 100 : 0)
  iconContainer.insertAdjacentHTML('beforeend', `
  <div data-direct-upload-id="${id}">
    <div id="direct-upload-${id}" class="direct-upload direct-upload--${uploadStatus}" data-direct-upload-id="${id}">
      <div id="direct-upload-progress-${id}" class="direct-upload__progress" style="width: ${progress}%"></div>
      <span class="direct-upload__filename">${file.name}</span>
      <span class="direct-upload__filesize">${fileSizeSI(file.size)}</span>
    </div>
    <a href='remove' class='direct-upload__remove' data-dnd-delete='true' data-direct-upload-id="${id}">X</a>
  </div>
  `)
}
