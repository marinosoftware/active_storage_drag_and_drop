// @flow

export function errorUI (event: CustomEvent) {
  const { id, error } = event.detail
  if (!id || event.defaultPrevented) return

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
