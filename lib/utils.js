import Debug from 'debug'
import fs from 'fs'

const debug = Debug('replay')

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
export const hasError = (response, res) => {
  let error = ''

  if (res.statusCode !== 200) {
    error = Error(response.t('Request Failed.\nStatus Code: %s', res.statusCode))
  }
  else if (!/^application\/json/.test(res.headers['content-type'])) {
    error = Error(response.t('Invalid content-type.\nExpected application/json but received %s', res.headers['content-type']))
  }

  if (error) {
    debug(error.message)
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
export const getRoutes = () =>
  new Promise((resolve, reject) =>
    fs.readFile('./data/routes.json', 'utf8', (error, lines) => (
      error ? reject(error) : resolve(JSON.parse(lines))
    )))

/**
 * Get the lang codes.
 *
 * @return {Array}
 *   Array of locales.
 */
export const getLangCodes = () =>
  new Promise((resolve, reject) =>
    fs.readdir('./locales/', (error, files) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(files.map(file =>
          file.replace('.json', '')))
      }
    }))
