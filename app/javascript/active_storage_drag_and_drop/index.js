// @flow

import { start, processUploadQueue } from './ujs'
import { paintUploadIcon } from './default_ui'

export { start, paintUploadIcon, processUploadQueue }

function autostart () {
  start()
}

setTimeout(autostart, 1)
