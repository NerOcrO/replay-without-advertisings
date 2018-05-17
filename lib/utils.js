import fs from 'fs'
import { join } from 'path'

/**
 * Get the home.
 *
 * @param {Object} request
 * @param {Object} response
 */
export function getHome(request, response) {
  fs.readFile('./data/channels.json', 'utf8', (error, data) => {
    if (error) {
      throw error
    }

    const channels = []

    for (const channel of JSON.parse(data)) {
      channels.push({
        url: join('channel', channel.id),
        label: channel.label
      })
    }

    response.render('layout', {
      page: 'channel',
      title: t('The channels'),
      variables: { channels }
    })
  })
}

/**
 * Get plugin.
 *
 * @param {Object} request
 * @param {Object} response
 * @param {String} method
 */
export function getPlugin(request, response, method) {
  const pluginPath = join(__dirname, '..', 'plugin', request.params.idChannel, 'index.js')

  if (fs.existsSync(pluginPath)) {
    const { channel } = require(pluginPath)
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
 * @param {Object} res
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
 * Translate sentence.
 *
 * @param {String} String
 * @param {Object} words
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
 * Redirect when there is no langcode.
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Function} next
 */
export function redirect(request, response, next) {
  const originalUrl = request.originalUrl
  const routes = getRoutes().map((value) => value.route.replace(/:idChannel|:idShow|:idVideo/g, '([a-z]+)'))
  const routeIsValid = routes.some(route => {
    if (route === '/') {
      if (route === originalUrl) {
        return true
      }
      return false
    }
    else {
      return RegExp(route).test(originalUrl)
    }
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

/**
 * Get the global lang code.
 *
 * @param {Object} request
 */
export function getGlobalLangCode(request) {
  const langcode = getLangCodes().find(langCode => request.acceptsLanguages(langCode) === langCode)

  global.langCode = langcode
}

/**
 * Get the lang codes.
 *
 * @returns {Array}
 */
export function getLangCodes() {
  const languages = fs.readdirSync('./language/').map(file => file.replace('.json', ''))

  languages.push('en')

  return languages
}

/**
 * Get the routes.
 *
 * @returns {Array}
 */
export function getRoutes() {
  return JSON.parse(fs.readFileSync('./data/routes.json', 'utf8'))
}
