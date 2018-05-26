import fs from 'fs'

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
