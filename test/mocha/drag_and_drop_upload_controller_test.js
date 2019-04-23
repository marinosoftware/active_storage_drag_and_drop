import { DragAndDropUploadController } from '../../app/javascript/active_storage_drag_and_drop/drag_and_drop_upload_controller.js'
import * as defaultUI from '../../app/javascript/active_storage_drag_and_drop/default_ui.js'
import assert from 'assert'
import sinon from 'sinon'

describe('DragAndDropUploadController', () => {
  let input
  let file
  let controller

  beforeEach(() => {
    document.body.innerHTML = `
      <form class='foo'>
        <label>
          <div id="asdndz__icon-container"></div>
          <input data-icon-container-id="asdndz__icon-container" data-direct-upload-url="/rails/active_storage/direct_uploads" type="file" name="testName"/>
        </label>
      </form>
    `
    input = document.body.querySelector('input[data-direct-upload-url]')
    file = new File([''], 'test_file.txt')
    controller = new DragAndDropUploadController(input, file)
  })

  afterEach(() => { sinon.restore() })

  it('dispatches an initialize event on creation', () => {
    const eventSpy = sinon.spy()
    input.addEventListener('dnd-upload:initialize', eventSpy)
    /* eslint-disable no-new */
    new DragAndDropUploadController(input, file)
    sinon.assert.calledOnce(eventSpy)
  })

  describe('.start', () => {
    context('when the upload creates successfully', () => {
      beforeEach(() => {
        const fakeCreateUpload = sinon.fake(callback => {
          callback(null, { signed_id: 'signedBlobId' })
        })
        sinon.replace(controller.upload, 'create', fakeCreateUpload)
      })

      it('appends a hidden field to the form', () => {
        controller.start(() => {})
        assert(document.querySelector('input[type="hidden"]'))
      })

      it('the added hidden field name matches the the file input field name', () => {
        controller.start(() => {})
        const hiddenField = document.querySelector('input[type="hidden"]')
        assert.strictEqual(hiddenField.getAttribute('name'), input.getAttribute('name'))
      })

      it('the added hidden field value is the signed id of the file blob', () => {
        controller.start(() => {})
        const hiddenField = document.querySelector('input[type="hidden"]')
        assert.strictEqual(hiddenField.getAttribute('value'), 'signedBlobId')
      })

      it("the added hidden field's direct-upload-id is the id of the controller's upload", () => {
        controller.start(() => {})
        const hiddenField = document.querySelector('input[type="hidden"]')
        assert.strictEqual(hiddenField.dataset.directUploadId, controller.upload.id.toString())
      })

      it('passes nothing to the callback', () => {
        const callback = sinon.spy()
        controller.start(callback)
        sinon.assert.calledWithExactly(callback, null)
      })

      it('dispatches an end event', () => {
        sinon.spy(controller, 'dispatch')
        controller.start(() => {})
        sinon.assert.calledWith(controller.dispatch, 'end')
      })

      it('calls the default end event UI function', () => {
        sinon.spy(defaultUI, 'endUI')
        controller.start(() => {})
        sinon.assert.calledOnce(defaultUI.endUI)
      })
    })

    context('when the upload creation has an error', () => {
      let testError

      beforeEach(() => {
        testError = new Error('test error')
        const fakeCreateUpload = sinon.fake(callback => {
          callback(testError)
        })
        sinon.replace(controller.upload, 'create', fakeCreateUpload)
      })

      it('does not append a hidden field to the form', () => {
        controller.start(() => {})
        assert(!document.querySelector('input[type="hidden"]'))
      })

      it('calls the passed callback on the error', () => {
        const callback = sinon.spy()
        controller.start(callback)
        sinon.assert.calledWithExactly(callback, testError)
      })

      it('dispatches an error event', () => {
        const eventSpy = sinon.spy()
        input.addEventListener('dnd-upload:error', eventSpy)
        controller.start(() => {})
        sinon.assert.calledOnce(eventSpy)
      })
    })
  })

  describe('.dispatch', () => {
    let eventSpy
    let event

    before(() => {
      eventSpy = sinon.spy()
      document.addEventListener('dnd-upload:test-event', eventSpy)
    })

    afterEach(() => { eventSpy.resetHistory() })

    beforeEach(() => {
      event = controller.dispatch('test-event')
    })

    it('returns the same event that is dispatched', () => {
      assert.strictEqual(event, eventSpy.args[0][0])
    })

    it('dispatches an event with the passed name namespaced under dnd-upload', () => {
      sinon.assert.calledOnce(eventSpy)
    })

    it("has the controller's input as the event target", () => {
      assert.strictEqual(event.target, controller.input)
    })

    it("has the controller's file in the event detail", () => {
      assert.strictEqual(event.detail.file, controller.file)
    })

    it("has the controller's upload id in the event detail", () => {
      assert.strictEqual(event.detail.id, controller.upload.id)
    })

    it("has the controller's iconContainer in the event detail", () => {
      assert.strictEqual(event.detail.iconContainer, controller.iconContainer)
    })
  })

  describe('.dispatchError', () => {
    const testError = new Error('test error')

    it('dipatches an error event', () => {
      sinon.spy(controller, 'dispatch')
      controller.dispatchError(testError)
      sinon.assert.calledWith(controller.dispatch, 'error')
    })

    it('adds the error to the event detail', () => {
      sinon.spy(controller, 'dispatch')
      controller.dispatchError(testError)
      assert.strictEqual(controller.dispatch.args[0][1].error, testError)
    })

    it('calls the default error event UI helper', () => {
      sinon.spy(defaultUI, 'errorUI')
      controller.dispatchError(testError)
      sinon.assert.calledOnce(defaultUI.errorUI)
    })
  })

  describe('.directUploadWillCreateBlobWithXHR', () => {
    const testXhr = new XMLHttpRequest()

    it('dipatches a before-blob-request event', () => {
      sinon.spy(controller, 'dispatch')
      controller.directUploadWillCreateBlobWithXHR(testXhr)
      sinon.assert.calledWith(controller.dispatch, 'before-blob-request')
    })

    it('adds the xhr to the event detail', () => {
      sinon.spy(controller, 'dispatch')
      controller.directUploadWillCreateBlobWithXHR(testXhr)
      assert.strictEqual(controller.dispatch.args[0][1].xhr, testXhr)
    })
  })

  describe('.directUploadWillStoreFileWithXHR', () => {
    const testXhr = new XMLHttpRequest()

    it('dipatches a before-storage-request event', () => {
      sinon.spy(controller, 'dispatch')
      controller.directUploadWillStoreFileWithXHR(testXhr)
      sinon.assert.calledWith(controller.dispatch, 'before-storage-request')
    })

    it('adds the xhr to the event detail', () => {
      sinon.spy(controller, 'dispatch')
      controller.directUploadWillStoreFileWithXHR(testXhr)
      assert.strictEqual(controller.dispatch.args[0][1].xhr, testXhr)
    })

    it('adds a progress event listener to the upload', () => {
      sinon.spy(controller, 'uploadRequestDidProgress')
      controller.directUploadWillStoreFileWithXHR(testXhr)
      const testProgressEvent = new Event('progress')
      testXhr.upload.dispatchEvent(testProgressEvent)
      sinon.assert.calledWithExactly(controller.uploadRequestDidProgress, testProgressEvent)
    })
  })

  describe('.uploadRequestDidProgress', () => {
    let uploadEvent

    before(() => {
      uploadEvent = new Event('progress')
      uploadEvent.loaded = 1
      uploadEvent.total = 2
    })

    beforeEach(() => {
      document.body.insertAdjacentHTML('beforeend', `
        <div data-direct-upload-id="1">
          <div class="direct-upload__progress"> style="width: 0%"</div>
        </div>
      `)
    })

    it('dipatches a progress event', () => {
      sinon.spy(controller, 'dispatch')
      controller.uploadRequestDidProgress(uploadEvent)
      sinon.assert.calledWith(controller.dispatch, 'progress')
    })

    it('adds the progress percentage to the event detail', () => {
      sinon.spy(controller, 'dispatch')
      controller.uploadRequestDidProgress(uploadEvent)
      assert.strictEqual(controller.dispatch.args[0][1].progress, 50)
    })

    it('sets the width of the target progress div', () => {
      controller.uploadRequestDidProgress(uploadEvent)
      const progressBar = document.body.querySelector(`[data-direct-upload-id="${controller.upload.id}"] .direct-upload__progress`)
      assert.strictEqual(progressBar.style.width, '50%')
    })
  })
})
