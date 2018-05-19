import fs from 'fs'
import { join } from 'path'

/**
 * Translate sentence.
 *
 * @param {String} String
 *   The sentence.
 * @param {Object} words
 *   Words as variable.
 *
 * @return {String}
 *   Sentence transformed.
 */
export function t(String, words = {}) {
  if (global.langCode !== 'en') {
    const filePath = join(__dirname, '..', 'language', `${global.langCode}.json`)
    const language = fs.readFileSync(filePath, 'utf8')

    String = JSON.parse(language)[String] ? JSON.parse(language)[String] : String
  }

  if (words.length > 0) {
    for (const word of words) {
      String = String.replace(/@@([a-z]*)@@/, word)
    }
  }

  return String
}

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
    title: t('The channels'),
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
    response.status(404).send(t('Sorry, we cannot find that!'))
  }
}

/**
 * HTTP error handling.
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
    error = new Error(t('Request Failed.\nStatus Code: @@statusCode@@', [res.statusCode]))
  }
  else if (!/^application\/json/.test(res.headers['content-type'])) {
    error = new Error(t('Invalid content-type.\nExpected application/json but received @@contentType@@', [res.headers['content-type']]))
  }

  if (error) {
    console.error(error.message)
    // Consume response data to free up memory.
    res.resume()
    response.status(500).send(t('Sorry, there is something wrong!'))
    return false
  }

  return true
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
 *   Array of languages.
 */
export function getLangCodes() {
  const languages = fs.readdirSync('./language/').map(file => file.replace('.json', ''))

  languages.push('en')

  return languages
}

/**
 * Get the global lang code.
 *
 * @param {Object} request
 *  Request object.
 */
export function getGlobalLangCode(request) {
  const langcode = getLangCodes().find(langCode => request.acceptsLanguages(langCode) === langCode)

  global.langCode = langcode
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
    response.status(404).send(t('Sorry, we cannot find that!'))
  }
  else {
    getGlobalLangCode(request)

    response.redirect(`/${global.langCode}${originalUrl}`)
  }

  next()
}
