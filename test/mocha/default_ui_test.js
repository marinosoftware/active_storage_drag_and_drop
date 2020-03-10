import * as defaultUI from '../../app/javascript/active_storage_drag_and_drop/default_ui.js'
import * as ujs from '../../app/javascript/active_storage_drag_and_drop/ujs.js'
import assert from 'assert'
import sinon from 'sinon'

describe('default_ui', () => {
  let directUpload

  beforeEach(() => {
    document.body.insertAdjacentHTML('beforeend', `
      <div data-direct-upload-id="1">
        <div class="direct-upload"></div>
      </div>
    `)
    directUpload = document.body.querySelector('.direct-upload')
  })

  afterEach(() => { sinon.restore() })

  describe('#cancelUI', () => {
    let event

    beforeEach(() => {
      const detail = { id: 1 }
      event = new CustomEvent('error', { detail })
    })

    context('when the default event is not prevented', () => {
      beforeEach(() => {
        defaultUI.cancelUI(event)
      })

      it('removes every element with the matching direct upload id in its dataset', () => {
        assert.strictEqual(0, document.querySelectorAll('[data-direct-upload-id="1"]').length)
      })
    })

    context('when the default event is prevented', () => {
      beforeEach(() => {
        sinon.stub(event, 'defaultPrevented').value(true)
        defaultUI.cancelUI(event)
      })

      it('does not remove any element with the matching direct upload id in its dataset', () => {
        assert.strictEqual(1, document.querySelectorAll('[data-direct-upload-id="1"]').length)
      })
    })
  })

  describe('#errorUI', () => {
    let event

    beforeEach(() => {
      const detail = { id: 1, error: 'dummy error message' }
      event = new CustomEvent('error', { detail })
    })

    context('when the default event is not prevented', () => {
      beforeEach(() => {
        defaultUI.errorUI(event)
      })

      it('sets the title of the target direct-upload element to the error', () => {
        assert.strictEqual(directUpload.getAttribute('title'), 'dummy error message')
      })

      it('adds the direct-upload--error class to the target direct-upload element', () => {
        assert(directUpload.classList.contains('direct-upload--error'))
      })
    })

    context('when the default event is prevented', () => {
      beforeEach(() => {
        sinon.stub(event, 'defaultPrevented').value(true)
        defaultUI.errorUI(event)
      })

      it('the title of the target direct-upload element does not change', () => {
        assert(!directUpload.getAttribute('title'))
      })

      it('the direct-upload element does not have the direct-upload--error class', () => {
        assert(!directUpload.classList.contains('direct-upload--error'))
      })
    })
  })

  describe('#endUI', () => {
    let event

    beforeEach(() => {
      directUpload.setAttribute('id', 'direct-upload-1')
      directUpload.classList.add('direct-upload--pending')
      event = new CustomEvent('end', { detail: { id: 1 } })
    })

    context('when the default event is not prevented', () => {
      beforeEach(() => {
        defaultUI.endUI(event)
      })

      it('removes the direct-upload--pending class from the target direct-upload element', () => {
        assert(!directUpload.classList.contains('direct-upload--pending'))
      })

      it('adds the direct-upload--complete class to the target direct-upload element', () => {
        assert(directUpload.classList.contains('direct-upload--complete'))
      })
    })

    context('when the default event is prevented', () => {
      beforeEach(() => {
        sinon.stub(event, 'defaultPrevented').value(true)
        defaultUI.endUI(event)
      })

      it('the direct-upload element still has the direct-upload--pending class', () => {
        assert(directUpload.classList.contains('direct-upload--pending'))
      })

      it('the direct-upload element does not have the direct-upload--complete class', () => {
        assert(!directUpload.classList.contains('direct-upload--complete'))
      })
    })
  })

  describe('#placeHolderUI', () => {
    let event

    beforeEach(() => {
      const detail = {
        id: '1',
        file: 'test-file',
        iconContainer: document.createElement('DIV')
      }
      event = { detail }
    })

    context('when the default event is not prevented', () => {
      beforeEach(() => { event.defaultPrevented = false })

      it('calls paintDefaultUploadIcon with the event detail and complete set to false', () => {
        sinon.stub(ujs, 'paintUploadIcon')
        defaultUI.placeholderUI(event)
        sinon.assert.called(ujs.paintUploadIcon)
      })
    })

    context('when the default event is prevented', () => {
      beforeEach(() => { event.defaultPrevented = false })
    })
  })

  describe('#paintDefaultUploadIcon', () => {
    let iconContainer
    let file

    before(() => {
      iconContainer = document.createElement('DIV')
      document.body.append(iconContainer)
      file = new File([''], 'test_file.txt')
      defaultUI.paintDefaultUploadIcon(iconContainer, 1, file, true)
    })

    it('adds a root div with a direct-upload-id to the icon container', () => {
      assert(iconContainer.querySelector('div[data-direct-upload-id="1"]'))
    })

    it('displays the file name', () => {
      assert.strictEqual(iconContainer.querySelector('.direct-upload__filename').textContent, 'test_file.txt')
    })

    it('displays the file size', () => {
      assert.strictEqual(iconContainer.querySelector('.direct-upload__filesize').textContent, '0 Bytes')
    })
  })
})
