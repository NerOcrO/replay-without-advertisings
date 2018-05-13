const fs = require('fs')
const router = require('express').Router()
const utils = require('../lib/utils')

router.get('/', (request, response) => {
  utils.getHome(request, response)
})

router.get('/:langcode', (request, response) => {
  global.language = request.params.langcode
  utils.getHome(request, response)
})

// Show's route.
router.get('/channel/:idChannel', (request, response) => {
  utils.getPlugin(request, response, 'show')
})

// Videos's route.
router.get('/channel/:idChannel/show/:idShow', (request, response) => {
  utils.getPlugin(request, response, 'videos')
})

// Video's route.
router.get('/channel/:idChannel/show/:idShow/video/:idVideo', (request, response) => {
  utils.getPlugin(request, response, 'video')
})

// Show's route.
router.get('/:langcode/channel/:idChannel', (request, response) => {
  global.language = request.params.langcode
  utils.getPlugin(request, response, 'show')
})

// Videos's route.
router.get('/:langcode/channel/:idChannel/show/:idShow', (request, response) => {
  global.language = request.params.langcode
  utils.getPlugin(request, response, 'videos')
})

// Video's route.
router.get('/:langcode/channel/:idChannel/show/:idShow/video/:idVideo', (request, response) => {
  global.language = request.params.langcode
  utils.getPlugin(request, response, 'video')
})

module.exports = router
