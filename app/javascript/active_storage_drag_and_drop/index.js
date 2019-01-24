import { start } from './ujs'

export { start }

function autostart () {
  start()
}

setTimeout(autostart, 1)

// ----------------------------------------------------------------------------------------------------
// UI Events - this code is completely outside the draganddrop lib - it's just reacting to events
// ----------------------------------------------------------------------------------------------------
var fileUploadUIPainter = function (iconContainer, id, filename, complete) {
  // the only rule here is that all root level elements must have the data: { direct_upload_id: [id] } attribute ala: 'data-direct-upload-id="${id}"'
  var cname = (complete ? 'complete' : 'pending')
  var progress = (complete ? 100 : 0)
  iconContainer.insertAdjacentHTML('beforeend', `
    <div id="direct-upload-${id}" class="direct-upload direct-upload--${cname}" data-direct-upload-id="${id}">
      <div id="direct-upload-progress-${id}" class="direct-upload__progress" style="width: ${progress}%"></div>
      <span class="direct-upload__filename">${filename}</span>
    </div>
    <a href='remove' class='direct-upload__remove' data-dnd-delete='true' data-direct-upload-id="${id}">x</a>
  `)
}

document.addEventListener('dnd-upload:initialize', event => {
  if (!event.defaultPrevented) {
    const { detail } = event
    const { id, file, iconContainer } = detail
    fileUploadUIPainter(iconContainer, id, file.name, false)
  }
})

document.addEventListener('dnd-upload:placeholder', event => {
  if (!event.defaultPrevented) {
    const { detail } = event
    const { id, fileName, iconContainer } = detail
    fileUploadUIPainter(iconContainer, id, fileName, true)
  }
})

document.addEventListener('dnd-upload:start', event => {
  if (!event.defaultPrevented) {
    const { id } = event.detail
    const element = document.getElementById(`direct-upload-${id}`)
    element.classList.remove('direct-upload--pending')
  }
})

document.addEventListener('dnd-upload:progress', event => {
  if (!event.defaultPrevented) {
    const { id, progress } = event.detail
    const progressElement = document.getElementById(`direct-upload-progress-${id}`)
    progressElement.style.width = `${progress}%`
  }
})

document.addEventListener('dnd-upload:error', event => {
  if (!event.defaultPrevented) {
    event.preventDefault()
    const { id, error } = event.detail
    const element = document.getElementById(`direct-upload-${id}`)
    element.classList.add('direct-upload--error')
    element.setAttribute('title', error)
  }
})

document.addEventListener('dnd-upload:end', event => {
  if (!event.defaultPrevented) {
    const { id } = event.detail
    const element = document.getElementById(`direct-upload-${id}`)
    element.classList.remove('direct-upload--pending')
    element.classList.add('direct-upload--complete')
  }
})
