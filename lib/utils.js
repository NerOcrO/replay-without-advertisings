import fs from 'fs'
import { join } from 'path'

/**
 * Get the home.
 *
 * @param {Object} request
 *   Request object.
 * @param {Object} response
 *   Response object.
 */
export function showHomePage(request, response) {
  const data = fs.readFileSync('./data/channels.json', 'utf8')

  const channels = JSON.parse(data).map((channel) => {
    return {
      url: join('channel', channel.id),
      label: channel.label,
    }
  })

  response.render('layout', {
    page: 'channel',
    title: response.t('The channels'),
    channels,
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
export function showPage(request, response, method) {
  const pluginPath = join(__dirname, '..', 'plugin', request.params.channelId, 'index.js')

  if (fs.existsSync(pluginPath)) {
    const channel = require(pluginPath).default
    channel[method](request, response)
  }
  else {
    response.status(404).send(response.t('Sorry, we cannot find that!'))
  }
}

/**
 * HTTP error handler.
 *
 * @param {Object} response
 *   Response object.
 * @param {Object} res
 *   Response object.
 *
 * @return {Boolean}
 *   True if there is an error.
 */
export function hasError(response, res) {
  let error = ''

  if (res.statusCode !== 200) {
    error = new Error(response.t('Request Failed.\nStatus Code: %s', res.statusCode))
  }
  else if (!/^application\/json/.test(res.headers['content-type'])) {
    error = new Error(response.t('Invalid content-type.\nExpected application/json but received %s', res.headers['content-type']))
  }

  if (error) {
    console.error(error.message)
    // Consume response data to free up memory.
    res.resume()
    response.status(500).send(response.t('Sorry, there is something wrong!'))
    return true
  }

  return false
}

/**
 * Get the routes.
 *
 * @return {Array}
 *   Array of routes.
 */
export function getRoutes() {
  return JSON.parse(fs.readFileSync('./data/routes.json', 'utf8'))
}

/**
 * Get the lang codes.
 *
 * @return {Array}
 *   Array of locales.
 */
export function getLangCodes() {
  const locales = fs.readdirSync('./locales/').map(file => file.replace('.json', ''))

  locales.push('en')

  return locales
}

/**
 * Get the default browser lang code.
 *
 * @param {Object} request
 *  Request object.
 *
 * @return {String}
 *   Lang code.
 */
export function getBrowserLangCode(request) {
  return getLangCodes().find(langCode => request.acceptsLanguages(langCode) === langCode)
}

/**
 * Redirect when there is no langcode.
 *
 * @param {Object} request
 *   Request object.
 * @param {Object} response
 *   Response object.
 * @param {Function} next
 *   The callback.
 */
export function redirect(request, response, next) {
  const { originalUrl } = request
  const routes = getRoutes().map(value => value.route.replace(/:channelId|:showId|:videoId/g, '([a-z]+)'))
  const routeIsValid = routes.some((route) => {
    if (route === '/') {
      if (route === originalUrl) {
        return true
      }
      return false
    }

    return RegExp(route).test(originalUrl)
  })

  if (!routeIsValid) {
    response.status(404).send(response.t('Sorry, we cannot find that!'))
  }
  else {
    response.redirect(`/${getBrowserLangCode(request)}${originalUrl}`)
  }

  next()
}
