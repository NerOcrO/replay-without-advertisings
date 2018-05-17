import express from 'express'
import * as utils from '../lib/utils'

const router = express.Router()

for (const value of utils.getRoutes()) {
  router.get(value.route, (request, response) => {
    utils.getGlobalLangCode(request)

    if (value.route === '/') {
      utils.showHomePage(request, response)
    }
    else {
      utils.showPage(request, response, value.view)
    }
  })
}

export default router
