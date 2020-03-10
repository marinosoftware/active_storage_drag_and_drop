// @flow

import { start, processUploadQueue } from './ujs'
import { paintDefaultUploadIcon as paintUploadIcon } from './default_ui'

export default { start, paintUploadIcon, processUploadQueue }

function autostart () {
  start({})
}

setTimeout(autostart, 1)
