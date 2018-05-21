import express from 'express'
import * as utils from '../lib/utils'

const router = express.Router()

utils.getRoutes().forEach((value) => {
  router.get(value.route, (request, response) => {
    if (value.route === '/') {
      utils.showHomePage(request, response)
    }
    else {
      utils.showPage(request, response, value.view)
    }
  })
})

export default router
