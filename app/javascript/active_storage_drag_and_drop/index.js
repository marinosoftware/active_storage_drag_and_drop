// @flow

import { start } from './ujs'

export { start }

function autostart () {
  start()
}

setTimeout(autostart, 1)
