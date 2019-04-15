import { fileSizeSI, dispatchEvent } from '../../app/javascript/active_storage_drag_and_drop/helpers.js'
import assert from 'assert'
import sinon from 'sinon'

describe('helpers', () => {
  afterEach(() => { sinon.restore() })

  describe('#fileSizeSI', () => {
    it('should return 5kB when passed 5e3 bytes', () => {
      assert.strictEqual(fileSizeSI(5e3), '5kB')
    })

    it('should round up to 6kB when passed 5999 bytes', () => {
      assert.strictEqual(fileSizeSI(5999), '6kB')
    })

    it('should round down to 5GB when passed 55e8 bytes', () => {
      assert.strictEqual(fileSizeSI(55e8), '6GB')
    })

    it('should round up to 6GB when passed 55e8 + 1 bytes', () => {
      assert.strictEqual(fileSizeSI(55e8 + 1), '6GB')
    })

    it('should work up to YBs', () => {
      assert.strictEqual(fileSizeSI(1e24), '1YB')
    })

    it('should work down to bytes', () => {
      assert.strictEqual(fileSizeSI(0), '0 Bytes')
    })
  })

  describe('#dispatchEvent', () => {
    let eventSpy
    let event

    context('when passed no eventInit object and called on the document', () => {
      before(() => {
        eventSpy = sinon.spy()
        document.addEventListener('testEvent', eventSpy)
        dispatchEvent(document, 'testEvent')
        event = eventSpy.args[0][0]
      })

      it('triggers an event once', () => {
        assert.strictEqual(eventSpy.callCount, 1)
      })

      it('bubbles by default', () => {
        assert(event.bubbles)
      })

      it('is cancelable by default', () => {
        assert(event.cancelable)
      })

      it('has an empty detail object', () => {
        assert.strictEqual(typeof event.detail, 'object')
      })
    })

    context('when passed custom parameters', () => {
      before(() => {
        eventSpy = sinon.spy()
        document.addEventListener('testEvent', eventSpy)

        const bubbles = false
        const cancelable = false
        const detail = { 'foo': 'bar' }
        dispatchEvent(document, 'testEvent', { bubbles, cancelable, detail })
        event = eventSpy.getCall(0).args[0]
      })

      it('overrides bubbling default', () => {
        assert(!event.bubbles)
      })

      it('overrides default cancelability', () => {
        assert(!event.cancelable)
      })

      it('passes custom data through detail', () => {
        assert.strictEqual(event.detail.foo, 'bar')
      })
    })
  })
})
