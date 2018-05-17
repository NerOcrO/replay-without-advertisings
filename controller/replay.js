import express from 'express'
import { getHome, getPlugin } from '../lib/utils'

const router = express.Router()

router.get('/', (request, response) => {
  getHome(request, response)
})

// Show's route.
router.get('/channel/:idChannel', (request, response) => {
  getPlugin(request, response, 'show')
})

// Videos's route.
router.get('/channel/:idChannel/show/:idShow', (request, response) => {
  getPlugin(request, response, 'videos')
})

// Video's route.
router.get('/channel/:idChannel/show/:idShow/video/:idVideo', (request, response) => {
  getPlugin(request, response, 'video')
})

export default router
