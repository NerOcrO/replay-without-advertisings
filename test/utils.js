/* eslint-env mocha */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import * as utils from '../src/lib/utils'

chai.use(chaiAsPromised)
chai.should()

describe('utils', () => {
  it('gets lang code', (done) => {
    utils.getLangCodes('./test/locales').should.eventually.deep.equal(['en', 'es']).notify(done)
  })

  it('gets the routes', (done) => {
    utils.getRoutes('./test/data/routes.json').should.eventually.deep.equal([{ value: '/', view: '' }]).notify(done)
  })
})
