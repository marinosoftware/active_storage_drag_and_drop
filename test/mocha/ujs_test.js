import * as ujs from '../../app/javascript/active_storage_drag_and_drop/ujs'
import * as defaultUI from '../../app/javascript/active_storage_drag_and_drop/default_ui'
import sinon from 'sinon'
import assert from 'assert'
import { addFileList } from 'addFileList'
import path from 'path'

describe('ujs', () => {
  describe('#start', () => {
    const listeners = [
      { event: 'submit', callback: ujs.handleSubmit },
      { event: 'ajax:before', callback: ujs.handleSubmit },
      { event: 'dnd-uploads:process-upload-queue', callback: ujs.handleProcessUploadQueueEvent },
      { event: 'change', callback: ujs.queueUploadsForFileInput },
      { event: 'dragover', callback: ujs.preventDragover },
      { event: 'drop', callback: ujs.queueUploadsForDroppedFiles },
      { event: 'click', callback: ujs.removeFileFromQueue }
    ]

    before(() => {
      sinon.spy(document, 'addEventListener')
      sinon.spy(ujs, 'addAttachedFileIcons')
      ujs.start()
    })

    after(() => { sinon.restore() })

    listeners.forEach(({ event, callback }) => {
      it(`adds a ${event} listener to the document`, () => {
        sinon.assert.calledWith(document.addEventListener, event, callback)
      })
    })
  })

  describe('#processUploadQueue', () => {
    let form
    let callback

    beforeEach(() => {
      form = document.createElement('FORM')
      callback = sinon.stub()
    })

    it('calls the callback passed in the event detail', () => {
      ujs.processUploadQueue(form, callback)
      sinon.assert.calledOnce(callback)
    })
  })

  describe('#addAttachedFileIcons', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type='hidden' data-direct-upload-id='1' data-uploaded-file='true'></input>
        <input type='hidden' data-direct-upload-id='2' data-uploaded-file='true'></input>
      `
    })

    it('calls the file upload UI painter for all attached file inputs', () => {
      sinon.stub(defaultUI, 'placeholderUI')
      ujs.addAttachedFileIcons()
    })
  })

  describe('#preventDragover', () => {
    let target
    let event

    beforeEach(() => {
      target = document.createElement('DIV')
      event = { target, preventDefault: sinon.spy() }
    })

    context('when the target is not inside of an element with the asdndzone class', () => {
      beforeEach(() => {
        document.body.append(target)
      })

      it('does not call preventDefault on the event', () => {
        ujs.preventDragover(event)
        sinon.assert.notCalled(event.preventDefault)
      })
    })

    context('when the target is inside of an element with the asdndzone class', () => {
      beforeEach(() => {
        const parent = document.createElement('DIV')
        parent.classList.add('asdndzone')
        parent.append(target)
        document.body.append(parent)
      })

      it('calls preventDefault on the event', () => {
        ujs.preventDragover(event)
        sinon.assert.calledOnce(event.preventDefault)
      })
    })

    context('when the target has the asdndzone class', () => {
      beforeEach(() => {
        target.classList.add('asdndzone')
        document.body.append(target)
      })

      it('calls preventDefault on the event', () => {
        ujs.preventDragover(event)
        sinon.assert.calledOnce(event.preventDefault)
      })
    })
  })

  describe('#removeFileFromQueue', () => {
    let target
    // let formController
    let form

    beforeEach(() => {
      form = document.createElement('FORM')
      target = document.createElement('INPUT')
      target.dataset.directUploadId = 1
      target.classList.add('direct-upload__remove')
      form.append(target)
      // formController = { unqueueUpload: sinon.spy() }
      // sinon.stub(ujs, 'findOrInitializeFormController').returns(formController)
    })

    afterEach(() => { sinon.restore() })

    it('prevents the default click event', () => {
      const event = { target, preventDefault: sinon.spy() }
      ujs.removeFileFromQueue(event)
      sinon.assert.calledOnce(event.preventDefault)
    })

    context('when the target element has no data-dnd-delete attribute', () => {
      beforeEach(() => {
        target.classList.remove('direct-upload__remove')
      })

      it('does not prevent the default form submission', () => {
        const event = { target, preventDefault: sinon.spy() }
        ujs.removeFileFromQueue(event)
        sinon.assert.notCalled(event.preventDefault)
      })
    })
  })

  describe('#queueUploadsForFileInput', () => {
    let target
    let form

    beforeEach(() => {
      form = document.createElement('FORM')
      target = document.createElement('INPUT')
      target.setAttribute('type', 'file')
      target.dataset.dnd = 'true'
      addFileList(target, [
        path.resolve(__dirname, '../fixtures/files/arrow.png'),
        path.resolve(__dirname, '../fixtures/files/document.txt')
      ])
      form.append(target)
    })

    afterEach(() => { sinon.restore() })

    it('empties the value of the input', () => {
      target.setAttribute('value', 'foobar')
      const event = { target }
      ujs.queueUploadsForFileInput(event)
      assert.strictEqual(target.getAttribute('value'), '')
    })
  })

  // Tests for this function depend on the clipboard api being implemented in jsdom:
  // https://github.com/jsdom/jsdom/issues/1568
  //
  // describe('#queueUploadsForDroppedFiles', () => {
  //   let event

  //   beforeEach(() => {
  //     const target = document.createElement('DIV')
  //     target.classList.add('asdndzone')

  //     event = {
  //       target,
  //       dataTransfer: new DataTransfer(),
  //       preventDefault: () => {}
  //     }
  //   })

  //   it('prevents the default of the passed drag event', () => {
  //     sinon.spy(event, 'preventDefault')
  //     ujs.queueUploadsForDroppedFiles(event)
  //     sinon.assert.calledOnce(event.preventDefault)
  //   })

  //   it('calls createUploader for each file in the dataTransfer from the drop event')
  // })
})
