import express from 'express'
import fs from 'fs'
import { join } from 'path'
import * as utils from '../lib/utils'

/**
 * Get the home.
 *
 * @param {Object} request
 *   Request object.
 * @param {Object} response
 *   Response object.
 */
function showHomePage(request, response) {
  const data = fs.readFileSync('./data/channels.json', 'utf8')

  response.locals.channels = JSON.parse(data).map(channel => (
    {
      url: join('channel', channel.id),
      label: channel.label,
    }
  ))

  response.render('layout', {
    page: 'channel',
    title: response.t('The channels'),
  })
}

/**
 * Get plugin.
 *
 * @param {Object} request
 *   Request object.
 * @param {Object} response
 *   Response object.
 * @param {String} method
 *   Method.
 */
function showPage(request, response, method) {
  const pluginPath = join(__dirname, '..', 'plugins', request.params.channelId, 'index.js')

  if (fs.existsSync(pluginPath)) {
    const channel = require(pluginPath).default
    channel[method](request, response)
  }
  else {
    response.status(404).render('layout', {
      page: 'error',
      title: response.t('Error 404'),
      error: response.t('Sorry, we cannot find that!'),
    })
  }
}

const router = express.Router()

utils.getRoutes().forEach((value) => {
  router.get(value.route, (request, response) => {
    if (value.route === '/') {
      showHomePage(request, response)
    }
    else {
      showPage(request, response, value.view)
    }
  })
})

export default router
