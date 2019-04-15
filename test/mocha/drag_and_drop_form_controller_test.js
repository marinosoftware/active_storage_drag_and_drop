import { DragAndDropFormController } from '../../app/javascript/active_storage_drag_and_drop/drag_and_drop_form_controller'
import { DragAndDropUploadController } from '../../app/javascript/active_storage_drag_and_drop/drag_and_drop_upload_controller'
import * as helpers from '../../app/javascript/active_storage_drag_and_drop/helpers'
import * as defaultUI from '../../app/javascript/active_storage_drag_and_drop/default_ui'
import assert from 'assert'
import sinon from 'sinon'

describe('DragAndDropFormController', () => {
  let formController
  let form

  beforeEach(() => {
    form = document.createElement('FORM')
    document.body.append(form)
    formController = new DragAndDropFormController(form)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('sets its own form to the form passed to the constructor', () => {
    assert.strictEqual(formController.form, form)
  })

  describe('.start', () => {
    let callback

    beforeEach(() => {
      callback = sinon.spy()
    })

    context('when there are no uploaders to process', () => {
      it('dispatches a start event', () => {
        sinon.spy(formController, 'dispatch')
        formController.start(callback)
        sinon.assert.calledWithExactly(formController.dispatch, 'start')
      })

      it('dispatches an end event', () => {
        sinon.spy(formController, 'dispatch')
        formController.start(callback)
        sinon.assert.calledWithExactly(formController.dispatch, 'end')
      })

      it('calls the default end event UI method', () => {
        sinon.spy(defaultUI, 'endUI')
        formController.start(callback)
        sinon.assert.calledOnce(defaultUI.endUI)
      })

      it('calls the passed callback with no arguments', () => {
        formController.start(callback)
        sinon.assert.calledWithExactly(callback)
      })
    })

    context('when there are uploaders to process', () => {
      let uploaderOne
      let uploaderTwo

      beforeEach(() => {
        uploaderOne = { start: function (callback) { callback() } }
        uploaderTwo = { start: function (callback) { callback() } }
        formController.uploadControllers = [uploaderOne, uploaderTwo]
      })

      it('calls start on the first uploader', () => {
        sinon.spy(uploaderOne, 'start')
        formController.start(callback)
        sinon.assert.calledOnce(uploaderOne.start)
      })

      it('calls start on the last uploader', () => {
        sinon.spy(uploaderTwo, 'start')
        formController.start(callback)
        sinon.assert.calledOnce(uploaderTwo.start)
      })

      it('dispatches a start event', () => {
        sinon.spy(formController, 'dispatch')
        formController.start(callback)
        sinon.assert.calledWithExactly(formController.dispatch, 'start')
      })

      it('dispatches an end event', () => {
        sinon.spy(formController, 'dispatch')
        formController.start(callback)
        sinon.assert.calledWithExactly(formController.dispatch, 'end')
      })

      it('calls the default end event UI method', () => {
        sinon.spy(defaultUI, 'endUI')
        formController.start(callback)
        sinon.assert.calledOnce(defaultUI.endUI)
      })

      it('calls the passed callback with no arguments', () => {
        formController.start(callback)
        sinon.assert.calledWithExactly(callback)
      })

      context('when starting an upload causes an error', () => {
        let testError

        beforeEach(() => {
          sinon.stub(formController, 'dispatchError')
          testError = new Error('test-error')
          const errorUploader = { start: function (callback) { callback(testError) } }
          formController.uploadControllers.push(errorUploader)
        })

        it('dispatches an error event', () => {
          formController.start(callback)
          sinon.assert.calledWith(formController.dispatchError, testError)
        })

        it('does not dispatch an end event', () => {
          sinon.spy(formController, 'dispatch')
          formController.start(callback)
          sinon.assert.neverCalledWith(formController.dispatch, 'end')
        })

        it('does not calls the default end event UI method', () => {
          sinon.spy(defaultUI, 'endUI')
          formController.start(callback)
          sinon.assert.notCalled(defaultUI.endUI)
        })

        it('calls the passed callback passing the Error', () => {
          formController.start(callback)
          sinon.assert.calledWithExactly(callback, testError)
        })
      })
    })
  })

  describe('.dispatch', () => {
    let eventSpy
    let event

    before(() => {
      eventSpy = sinon.spy()
      document.addEventListener('dnd-uploads:test-event', eventSpy)
    })

    afterEach(() => { eventSpy.resetHistory() })

    beforeEach(() => {
      event = formController.dispatch('test-event', { foo: 'bar' })
    })

    it('returns the same event that is dispatched', () => {
      sinon.assert.calledWithExactly(eventSpy, event)
    })

    it('dispatches an event with the passed name namespaced under dnd-uploads', () => {
      sinon.assert.calledOnce(eventSpy)
    })

    it("has the formController's form as the event target", () => {
      assert.strictEqual(event.target, formController.form)
    })

    it('has any custom detail passed to the method', () => {
      assert.strictEqual(event.detail.foo, 'bar')
    })
  })

  describe('.dispatchError', () => {
    const testError = new Error('test error')
    const fakeUploadController = { iconContainer: 'testIconContainer', file: 'testFile' }

    beforeEach(() => {
      sinon.stub(helpers, 'dispatchEvent')
      sinon.stub(defaultUI, 'errorUI')
    })

    it('dipatches an error event', () => {
      formController.dispatchError(testError, fakeUploadController)
      sinon.assert.calledOnce(helpers.dispatchEvent)
    })

    it('adds the error to the event detail', () => {
      formController.dispatchError(testError, fakeUploadController)
      assert.strictEqual(helpers.dispatchEvent.args[0][2].detail.error, testError)
    })

    it('adds the iconContainer to the event detail', () => {
      formController.dispatchError(testError, fakeUploadController)
      assert.strictEqual(helpers.dispatchEvent.args[0][2].detail.iconContainer, 'testIconContainer')
    })

    it('adds the file to the event detail', () => {
      formController.dispatchError(testError, fakeUploadController)
      assert.strictEqual(helpers.dispatchEvent.args[0][2].detail.file, 'testFile')
    })

    it('calls the default error event UI helper', () => {
      formController.dispatchError(testError, fakeUploadController)
      sinon.assert.calledOnce(defaultUI.errorUI)
    })
  })

  describe('.queueUpload', () => {
    let input
    let file

    beforeEach(() => {
      document.body.innerHTML = `
        <form>
          <label>
            <div id="asdndz__icon-container"></div>
            <input accept="text/plain" size_limit="10" data-icon-container-id="asdndz__icon-container" data-direct-upload-url="/rails/active_storage/direct_uploads" type="file" name="testName"/>
          </label>
        </form>
      `
      input = document.body.querySelector('input[data-direct-upload-url]')
      file = new File([''], 'test_file.txt', { type: 'text/plain' })
    })

    afterEach(() => {
      sinon.restore()
    })

    it('adds an upload controller to the form controller\'s list of upload controllers', () => {
      formController.queueUpload(input, file)
      assert(formController.uploadControllers[0] instanceof DragAndDropUploadController)
    })

    context('when the file is larger than given file size limit', () => {
      beforeEach(() => {
        file = new File(['This file is too big for the 10 Byte limit.'], 'test_file.txt', { type: 'text/plain' })
      })

      it('does not add an upload controller to the form controller\'s list of upload controllers', () => {
        formController.queueUpload(input, file)
        assert(!formController.uploadControllers[0])
      })

      it('dispatches a dnd-upload:error event', () => {
        sinon.spy(helpers, 'dispatchEvent')
        formController.queueUpload(input, file)
        sinon.assert.calledWith(helpers.dispatchEvent, input, 'dnd-upload:error')
      })

      it('adds a ValidationError with an appropriate message to the event detail', () => {
        sinon.spy(helpers, 'dispatchEvent')
        formController.queueUpload(input, file)
        assert.strictEqual(helpers.dispatchEvent.args[0][2].detail.error.message, 'File too large. Can be no larger than 10 Bytes')
      })

      it('adds the error and an error class to the added upload element', () => {
        formController.queueUpload(input, file)
        const errorElement = document.querySelector('.direct-upload--error')
        assert(errorElement.getAttribute('title'), 'File too large. Can be no larger than 10 Bytes')
      })
    })

    context('when the file type is not in the accepted file types', () => {
      beforeEach(() => {
        file = new File([''], 'test_file.txt', { type: 'image/png' })
      })

      it('does not add an upload controller to the form controller\'s list of upload controllers', () => {
        formController.queueUpload(input, file)
        assert(!formController.uploadControllers[0])
      })

      it('dispatches a dnd-upload:error event', () => {
        sinon.spy(helpers, 'dispatchEvent')
        formController.queueUpload(input, file)
        sinon.assert.calledWith(helpers.dispatchEvent, input, 'dnd-upload:error')
      })

      it('adds a ValidationError with an appropriate message to the event detail', () => {
        sinon.spy(helpers, 'dispatchEvent')
        formController.queueUpload(input, file)
        assert.strictEqual(helpers.dispatchEvent.args[0][2].detail.error.message, 'Invalid filetype')
      })

      it('adds the error and an error class to the added upload element', () => {
        formController.queueUpload(input, file)
        const errorElement = document.querySelector('.direct-upload--error')
        assert.strictEqual(errorElement.getAttribute('title'), 'Error: Invalid filetype')
      })
    })
  })

  describe('.unqueueUpload', () => {
    beforeEach(() => {
      formController.uploadControllers = [
        { upload: { id: 1 } },
        { upload: { id: 2 } },
        { upload: { id: 3 } }
      ]
    })

    after(() => { form.uploadControllers = [] })

    it('removes the upload controller with the matching upload id from the queue', () => {
      formController.unqueueUpload(2)
      assert.strictEqual(formController.uploadControllers.length, 2)
    })
  })
})
