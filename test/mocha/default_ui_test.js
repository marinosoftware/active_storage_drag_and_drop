import * as defaultUI from '../../app/javascript/active_storage_drag_and_drop/default_ui.js'
import assert from 'assert'
import sinon from 'sinon'

describe('default_ui', () => {
  afterEach(() => { sinon.restore() })

  describe('#errorUI', () => {
    let event
    let directUpload

    beforeEach(() => {
      directUpload = document.createElement('DIV')
      directUpload.setAttribute('id', 'direct-upload-1')
      document.body.append(directUpload)
      const detail = { id: 1, error: 'dummy error message' }
      event = new CustomEvent('error', { detail })
    })

    afterEach(() => { document.body.innerHTML = '' })

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
        sinon.createSandbox().stub(event, 'defaultPrevented').value(true)
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
    let directUpload

    beforeEach(() => {
      directUpload = document.createElement('DIV')
      directUpload.setAttribute('id', 'direct-upload-1')
      directUpload.setAttribute('class', 'direct-upload--pending')
      document.body.append(directUpload)
      event = new CustomEvent('end', { detail: { id: 1 } })
    })

    afterEach(() => {
      document.body.innerHTML = ''
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
        sinon.createSandbox().stub(event, 'defaultPrevented').value(true)
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
        iconContainer: 'icon-container'
      }
      event = { detail }
    })

    context('when the default event is not prevented', () => {
      beforeEach(() => { event.defaultPrevented = false })

      it('calls paintUploadIcon with the event detail and complete set to false', () => {
        sinon.stub(window.ActiveStorageDragAndDrop, 'paintUploadIcon')
        defaultUI.placeholderUI(event)
        sinon.assert.called(window.ActiveStorageDragAndDrop.paintUploadIcon)
      })
    })

    context('when the default event is prevented', () => {
      beforeEach(() => { event.defaultPrevented = false })
    })
  })

  describe('#paintUploadIcon', () => {
    let iconContainer
    let file

    before(() => {
      iconContainer = document.createElement('DIV')
      document.body.append(iconContainer)
      file = new File([''], 'test_file.txt')
      defaultUI.paintUploadIcon(iconContainer, 1, file, true)
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
