import Debug from 'debug'
import express from 'express'
import fs from 'fs'
import { join } from 'path'
import * as utils from '../lib/utils'

const debug = Debug('replay')

/**
 * Get the home.
 *
 * @param {Request} request
 *   Request object.
 * @param {Response} response
 *   Response object.
 */
const showHomePage = (request, response) => {
  fs.readFile('./data/channels.json', 'utf8', (error, lines) => {
    if (error) {
      throw error
    }

    response.locals.channels = JSON.parse(lines).map(channel => (
      {
        url: join('channel', channel.id),
        label: channel.label,
      }
    ))

    response.render('layout', {
      page: 'channel',
      title: response.t('The channels'),
    })
  })
}

/**
 * Get plugin.
 *
 * @param {Request} request
 *   Request object.
 * @param {Response} response
 *   Response object.
 * @param {String} method
 *   The method.
 */
const showPage = (request, response, method) => {
  const pluginPath = join(__dirname, '..', 'plugins', request.params.channelId, 'index.js')

  fs.access(pluginPath, (error) => {
    if (error) {
      response.status(404).render('layout', {
        page: 'error',
        title: response.t('Error 404'),
        error: response.t('Sorry, we cannot find that!'),
      })
    }
    else {
      const channel = require(pluginPath).default
      channel[method](request, response)
    }
  })
}

const router = express.Router()

utils.getRoutes()
  .then(routes =>
    routes.forEach(route =>
      router.get(route.value, (request, response) => (
        route.value === '/' ? showHomePage(request, response) : showPage(request, response, route.view)
      ))))
  .catch(error => debug(error))

export default router
