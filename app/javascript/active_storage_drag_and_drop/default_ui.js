// @flow

import { fileSizeSI } from './helpers'
import { paintUploadIcon } from './ujs'

const windowDeprecationWarning = `
WARNING! Setting Active Storage drag and drop icon painter globally is deprecated. Pass icon \
painter as an option to the start function instead e.g:
  ActiveStorageDragAndDrop.start({
    iconPainter: paintUploadIcon
  });
`

function backwardsCompatiblePaintUploadIcon (iconContainer, id, file, complete) {
  if (window.ActiveStorageDragAndDrop && window.ActiveStorageDragAndDrop.paintUploadIcon) {
    console.warn(windowDeprecationWarning)
    window.ActiveStorageDragAndDrop.paintUploadIcon(iconContainer, id, file, complete)
  } else
    paintUploadIcon(iconContainer, id, file, complete)
}

export function errorUI (event: CustomEvent) {
  let { id } = event.detail
  const { error, iconContainer, file } = event.detail
  if (event.defaultPrevented) return

  if (!id) {
    id = 'error'
    backwardsCompatiblePaintUploadIcon(iconContainer, id, file, false)
  }
  const element = document.querySelector(`[data-direct-upload-id="${id}"] .direct-upload`)
  if (!element) return

  element.setAttribute('title', error)
  element.classList.add('direct-upload--error')
}

export function endUI (event: CustomEvent) {
  const { id } = event.detail
  if (!id || event.defaultPrevented) return

  const element = document.querySelector(`[data-direct-upload-id="${id}"] .direct-upload`)
  if (!element) return

  const classes = element.classList
  classes.remove('direct-upload--pending')
  classes.add('direct-upload--complete')
}

export function initializeUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id, file, iconContainer } = event.detail
  backwardsCompatiblePaintUploadIcon(iconContainer, id, file, false)
}

export function progressUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id, progress } = event.detail
  const progressElement = document.querySelector(`[data-direct-upload-id="${id}"] .direct-upload__progress`)
  if (progressElement) progressElement.style.width = `${progress}%`
}

export function placeholderUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id, file, iconContainer } = event.detail
  backwardsCompatiblePaintUploadIcon(iconContainer, id, file, true)
}

export function cancelUI (event: CustomEvent) {
  if (event.defaultPrevented) return

  const { id } = event.detail
  document.querySelectorAll(`[data-direct-upload-id="${id}"]`).forEach(element => {
    element.remove()
  })
}

export function paintDefaultUploadIcon (iconContainer: HTMLElement, id: string | number, file: File, complete: boolean) {
  const uploadStatus = (complete ? 'complete' : 'pending')
  const progress = (complete ? 100 : 0)
  iconContainer.insertAdjacentHTML('beforeend', `
  <div data-direct-upload-id="${id}">
    <div class="direct-upload direct-upload--${uploadStatus}">
      <div class="direct-upload__progress" style="width: ${progress}%"></div>
      <span class="direct-upload__filename">${file.name}</span>
      <span class="direct-upload__filesize">${fileSizeSI(file.size)}</span>
    </div>
    <a href='remove' class='direct-upload__remove'>X</a>
  </div>
  `)
}
