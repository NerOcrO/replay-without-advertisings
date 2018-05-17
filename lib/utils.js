import fs from 'fs'
import { join } from 'path'

/**
 * Get the home.
 *
 * @param {object} request
 * @param {object} response
 */
export function getHome(request, response) {
  fs.readFile('./channels.json', 'utf8', (error, data) => {
    if (error) {
      throw error
    }

    const channels = []

    for (const channel of JSON.parse(data).channels) {
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
 * @param {object} request
 * @param {object} response
 * @param {string} method
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
 * @param {object} response
 * @param {object} res
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
 * @param {string} string
 * @param {object} words
 */
export function t(string, words = {}) {
  if (global.language !== 'en') {
    const filePath = join(__dirname, '..', 'language', `${global.language}.json`)
    const language = fs.readFileSync(filePath, 'utf8')

    string = JSON.parse(language)[string] ? JSON.parse(language)[string] : string
  }

  if (words.length > 0) {
    for (const word of words) {
      string = string.replace(/@@([a-z]*)@@/, word)
    }
  }

  return string
}

/**
 * Redirect when there is no langcode.
 *
 * @param {object} request
 * @param {object} response
 * @param {Function} next
 */
export function redirect(request, response, next) {
  if (request.params.langcode === undefined) {
    response.redirect(`/en${request.originalUrl.replace(`${request.params.langcode}/`, '')}`)
  }
  next()
}
