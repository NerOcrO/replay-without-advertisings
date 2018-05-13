const fs = require('fs')
const router = require('express').Router()
const tools = require('../tools')

router.get('/', (request, response) => {
  tools.getHome(request, response)
})

router.get('/:langcode', (request, response) => {
  global.language = request.params.langcode
  tools.getHome(request, response)
})

// Show's route.
router.get('/channel/:idChannel', (request, response) => {
  tools.getPlugin(request, response, 'show')
})

// Videos's route.
router.get('/channel/:idChannel/show/:idShow', (request, response) => {
  tools.getPlugin(request, response, 'videos')
})

// Video's route.
router.get('/channel/:idChannel/show/:idShow/video/:idVideo', (request, response) => {
  tools.getPlugin(request, response, 'video')
})

// Show's route.
router.get('/:langcode/channel/:idChannel', (request, response) => {
  global.language = request.params.langcode
  tools.getPlugin(request, response, 'show')
})

// Videos's route.
router.get('/:langcode/channel/:idChannel/show/:idShow', (request, response) => {
  global.language = request.params.langcode
  tools.getPlugin(request, response, 'videos')
})

// Video's route.
router.get('/:langcode/channel/:idChannel/show/:idShow/video/:idVideo', (request, response) => {
  global.language = request.params.langcode
  tools.getPlugin(request, response, 'video')
})

module.exports = router
